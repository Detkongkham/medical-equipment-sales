// Usage: pnpm tsx scripts/verify-phase4.ts   (needs the dev DB: pnpm db)
import assert from "node:assert/strict";
import nodemailer from "nodemailer";
import { sendMail } from "../src/lib/mailer";
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
