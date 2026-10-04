// Usage: pnpm tsx scripts/verify-phase4.ts   (needs the dev DB: pnpm db)
import assert from "node:assert/strict";
import nodemailer, { type Transporter } from "nodemailer";
import { sendMail } from "../src/lib/mailer";
import { db } from "../src/lib/db";
import { GET } from "../src/app/api/cron/reminders/route";
import { pmWindow, runReminders } from "../src/lib/reminders";
import { sendOrderMail } from "../src/lib/order-mail";
import { cancelOrder } from "../src/lib/shop";
import { orderMail, type OrderMailKind } from "../src/lib/mail-templates";

// Sections are queued and run in order after the file has been evaluated (no top-level await: tsx runs this as CJS).
const queue: [string, () => Promise<void>][] = [];
const section = (name: string, fn: () => Promise<void>) => void queue.push([name, fn]);
setTimeout(async () => {
  for (const [name, fn] of queue) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}`, error);
      process.exitCode = 1;
    }
  }
  process.exit();
}, 0);

const KINDS: OrderMailKind[] = ["received", "paid", "slipRejected", "fulfilled", "cancelled"];

section("mail", async () => {
  const transport = nodemailer.createTransport({ jsonTransport: true });
  assert.equal(await sendMail({ to: "a@b.co", subject: "s", text: "t" }, transport), true);
  assert.equal(await sendMail({ to: "not-an-email", subject: "s", text: "t" }, transport), false);
  assert.equal(await sendMail({ to: "a@b.co", subject: "s", text: "t" }), false); // SMTP env is unset

  const ctx = { lang: "en" as const, orderNumber: "O-2026-0001", totalLAK: 150000, url: "https://x/en/order/O-2026-0001?t=abc" };
  const received = orderMail("received", ctx);
  assert.ok(received.text.includes("O-2026-0001") && received.text.includes(ctx.url));
  assert.ok(orderMail("slipRejected", { ...ctx, reason: "blurry" }).text.includes("blurry"));
  for (const kind of KINDS) {
    const lo = orderMail(kind, { ...ctx, lang: "lo" });
    const en = orderMail(kind, ctx);
    assert.ok(lo.subject && lo.text && en.subject && en.text, kind);
    assert.notEqual(lo.text, en.text, kind);
  }
});

const tag = `verify-${Date.now()}`;

section("order-mail", async () => {
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const sent: { to: string; subject: string; text: string }[] = [];
  const spy = { sendMail: async (m: { to: string; subject: string; text: string }) => void sent.push(m) } as unknown as Transporter;
  const customer = await db.customer.create({ data: { organization: tag, contactName: "T", phone: "1", email: "buyer@example.com" } });
  const noEmail = await db.customer.create({ data: { organization: `${tag}-n`, contactName: "T", phone: "1" } });
  const mk = (customerId: string, orderNumber: string) =>
    db.order.create({ data: { orderNumber, customerId, paymentMethod: "BANK_TRANSFER", deliveryAddress: "x", totalAmountLAK: 150000, expiresAt: new Date(Date.now() + 3_600_000) } });
  const a = await mk(customer.id, `${tag}-a`);
  const b = await mk(noEmail.id, `${tag}-b`);
  try {
    assert.equal(await sendOrderMail(a.id, "received", transport), true);
    assert.equal(await sendOrderMail(a.id, "received", spy), true);
    assert.equal(sent[0].to, "buyer@example.com");
    assert.ok(sent[0].text.includes(`/lo/order/${tag}-a?t=`));
    await db.order.update({ where: { id: a.id }, data: { lang: "en" } });
    await sendOrderMail(a.id, "paid", spy);
    assert.match(sent[1].subject, /Payment confirmed/);
    assert.equal(await sendOrderMail(b.id, "received", spy), false); // no email on file
    assert.equal(await sendOrderMail("missing", "received", spy), false);
    assert.equal(await sendOrderMail(a.id, "received"), false); // SMTP unset: no throw
    assert.equal(await cancelOrder(a.id, "test"), true); // still cancels with mail unconfigured
  } finally {
    await db.order.deleteMany({ where: { id: { in: [a.id, b.id] } } });
    await db.customer.deleteMany({ where: { id: { in: [customer.id, noEmail.id] } } });
  }
});

section("reminders", async () => {
  const startedAt = new Date();
  const now = new Date("2026-06-15T00:00:00Z");
  const day = (n: number) => new Date(now.getTime() + n * 86_400_000);
  const hour = (n: number) => new Date(now.getTime() + n * 3_600_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  assert.equal(pmWindow(day(40), now), null);
  assert.equal(pmWindow(day(20), now), "30d");
  assert.equal(pmWindow(day(8), now), "30d");
  assert.equal(pmWindow(day(7), now), "7d");
  assert.equal(pmWindow(day(1), now), "7d");
  assert.equal(pmWindow(day(-1), now), "overdue");

  const sent: { channel: string; text: string }[] = [];
  const ok = async (channel: string, text: string) => (sent.push({ channel, text }), true);
  const mentions = (needle: string) => sent.filter((m) => m.text.includes(needle));

  const customer = await db.customer.create({ data: { organization: `${tag}-org`, contactName: "T", phone: "1" } });
  const product = await db.product.findFirstOrThrow();
  const equipment = await db.installedEquipment.create({ data: { customerId: customer.id, deviceModel: `${tag}-dev`, installedAt: day(-300), warrantyUntil: day(10) } });
  const sched = await db.maintenanceSchedule.create({ data: { equipmentId: equipment.id, type: "PM", intervalMonths: 6, nextDueAt: day(5) } });
  const idle = await db.maintenanceSchedule.create({ data: { equipmentId: equipment.id, type: "CALIBRATION", intervalMonths: 6, nextDueAt: day(3), isActive: false } });
  const lot = await db.stockLot.create({ data: { productId: product.id, lotNumber: `${tag}-lot`, expiryDate: day(20), receivedQty: 5, quantity: 5 } });
  const emptyLot = await db.stockLot.create({ data: { productId: product.id, lotNumber: `${tag}-empty`, expiryDate: day(20), receivedQty: 5, quantity: 0 } });
  const farLot = await db.stockLot.create({ data: { productId: product.id, lotNumber: `${tag}-far`, expiryDate: day(100), receivedQty: 5, quantity: 5 } });
  const mkOrder = (n: string, expires: Date) =>
    db.order.create({ data: { orderNumber: `${tag}-${n}`, customerId: customer.id, paymentMethod: "LAO_QR", deliveryAddress: "x", totalAmountLAK: 1000, expiresAt: expires } });
  const soon = await mkOrder("soon", hour(3));
  const later = await mkOrder("later", hour(10));
  const logKeys = [`pm:${sched.id}:7d:${iso(day(5))}`, `warranty:${equipment.id}:30d`, `lot:${lot.id}:30d`, `order:${soon.id}:6h`];
  try {
    await runReminders(now, ok);
    assert.equal(mentions(`${tag}-dev`).length, 1, "PM + warranty reach SERVICE together");
    assert.ok(sent.filter((m) => m.channel === "SERVICE").some((m) => m.text.includes(`${tag}-dev`)));
    assert.equal(mentions(`${tag}-lot`).length, 1);
    assert.equal(mentions(`${tag}-empty`).length, 0);
    assert.equal(mentions(`${tag}-far`).length, 0);
    assert.equal(mentions(`${tag}-soon`).length, 1);
    assert.equal(mentions(`${tag}-later`).length, 0);
    assert.ok(sent.filter((m) => m.channel === "SALES").every((m) => !m.text.includes(`${tag}-dev`)));

    sent.length = 0;
    await runReminders(now, ok);
    assert.equal(mentions(tag).length, 0, "second run sends nothing for the same items");

    await db.maintenanceSchedule.update({ where: { id: sched.id }, data: { nextDueAt: day(6) } }); // PM done, new due date
    await runReminders(now, ok);
    assert.equal(mentions(`${tag}-dev`).length, 1, "a new due date is announced again");
    assert.equal(await db.notificationLog.count({ where: { key: { contains: idle.id } } }), 0, "inactive schedules are never announced");

    // delivery failure: keys are removed so the next run retries
    await db.notificationLog.deleteMany({ where: { key: { in: logKeys } } });
    sent.length = 0;
    const result = await runReminders(now, async () => false);
    assert.ok(result.retried >= 1);
    assert.equal(await db.notificationLog.count({ where: { key: { in: logKeys } } }), 0);
    await runReminders(now, ok);
    assert.equal(mentions(`${tag}-lot`).length, 1, "retried after the failed run");
  } finally {
    await db.notificationLog.deleteMany({ where: { sentAt: { gte: startedAt } } }); // also real rows the fixed `now` caused
    await db.notificationLog.deleteMany({ where: { OR: [{ key: { contains: sched.id } }, { key: { contains: idle.id } }, { key: { contains: equipment.id } }, { key: { contains: lot.id } }, { key: { contains: soon.id } }, { key: { contains: later.id } }] } });
    await db.order.deleteMany({ where: { id: { in: [soon.id, later.id] } } });
    await db.stockLot.deleteMany({ where: { id: { in: [lot.id, emptyLot.id, farLot.id] } } });
    await db.maintenanceSchedule.deleteMany({ where: { equipmentId: equipment.id } });
    await db.installedEquipment.delete({ where: { id: equipment.id } });
    await db.customer.delete({ where: { id: customer.id } });
  }
});

section("cron", async () => {
  const call = (auth?: string) => GET(new Request("http://x/api/cron/reminders", { headers: auth ? { authorization: auth } : {} }));
  const previous = process.env.CRON_SECRET;
  const startedAt = new Date();
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await call("Bearer ")).status, 401);
    assert.equal((await call("Bearer undefined")).status, 401);
    process.env.CRON_SECRET = "s3cret";
    assert.equal((await call()).status, 401);
    assert.equal((await call("Bearer wrong")).status, 401);
    const res = await call("Bearer s3cret");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(typeof body.sent, "number");
  } finally {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
    await db.notificationLog.deleteMany({ where: { sentAt: { gte: startedAt } } }); // Telegram is unset in dev, so claims were released anyway
  }
});
