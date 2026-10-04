// Usage: pnpm tsx scripts/verify-phase4.ts   (needs the dev DB: pnpm db)
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { sendMail } from "../src/lib/mailer";
import { db } from "../src/lib/db";
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
  const spy = { sendMail: async (m: { to: string; subject: string; text: string }) => void sent.push(m) } as unknown as nodemailer.Transporter;
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
