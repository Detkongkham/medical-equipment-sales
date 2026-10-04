"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { back, dateInput, str } from "@/lib/form";
import { HOLD_HOURS, cancelOrder, paymentKeys } from "@/lib/shop";
import { sendOrderMail } from "@/lib/order-mail";
import { savePublicFile } from "@/lib/storage";

const ORDERS = "/admin/orders";
const STOCK = "/admin/stock";

function refresh() {
  revalidatePath(ORDERS);
  revalidatePath(STOCK);
}

/* ---------- orders ---------- */

/** Money arrived (slip checked, or paid in person). Allowed from "awaiting payment" too, for customers who pay at the counter. */
export async function confirmPayment(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const changed = await db.order.updateMany({ where: { id, status: { in: ["PENDING_PAYMENT", "PAYMENT_REVIEW"] } }, data: { status: "PAID", paidAt: new Date(), adminNote: null } });
  refresh();
  if (changed.count === 0) back(ORDERS, "error", "ສະຖານະຄຳສັ່ງຊື້ປ່ຽນໄປແລ້ວ ຢືນຢັນບໍ່ໄດ້");
  await sendOrderMail(id, "paid");
  back(ORDERS, "saved");
}

export async function rejectSlip(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const reason = str(formData, "reason");
  if (!reason) back(ORDERS, "error", "ກະລຸນາໃສ່ເຫດຜົນທີ່ສະລິບບໍ່ຜ່ານ ເພື່ອໃຫ້ລູກຄ້າເຫັນ");
  // The customer gets a fresh hold period to pay again.
  const changed = await db.order.updateMany({
    where: { id, status: "PAYMENT_REVIEW" },
    data: { status: "PENDING_PAYMENT", adminNote: reason, expiresAt: new Date(Date.now() + HOLD_HOURS * 3_600_000) },
  });
  refresh();
  if (changed.count === 0) back(ORDERS, "error", "ສະຖານະຄຳສັ່ງຊື້ປ່ຽນໄປແລ້ວ");
  await sendOrderMail(id, "slipRejected");
  back(ORDERS, "saved");
}

export async function markFulfilled(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  const changed = await db.order.updateMany({ where: { id, status: "PAID" }, data: { status: "FULFILLED", fulfilledAt: new Date() } });
  refresh();
  if (changed.count === 0) back(ORDERS, "error", "ສົ່ງມອບໄດ້ສະເພາະຄຳສັ່ງຊື້ທີ່ຊຳລະແລ້ວ");
  await sendOrderMail(id, "fulfilled");
  back(ORDERS, "saved");
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin("SALES");
  const reason = str(formData, "reason") || "ຍົກເລີກໂດຍຝ່າຍຂາຍ";
  const done = await cancelOrder(str(formData, "id"), reason);
  refresh();
  if (!done) back(ORDERS, "error", "ຍົກເລີກບໍ່ໄດ້ (ສົ່ງມອບແລ້ວ ຫຼື ຖືກຍົກເລີກແລ້ວ)");
  back(ORDERS, "saved");
}

/** Bank account / LAO QR shown to customers after they order. */
export async function savePaymentInfo(formData: FormData) {
  await requireAdmin("SALES");
  const values: Record<string, string> = {};
  for (const key of paymentKeys) if (key !== "qrImage") values[key] = str(formData, key).slice(0, 500);
  const qr = formData.get("qrFile");
  if (qr instanceof File && qr.size > 0) {
    const url = await savePublicFile(qr);
    if (!url || url.endsWith(".pdf")) back(ORDERS, "error", "ຮູບ QR ຕ້ອງເປັນ JPG, PNG ຫຼື WebP ແລະ ບໍ່ເກີນ 8 MB");
    values.qrImage = url;
  } else if (formData.get("removeQr") === "on") {
    values.qrImage = "";
  }
  await db.$transaction(
    Object.entries(values).map(([key, value]) => db.siteSetting.upsert({ where: { key: `payment.${key}` }, update: { value }, create: { key: `payment.${key}`, value } })),
  );
  revalidatePath("/", "layout");
  back(ORDERS, "saved");
}

/* ---------- stock lots ---------- */

export async function addLot(formData: FormData) {
  await requireAdmin("SALES");
  const [productId, variantId] = str(formData, "target").split(":");
  const lotNumber = str(formData, "lotNumber").slice(0, 60);
  const quantity = Number(str(formData, "quantity"));
  const expiry = dateInput(str(formData, "expiryDate"));
  if (!productId || !lotNumber) back(STOCK, "error", "ເລືອກສິນຄ້າ ແລະ ໃສ່ເລກ Lot");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1_000_000) back(STOCK, "error", "ຈຳນວນຕ້ອງເປັນເລກເຕັມ ຕັ້ງແຕ່ 1 ຂຶ້ນໄປ");
  if (expiry === undefined) back(STOCK, "error", "ວັນໝົດອາຍຸບໍ່ຖືກຕ້ອງ");

  const target = await db.product.findUnique({ where: { id: productId }, include: { variants: { select: { id: true } } } });
  if (!target) back(STOCK, "error", "ບໍ່ພົບສິນຄ້າ");
  if (target.variants.length > 0 && !target.variants.some((v) => v.id === variantId)) back(STOCK, "error", "ສິນຄ້ານີ້ມີຕົວເລືອກ ກະລຸນາເລືອກຕົວເລືອກ");
  const variant = target.variants.length > 0 ? variantId : null;
  const dup = await db.stockLot.findFirst({ where: { productId, variantId: variant, lotNumber: { equals: lotNumber, mode: "insensitive" } } });
  if (dup) back(STOCK, "error", "ມີເລກ Lot ນີ້ຂອງສິນຄ້ານີ້ແລ້ວ. ໃຊ້ “ແກ້ຈຳນວນ” ແທນ.");

  await db.stockLot.create({ data: { productId, variantId: variant, lotNumber, expiryDate: expiry, receivedQty: quantity, quantity, notes: str(formData, "notes") || null } });
  refresh();
  back(STOCK, "saved");
}

/** Manual correction of what is left in a lot (stock count, damage). Orders only ever subtract and return their own units. */
export async function setLotQuantity(formData: FormData) {
  await requireAdmin("SALES");
  const quantity = Number(str(formData, "quantity"));
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 1_000_000) back(STOCK, "error", "ຈຳນວນບໍ່ຖືກຕ້ອງ");
  await db.stockLot.update({ where: { id: str(formData, "id") }, data: { quantity } });
  refresh();
  back(STOCK, "saved");
}

export async function deleteLot(formData: FormData) {
  await requireAdmin("SALES");
  const id = str(formData, "id");
  if ((await db.orderAllocation.count({ where: { lotId: id } })) > 0) back(STOCK, "error", "Lot ນີ້ຢູ່ໃນຄຳສັ່ງຊື້ ລຶບບໍ່ໄດ້ (ແກ້ຈຳນວນເປັນ 0 ແທນ)");
  await db.stockLot.delete({ where: { id } });
  refresh();
  back(STOCK, "saved");
}
