"use server";

import { CustomerType, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { shareToken, validShareToken } from "@/lib/auth";
import { findOrCreateCustomer } from "@/lib/customers";
import { db } from "@/lib/db";
import { notify } from "@/lib/notify";
import { isUniqueViolation, nextNumber } from "@/lib/numbering";
import { formatLAK } from "@/lib/pricing";
import { HOLD_HOURS, StockError, allocateStock, getPaymentInfo, paymentReady, priceCart, releaseExpiredOrders, type OrderInput, type PricedLine } from "@/lib/shop";
import { checkFiles, saveFiles } from "@/lib/storage";

export type OrderState = { ok: boolean; number?: string; token?: string; error?: "required" | "emptyCart" | "stock" | "priceChanged" | "unavailable" | "failed" };
export type SlipState = { ok: boolean; error?: "files" | "closed" | "failed" };

const itemsSchema = z.array(z.object({ productId: z.string(), variantId: z.string().optional(), qty: z.number().int().min(1).max(9999) })).max(100);

/** Server-side view of the cart for the cart page: current names, prices and stock. */
export async function previewCart(raw: OrderInput[]): Promise<PricedLine[]> {
  const items = itemsSchema.safeParse(raw);
  if (!items.success) return [];
  await releaseExpiredOrders();
  return priceCart(items.data);
}

const text = (max: number) => z.string().trim().max(max);
const orderSchema = z.object({
  organization: text(200).min(1),
  type: z.enum(CustomerType),
  contactName: text(120).min(1),
  phone: text(40).min(1),
  whatsapp: text(40).optional().transform((v) => v || undefined),
  email: text(120).optional().transform((v) => v || undefined),
  deliveryAddress: text(500).min(1),
  note: text(2000).optional().transform((v) => v || undefined),
  paymentMethod: z.enum(PaymentMethod),
  expectedTotal: z.coerce.number(),
  items: z.string(),
});

export async function submitOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  if (formData.get("website")) return { ok: true, number: "O-0000" };
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") fields[key] = value;
  const parsed = orderSchema.safeParse(fields);
  if (!parsed.success) return { ok: false, error: "required" };
  let items: z.infer<typeof itemsSchema>;
  try {
    items = itemsSchema.parse(JSON.parse(parsed.data.items));
  } catch {
    return { ok: false, error: "emptyCart" };
  }
  if (items.length === 0) return { ok: false, error: "emptyCart" };

  try {
    if (!paymentReady(await getPaymentInfo())) return { ok: false, error: "unavailable" };
    await releaseExpiredOrders();
    const lines = await priceCart(items);
    if (lines.length !== new Set(items.map((i) => `${i.productId}:${i.variantId ?? ""}`)).size) return { ok: false, error: "priceChanged" };
    if (lines.some((l) => !l.ok)) return { ok: false, error: "stock" };
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
    if (total !== parsed.data.expectedTotal) return { ok: false, error: "priceChanged" };

    const d = parsed.data;
    const crm = await findOrCreateCustomer({ organization: d.organization, type: d.type, contactName: d.contactName, phone: d.phone, whatsapp: d.whatsapp, email: d.email, address: d.deliveryAddress });
    for (let attempt = 0; ; attempt++) {
      const orderNumber = await nextNumber("O", async (startsWith) => (await db.order.findFirst({ where: { orderNumber: { startsWith } }, orderBy: { orderNumber: "desc" } }))?.orderNumber);
      try {
        const order = await db.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              orderNumber, customerId: crm.id, paymentMethod: d.paymentMethod, deliveryAddress: d.deliveryAddress, note: d.note,
              totalAmountLAK: total, expiresAt: new Date(Date.now() + HOLD_HOURS * 3_600_000),
            },
          });
          for (const line of lines) {
            const item = await tx.orderItem.create({
              data: {
                orderId: created.id, productId: line.productId, variantId: line.variantId, quantity: line.qty, unitPrice: line.unitPrice,
                title: line.variant ? `${line.title} – ${line.variant}` : line.title,
              },
            });
            await allocateStock(tx, item.id, line.productId, line.variantId ?? null, line.qty);
          }
          return created;
        });
        await notify("SALES", [`ຄຳສັ່ງຊື້ໃໝ່ ${orderNumber}`, `${d.organization} · ${d.contactName} · ${d.phone}`, `ຍອດ ${formatLAK(total)} · ${d.paymentMethod === "LAO_QR" ? "LAO QR" : "ໂອນທະນາຄານ"}`, ...lines.map((l) => `• ${l.title}${l.variant ? ` – ${l.variant}` : ""} × ${l.qty}`)].join("\n"));
        return { ok: true, number: orderNumber, token: shareToken("order", order.id) };
      } catch (error) {
        if (error instanceof StockError) return { ok: false, error: "stock" };
        if (!isUniqueViolation(error) || attempt >= 3) throw error;
      }
    }
  } catch (error) {
    console.error("submitOrder failed", error);
    return { ok: false, error: "failed" };
  }
}

/** The customer uploads a transfer slip from the order link. The link's token proves they placed the order. */
export async function uploadSlip(_prev: SlipState, formData: FormData): Promise<SlipState> {
  const number = String(formData.get("number") ?? "");
  const token = String(formData.get("token") ?? "");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0 || checkFiles(files) !== "ok") return { ok: false, error: "files" };
  try {
    const order = await db.order.findUnique({ where: { orderNumber: number }, include: { customer: true } });
    if (!order || !validShareToken("order", order.id, token)) return { ok: false, error: "closed" };
    if (order.status !== "PENDING_PAYMENT" && order.status !== "PAYMENT_REVIEW") return { ok: false, error: "closed" };
    if (order.status === "PENDING_PAYMENT" && order.expiresAt < new Date()) return { ok: false, error: "closed" };
    const urls = await saveFiles(files, "orders");
    await db.order.update({ where: { id: order.id }, data: { status: "PAYMENT_REVIEW", slipUrls: { push: urls }, slipUploadedAt: new Date(), adminNote: null } });
    await notify("SALES", [`ສະລິບໂອນເງິນ ${order.orderNumber}`, `${order.customer.organization} · ${formatLAK(order.totalAmountLAK)}`, "ກະລຸນາກວດ ແລະ ຢືນຢັນໃນຫຼັງບ້ານ."].join("\n"));
    revalidatePath(`/lo/order/${number}`);
    revalidatePath(`/en/order/${number}`);
    return { ok: true };
  } catch (error) {
    console.error("uploadSlip failed", error);
    return { ok: false, error: "failed" };
  }
}
