import { db } from "./db";
import { notify } from "./notify";
import { isUniqueViolation } from "./numbering";

type Channel = "SALES" | "SERVICE";
type Send = (channel: Channel, text: string) => Promise<boolean>;
type Item = { channel: Channel; section: string; key: string; line: string };

const DAY = 86_400_000;
const HOUR = 3_600_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

const SECTIONS = {
  pm: "ບຳລຸງຮັກສາ / Calibration",
  warranty: "ການຮັບປະກັນໃກ້ໝົດ",
  lot: "Lot ໃກ້ໝົດອາຍຸ",
  order: "ຄຳສັ່ງຊື້ໃກ້ໝົດເວລາຊຳລະ",
};

/** Which reminder window a maintenance due date is in right now (null = not yet within 30 days). */
export function pmWindow(nextDueAt: Date, now: Date): "30d" | "7d" | "overdue" | null {
  const days = (nextDueAt.getTime() - now.getTime()) / DAY;
  if (days < 0) return "overdue";
  if (days <= 7) return "7d";
  if (days <= 30) return "30d";
  return null;
}

async function collect(now: Date): Promise<Item[]> {
  const items: Item[] = [];

  const schedules = await db.maintenanceSchedule.findMany({
    where: { isActive: true, nextDueAt: { lte: new Date(now.getTime() + 30 * DAY) } },
    include: { equipment: { include: { customer: true } } },
  });
  for (const s of schedules) {
    const window = pmWindow(s.nextDueAt, now);
    if (!window) continue;
    items.push({
      channel: "SERVICE",
      section: SECTIONS.pm,
      key: `pm:${s.id}:${window}:${iso(s.nextDueAt)}`,
      line: `• ${s.type} ${s.equipment.deviceModel} · ${s.equipment.customer.organization} · ${window === "overdue" ? "ເກີນກຳນົດ" : "ຄົບ"} ${iso(s.nextDueAt)}`,
    });
  }

  const equipment = await db.installedEquipment.findMany({
    where: { warrantyUntil: { gte: now, lte: new Date(now.getTime() + 30 * DAY) } },
    include: { customer: true },
  });
  for (const e of equipment) {
    items.push({ channel: "SERVICE", section: SECTIONS.warranty, key: `warranty:${e.id}:30d`, line: `• ${e.deviceModel} · ${e.customer.organization} · ໝົດ ${iso(e.warrantyUntil)}` });
  }

  const lots = await db.stockLot.findMany({
    where: { quantity: { gt: 0 }, expiryDate: { gte: now, lte: new Date(now.getTime() + 60 * DAY) } },
    include: { product: { select: { titleLao: true } } },
  });
  for (const lot of lots) {
    const window = lot.expiryDate!.getTime() - now.getTime() <= 30 * DAY ? "30d" : "60d";
    items.push({ channel: "SALES", section: SECTIONS.lot, key: `lot:${lot.id}:${window}`, line: `• ${lot.product.titleLao} · Lot ${lot.lotNumber} · ເຫຼືອ ${lot.quantity} · ໝົດອາຍຸ ${iso(lot.expiryDate!)}` });
  }

  const orders = await db.order.findMany({
    where: { status: "PENDING_PAYMENT", expiresAt: { gte: now, lte: new Date(now.getTime() + 6 * HOUR) } },
    include: { customer: true },
  });
  for (const o of orders) {
    items.push({ channel: "SALES", section: SECTIONS.order, key: `order:${o.id}:6h`, line: `• ${o.orderNumber} · ${o.customer.organization} · ${o.customer.phone}` });
  }
  return items;
}

/**
 * Finds due reminders and sends one summary message per channel, containing only items not announced before.
 * Each item is claimed in NotificationLog first; if delivery fails the claims are removed so the next run retries.
 */
export async function runReminders(now = new Date(), send: Send = notify) {
  const result = { sent: 0, skipped: 0, retried: 0 };
  const fresh: Item[] = [];
  for (const item of await collect(now)) {
    try {
      await db.notificationLog.create({ data: { key: item.key } });
      fresh.push(item);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      result.skipped += 1;
    }
  }

  for (const channel of ["SERVICE", "SALES"] as const) {
    const mine = fresh.filter((i) => i.channel === channel);
    if (mine.length === 0) continue;
    const sections = [...new Set(mine.map((i) => i.section))];
    const text = ["ແຈ້ງເຕືອນອັດຕະໂນມັດ", ...sections.flatMap((s) => ["", s, ...mine.filter((i) => i.section === s).map((i) => i.line)])].join("\n");
    let delivered = false;
    try {
      delivered = await send(channel, text);
    } catch (error) {
      console.error("Reminder delivery failed", error);
    }
    if (delivered) result.sent += mine.length;
    else {
      await db.notificationLog.deleteMany({ where: { key: { in: mine.map((i) => i.key) } } });
      result.retried += mine.length;
    }
  }
  return result;
}
