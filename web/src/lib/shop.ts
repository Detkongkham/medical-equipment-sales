import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { sendOrderMail } from "./order-mail";
import { getShowPrices } from "./pricing";

/** Unpaid orders keep their stock reserved for this long, then are cancelled and the stock goes back. */
export const HOLD_HOURS = 48;

/** Medicines are never sold online (regulated): RFQ only, whatever the product's own setting says. */
export const RFQ_ONLY_CATEGORY = "pharmaceuticals";

export class StockError extends Error {}

export type OrderInput = { productId: string; variantId?: string; qty: number };
export type PricedLine = {
  key: string;
  productId: string;
  variantId?: string;
  title: string;
  variant?: string;
  qty: number;
  unitPrice: number;
  available: number;
  /** false when the line cannot be bought now (not for sale online, no price, or not enough stock). */
  ok: boolean;
};

const unexpired = (now: Date): Prisma.StockLotWhereInput => ({ quantity: { gt: 0 }, OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] });

/** Units that can be sold now for a product (or one of its variants): unexpired lots only. */
export async function availableStock(productId: string, variantId: string | null, now = new Date()) {
  const sum = await db.stockLot.aggregate({ _sum: { quantity: true }, where: { productId, variantId, ...unexpired(now) } });
  return sum._sum.quantity ?? 0;
}

/** Look the cart up in the catalog. Prices come from here, never from the browser. Lines that cannot be sold are dropped. */
export async function priceCart(items: OrderInput[]): Promise<PricedLine[]> {
  if (items.length === 0 || !(await getShowPrices())) return [];
  const products = await db.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      isPublished: true,
      salesMode: "DIRECT_BUY",
      showPrice: true,
      category: { slug: { not: RFQ_ONLY_CATEGORY }, OR: [{ parentId: null }, { parent: { slug: { not: RFQ_ONLY_CATEGORY } } }] },
    },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const merged = new Map<string, OrderInput>();
  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const prev = merged.get(key);
    merged.set(key, prev ? { ...prev, qty: prev.qty + item.qty } : item);
  }

  const lines: PricedLine[] = [];
  for (const [key, item] of merged) {
    const product = byId.get(item.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === item.variantId);
    if (product.variants.length > 0 && !variant) continue;
    const unitPrice = variant ? variant.priceLAK : product.priceLAK;
    if (unitPrice == null || Number(unitPrice) <= 0) continue;
    const available = await availableStock(product.id, variant?.id ?? null);
    lines.push({
      key, productId: product.id, variantId: variant?.id, title: product.titleLao, variant: variant?.nameLao,
      qty: item.qty, unitPrice: Number(unitPrice), available, ok: available >= item.qty,
    });
  }
  return lines;
}

/** Take `qty` units for an order item, earliest expiry first (FEFO). Throws StockError, which rolls the transaction back. */
export async function allocateStock(tx: Prisma.TransactionClient, orderItemId: string, productId: string, variantId: string | null, qty: number) {
  const now = new Date();
  const lots = await tx.stockLot.findMany({
    where: { productId, variantId, ...unexpired(now) },
    orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });
  let left = qty;
  for (const lot of lots) {
    if (left === 0) break;
    const take = Math.min(left, lot.quantity);
    // The guard makes a concurrent order that took the same units fail instead of driving stock below zero.
    const updated = await tx.stockLot.updateMany({ where: { id: lot.id, quantity: { gte: take } }, data: { quantity: { decrement: take } } });
    if (updated.count === 0) throw new StockError();
    await tx.orderAllocation.create({ data: { orderItemId, lotId: lot.id, quantity: take } });
    left -= take;
  }
  if (left > 0) throw new StockError();
}

/** Put every unit of an order back into its lots. Allocations are deleted so a second call cannot return them twice. */
async function returnStock(tx: Prisma.TransactionClient, orderId: string) {
  const allocations = await tx.orderAllocation.findMany({ where: { orderItem: { orderId } } });
  for (const a of allocations) await tx.stockLot.update({ where: { id: a.lotId }, data: { quantity: { increment: a.quantity } } });
  await tx.orderAllocation.deleteMany({ where: { id: { in: allocations.map((a) => a.id) } } });
}

/** Cancel an order that is not yet delivered and return its stock. Returns false when it was already cancelled or delivered. */
export async function cancelOrder(orderId: string, reason: string) {
  const cancelled = await db.$transaction(async (tx) => {
    const changed = await tx.order.updateMany({
      where: { id: orderId, status: { in: ["PENDING_PAYMENT", "PAYMENT_REVIEW", "PAID"] } },
      data: { status: "CANCELLED", adminNote: reason },
    });
    if (changed.count === 0) return false;
    await returnStock(tx, orderId);
    return true;
  });
  if (cancelled) await sendOrderMail(orderId, "cancelled"); // outside the transaction; also covers automatic expiry
  return cancelled;
}

/** Cancel unpaid orders whose hold ran out. Called whenever orders or stock are read, so no scheduler is needed. */
export async function releaseExpiredOrders() {
  const expired = await db.order.findMany({ where: { status: "PENDING_PAYMENT", expiresAt: { lt: new Date() } }, select: { id: true } });
  for (const { id } of expired) await cancelOrder(id, "ໝົດເວລາຊຳລະ (ລະບົບຍົກເລີກອັດຕະໂນມັດ)");
}

/* ---------- payment details shown to customers (edited in Admin > Orders) ---------- */

export const paymentKeys = ["bankName", "accountName", "accountNumber", "qrImage", "note"] as const;
export type PaymentInfo = Record<(typeof paymentKeys)[number], string>;

export async function getPaymentInfo(): Promise<PaymentInfo> {
  const rows = await db.siteSetting.findMany({ where: { key: { in: paymentKeys.map((k) => `payment.${k}`) } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return Object.fromEntries(paymentKeys.map((k) => [k, map.get(`payment.${k}`) ?? ""])) as PaymentInfo;
}

/** Online ordering needs somewhere to send the money: either a bank account or a LAO QR image. */
export const paymentReady = (info: PaymentInfo) => Boolean(info.qrImage || (info.accountNumber && info.accountName));
