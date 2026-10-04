"use server";

import { MaintenanceType, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMonths, back, dateInput, str, strOrNull } from "@/lib/form";

const isTechnician = (userId: string | null) =>
  userId ? db.adminUser.findFirst({ where: { id: userId, isActive: true, role: { in: ["TECHNICIAN", "ADMIN"] } } }) : Promise.resolve(null);

/** Status, assignee, equipment link and an optional note, all in one save. A log row is written whenever something changed. */
export async function updateTicket(formData: FormData) {
  const user = await requireAdmin("TECHNICIAN");
  const id = str(formData, "id");
  const status = z.enum(TicketStatus).parse(str(formData, "status"));
  const ticket = await db.serviceTicket.findUnique({ where: { id } });
  if (!ticket) back("/admin/tickets", "error", "ບໍ່ພົບໃບແຈ້ງສ້ອມ");

  const assignedToId = strOrNull(formData, "assignedToId");
  if (assignedToId && !(await isTechnician(assignedToId))) back("/admin/tickets", "error", "ຊ່າງທີ່ເລືອກບໍ່ຖືກຕ້ອງ");
  const equipmentId = strOrNull(formData, "equipmentId");
  if (equipmentId && !(await db.installedEquipment.findFirst({ where: { id: equipmentId, customerId: ticket.customerId } }))) {
    back("/admin/tickets", "error", "ເຄື່ອງທີ່ເລືອກບໍ່ແມ່ນຂອງລູກຄ້າຄົນນີ້");
  }
  const note = strOrNull(formData, "note");

  const statusChanged = status !== ticket.status;
  const assigneeChanged = assignedToId !== ticket.assignedToId;
  const logNote = [note, assigneeChanged ? (assignedToId ? "ມອບໝາຍຊ່າງ" : "ຍົກເລີກການມອບໝາຍ") : null].filter(Boolean).join(" — ") || (statusChanged ? "ປ່ຽນສະຖານະ" : "");
  await db.$transaction([
    db.serviceTicket.update({ where: { id }, data: { status, assignedToId, equipmentId } }),
    ...(logNote ? [db.serviceLog.create({ data: { ticketId: id, authorId: user.id, status: statusChanged ? status : null, note: logNote } })] : []),
  ]);
  revalidatePath("/admin/tickets");
  back("/admin/tickets", "saved");
}

const equipmentSchema = z.object({
  customerId: z.string().min(1),
  deviceModel: z.string().min(1).max(200),
  warrantyMonths: z.coerce.number().int().min(0).max(120),
});

export async function saveEquipment(formData: FormData) {
  await requireAdmin("SALES", "TECHNICIAN");
  const id = str(formData, "id");
  const returnTo = str(formData, "returnTo");
  const target = /^\/admin\/(customers|equipment)(\/[\w-]+)?$/.test(returnTo) ? returnTo : "/admin/equipment";
  const parsed = equipmentSchema.safeParse({ customerId: str(formData, "customerId"), deviceModel: str(formData, "deviceModel"), warrantyMonths: str(formData, "warrantyMonths") || "12" });
  const installedAt = dateInput(str(formData, "installedAt"));
  if (!parsed.success || !installedAt) back(target, "error", "ກະລຸນາໃສ່ລຸ້ນເຄື່ອງ, ວັນຕິດຕັ້ງ ແລະ ເດືອນຮັບປະກັນ (0 – 120)");
  const data = {
    customerId: parsed.data.customerId,
    productId: strOrNull(formData, "productId"),
    deviceModel: parsed.data.deviceModel,
    serialNumber: strOrNull(formData, "serialNumber"),
    location: strOrNull(formData, "location"),
    installedAt,
    warrantyMonths: parsed.data.warrantyMonths,
    warrantyUntil: addMonths(installedAt, parsed.data.warrantyMonths),
    notes: strOrNull(formData, "notes"),
  };
  const saved = id ? await db.installedEquipment.update({ where: { id }, data }) : await db.installedEquipment.create({ data });
  revalidatePath("/admin", "layout");
  back(id ? target : `/admin/equipment/${saved.id}`, "saved");
}

export async function deleteEquipment(formData: FormData) {
  await requireAdmin("SALES", "TECHNICIAN");
  await db.installedEquipment.delete({ where: { id: str(formData, "id") } });
  revalidatePath("/admin", "layout");
  back("/admin/equipment", "saved");
}

export async function addSchedule(formData: FormData) {
  await requireAdmin("SALES", "TECHNICIAN");
  const equipmentId = str(formData, "equipmentId");
  const page = `/admin/equipment/${equipmentId}`;
  const type = z.enum(MaintenanceType).safeParse(str(formData, "type"));
  const interval = Number(str(formData, "intervalMonths"));
  const firstDue = dateInput(str(formData, "nextDueAt"));
  if (!type.success || !Number.isInteger(interval) || interval < 1 || interval > 120) back(page, "error", "ກະລຸນາເລືອກປະເພດ ແລະ ຄາບເວລາ 1 – 120 ເດືອນ");
  if (firstDue === undefined) back(page, "error", "ວັນທີບໍ່ຖືກຕ້ອງ");
  const assignedToId = strOrNull(formData, "assignedToId");
  if (assignedToId && !(await isTechnician(assignedToId))) back(page, "error", "ຊ່າງທີ່ເລືອກບໍ່ຖືກຕ້ອງ");
  await db.maintenanceSchedule.create({
    data: { equipmentId, type: type.data, intervalMonths: interval, nextDueAt: firstDue ?? addMonths(new Date(), interval), assignedToId },
  });
  revalidatePath("/admin", "layout");
  back(page, "saved");
}

/** Records the visit and moves the next due date one interval ahead of the day it was actually done. */
export async function completeMaintenance(formData: FormData) {
  const user = await requireAdmin("TECHNICIAN");
  const id = str(formData, "id");
  const returnTo = str(formData, "returnTo") === "equipment" ? "equipment" : "maintenance";
  const schedule = await db.maintenanceSchedule.findUnique({ where: { id } });
  if (!schedule) back("/admin/maintenance", "error", "ບໍ່ພົບນັດບຳລຸງຮັກສາ");
  const doneAt = dateInput(str(formData, "doneAt")) ?? new Date();
  await db.$transaction([
    db.maintenanceRecord.create({ data: { scheduleId: id, doneAt, doneById: user.id, note: strOrNull(formData, "note") } }),
    db.maintenanceSchedule.update({ where: { id }, data: { nextDueAt: addMonths(doneAt, schedule.intervalMonths) } }),
  ]);
  revalidatePath("/admin", "layout");
  back(returnTo === "equipment" ? `/admin/equipment/${schedule.equipmentId}` : "/admin/maintenance", "saved");
}

export async function setScheduleActive(formData: FormData) {
  await requireAdmin("SALES", "TECHNICIAN");
  const schedule = await db.maintenanceSchedule.update({ where: { id: str(formData, "id") }, data: { isActive: formData.get("active") === "1" } });
  revalidatePath("/admin", "layout");
  back(`/admin/equipment/${schedule.equipmentId}`, "saved");
}
