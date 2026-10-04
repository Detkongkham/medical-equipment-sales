"use server";

import { PriceTier, QuoteStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMonths, all, back, dateInput, money, str, strOrNull } from "@/lib/form";
import { itemTierPrice } from "@/lib/pricing";

const quoteInclude = { items: { include: { product: true, variant: true } }, customer: true } as const;

/** Fill every line's unit price from the catalog for the chosen tier (sales can still edit each price afterwards). */
export async function applyTierPrices(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const tier = z.enum(PriceTier).parse(str(formData, "tier"));
  const quote = await db.quotation.findUnique({ where: { id }, include: quoteInclude });
  if (!quote) back("/admin/quotes", "error", "ບໍ່ພົບໃບສະເໜີ");
  await db.$transaction([
    ...quote.items.map((item) => db.quotationItem.update({ where: { id: item.id }, data: { unitPrice: itemTierPrice(item.product, item.variant, tier) } })),
    db.quotation.update({ where: { id }, data: { priceTier: tier, status: quote.status === "PENDING" ? "REVIEWING" : undefined } }),
  ]);
  revalidatePath(`/admin/quotes/${id}`);
  back(`/admin/quotes/${id}`, "saved");
}

export async function saveQuotation(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const page = `/admin/quotes/${id}`;
  const quote = await db.quotation.findUnique({ where: { id }, include: { items: true } });
  if (!quote) back("/admin/quotes", "error", "ບໍ່ພົບໃບສະເໜີ");

  const itemIds = all(formData, "itemId");
  const prices = all(formData, "unitPrice").map(money);
  const quantities = all(formData, "quantity").map(Number);
  if (prices.some((p) => p === undefined)) back(page, "error", "ລາຄາບໍ່ຖືກຕ້ອງ");
  if (quantities.some((q) => !Number.isInteger(q) || q < 1 || q > 9999)) back(page, "error", "ຈຳນວນຕ້ອງເປັນເລກເຕັມ 1 – 9999");
  const discount = money(str(formData, "discountLAK"));
  const validUntil = dateInput(str(formData, "validUntil"));
  if (discount === undefined) back(page, "error", "ສ່ວນຫຼຸດບໍ່ຖືກຕ້ອງ");
  if (validUntil === undefined) back(page, "error", "ວັນໝົດອາຍຸບໍ່ຖືກຕ້ອງ");

  const own = new Set(quote.items.map((i) => i.id));
  const lines = itemIds.map((itemId, i) => ({ itemId, unitPrice: prices[i] ?? null, quantity: quantities[i] })).filter((l) => own.has(l.itemId));
  const subtotal = lines.reduce((sum, l) => sum + (l.unitPrice ?? 0) * l.quantity, 0);
  if ((discount ?? 0) > subtotal) back(page, "error", "ສ່ວນຫຼຸດຫຼາຍກວ່າຍອດລວມ");
  const tier = z.enum(PriceTier).safeParse(str(formData, "tier"));

  await db.$transaction([
    ...lines.map((l) => db.quotationItem.update({ where: { id: l.itemId }, data: { unitPrice: l.unitPrice, quantity: l.quantity } })),
    db.quotation.update({
      where: { id },
      data: {
        discountLAK: discount, validUntil, terms: strOrNull(formData, "terms"), priceTier: tier.success ? tier.data : null,
        totalAmountLAK: subtotal - (discount ?? 0),
        status: quote.status === "PENDING" ? "REVIEWING" : undefined,
      },
    }),
  ]);
  revalidatePath(page);
  back(page, "saved");
}

/** Marks the quotation as sent. Called when sales pressed the WhatsApp / email link, so the link is live and the status is QUOTED. */
export async function markQuoteSent(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const page = `/admin/quotes/${id}`;
  const quote = await db.quotation.findUnique({ where: { id }, include: { items: true } });
  if (!quote) back("/admin/quotes", "error", "ບໍ່ພົບໃບສະເໜີ");
  if (quote.items.some((i) => i.unitPrice == null)) back(page, "error", "ຍັງມີລາຍການທີ່ບໍ່ມີລາຄາ. ໃສ່ລາຄາໃຫ້ຄົບກ່ອນສົ່ງ.");
  await db.quotation.update({
    where: { id },
    data: { sentAt: quote.sentAt ?? new Date(), validUntil: quote.validUntil ?? addMonths(new Date(), 1), status: quote.status === "APPROVED" || quote.status === "CLOSED" ? undefined : QuoteStatus.QUOTED },
  });
  revalidatePath(page);
  back(page, "saved");
}

export async function saveCustomer(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const page = `/admin/customers/${id}`;
  const parsed = z
    .object({
      organization: z.string().min(1).max(200),
      type: z.enum(["HOSPITAL", "CLINIC", "DEALER", "GOVERNMENT", "INDIVIDUAL"]),
      contactName: z.string().min(1).max(120),
      phone: z.string().min(1).max(40),
    })
    .safeParse({ organization: str(formData, "organization"), type: str(formData, "type"), contactName: str(formData, "contactName"), phone: str(formData, "phone") });
  if (!parsed.success) back(page, "error", "ກະລຸນາໃສ່ຊື່ອົງກອນ, ຜູ້ຕິດຕໍ່ ແລະ ເບີໂທ");
  await db.customer.update({
    where: { id },
    data: { ...parsed.data, whatsapp: strOrNull(formData, "whatsapp"), email: strOrNull(formData, "email"), address: strOrNull(formData, "address"), notes: strOrNull(formData, "notes") },
  });
  revalidatePath(page);
  back(page, "saved");
}
