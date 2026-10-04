# Phase 4 – Customer Email & Automatic Reminders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Email customers at each order step and push Telegram reminders to the team for due PM/Calibration, warranties, expiring lots and expiring unpaid orders.

**Architecture:** A no-op-when-unconfigured SMTP mailer (nodemailer) plus bilingual plain-text templates, called from `cancelOrder` and the order actions. A `runReminders(now)` function deduplicated through a `NotificationLog` table, triggered by a secret-protected cron route. All sending is best-effort and never fails a request.

**Tech Stack:** Next.js 16 (app router, server actions), Prisma 6 / Postgres, zod, nodemailer, tsx scripts (the repo has no test framework; verification = `tsx` scripts using `node:assert`, run against the dev DB as in Phase 3).

**Spec:** [docs/superpowers/specs/2026-10-05-phase4-notifications-design.md](../specs/2026-10-05-phase4-notifications-design.md)

All paths below are relative to `web/` unless they start with `docs/`. Run commands from `web/`.

## Global Constraints

- Package manager is **pnpm only**; add deps with `pnpm add`.
- Env vars: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, CRON_SECRET`. Any SMTP var missing → mailer is a no-op. Missing/blank `CRON_SECRET` → cron route always 401.
- Mail timeout 8 s; every send wrapped in try/catch; never throws to callers.
- Customer email is optional; no email → skip silently. Language = `Order.lang` (`"lo"` default, or `"en"`).
- Reminder windows (exact): PM/Calibration due in ≤30 d and >7 d → `30d`; ≤7 d and ≥0 → `7d`; past due → `overdue`. Warranty ends within 30 d. Lots with `quantity>0` and `expiryDate` within 60 d (`60d`) and 30 d (`30d`). Unpaid `PENDING_PAYMENT` orders with `expiresAt` within 6 h (`6h`).
- Routing: PM, warranty → `notify("SERVICE")`; lot, order → `notify("SALES")`. One summary message per channel per run, containing only newly-logged items.
- Dedup keys (exact): `pm:<scheduleId>:<window>:<nextDueAt as YYYY-MM-DD>`, `warranty:<equipmentId>:30d`, `lot:<lotId>:<60d|30d>`, `order:<orderId>:6h`.
- Existing UI/log copy is Lao; code, identifiers and comments follow the surrounding style (English comments, Lao user-facing strings).
- Out of scope: DNS/MX/Blogger/Search Console changes, payment gateway, R2/S3, delivery fee, RFQ/quotation email.

## Review Focus

1. Customer without an email, or with a malformed one → order still succeeds, no mail attempt/crash (test in Task 3).
2. SMTP down/unset during `submitOrder` / status change → request still succeeds (Task 1, Task 3).
3. Cron called twice in a row → second run sends nothing (Task 4).
4. PM done and `nextDueAt` moved → reminders fire again for the new date (Task 4).
5. Telegram unconfigured or failing → dedup keys removed so the item is retried next run, not lost (Task 4).
6. Cron called without/with wrong secret, or `CRON_SECRET` unset → 401, nothing sent (Task 5).

---

### Task 1: Mailer and templates

**Files:**
- Create: `src/lib/mailer.ts`, `src/lib/mail-templates.ts`, `scripts/verify-phase4.ts` (this task adds the mail section; later tasks append sections)
- Modify: `package.json` (via `pnpm add nodemailer` and `pnpm add -D @types/nodemailer`), `.env.example`

**Interfaces:**
- Produces:
  - `sendMail(msg: { to: string; subject: string; text: string }, transport?: Transporter): Promise<boolean>` – `true` if handed to SMTP, `false` if unconfigured/invalid `to`/failed. The optional `transport` is for tests (`nodemailer.createTransport({ jsonTransport: true })`).
  - `type OrderMailKind = "received" | "paid" | "slipRejected" | "fulfilled" | "cancelled"`
  - `orderMail(kind: OrderMailKind, ctx: { lang: "lo" | "en"; orderNumber: string; totalLAK: number; url: string; reason?: string }): { subject: string; text: string }`

- [ ] **Step 1: Write failing checks** in `scripts/verify-phase4.ts` (use `node:assert/strict`; one `section("mail", async () => {...})` helper that prints PASS/FAIL and sets `process.exitCode`): with a jsonTransport, `sendMail({to:"a@b.co",subject:"s",text:"t"}, t)` returns `true` and the transport's captured message has `to`/`subject`; `sendMail({to:"not-an-email",...}, t)` returns `false`; with no SMTP env and no transport, returns `false`; `orderMail("received", {lang:"en", orderNumber:"O-2026-0001", totalLAK:150000, url:"https://x/en/order/O-2026-0001?t=abc"})` text contains the order number and the url; `orderMail("slipRejected", {..., reason:"blurry"})` contains `blurry`; every kind × both langs returns non-empty subject and text, and `lo` text differs from `en` text.
- [ ] **Step 2: Run** `pnpm tsx scripts/verify-phase4.ts` → FAIL (modules missing).
- [ ] **Step 3: Implement** `sendMail` in `src/lib/mailer.ts`: lazily build one transporter from env (secure when port 465), 8000 ms `connectionTimeout`/`socketTimeout`, `from: process.env.MAIL_FROM`; validate `to` with a simple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; catch and `console.error("Mail failed", error)`.
- [ ] **Step 4: Implement** `orderMail` in `src/lib/mail-templates.ts` as a lookup table `{ lo, en } × kind` of subject/text builders; plain text only; include company name from `site` in `src/lib/site.ts`; `received` also says to follow payment instructions at the link; `cancelled`/`slipRejected` append `reason` when given. Format money with the existing `formatLAK` (find it with `grep -rn "export function formatLAK" src`).
- [ ] **Step 5: Add** the six env vars (blank) to `.env.example` under a `# Email & cron` comment.
- [ ] **Step 6: Run** the script → PASS. Run `pnpm tsc --noEmit` and `pnpm lint`.
- [ ] **Step 7: Commit** `feat: SMTP mailer and bilingual order email templates`.

### Task 2: Schema – `Order.lang` and `NotificationLog`

**Files:**
- Modify: `prisma/schema.prisma`
- Create: migration via `pnpm db:migrate --name phase4_notifications`

**Interfaces:**
- Produces: `Order.lang String @default("lo")`; `model NotificationLog { id String @id @default(cuid()); key String @unique; sentAt DateTime @default(now()) }`.

- [ ] **Step 1:** Edit the schema as above. (Dev DB must be running: `pnpm db`.)
- [ ] **Step 2:** Run `pnpm db:migrate --name phase4_notifications`; confirm the migration SQL only adds the column (with default) and the new table; run `pnpm prisma generate`.
- [ ] **Step 3:** `pnpm tsc --noEmit` passes.
- [ ] **Step 4: Commit** `feat: Order.lang and NotificationLog tables`.

### Task 3: Order emails wired into the order flow

**Files:**
- Create: `src/lib/order-mail.ts`
- Modify: `src/lib/shop.ts` (`cancelOrder`), `src/app/order-actions.ts` (`submitOrder`, schema), `src/components/CartView.tsx`, `src/app/admin/shop-actions.ts` (`confirmPayment`, `rejectSlip`, `markFulfilled`), `scripts/verify-phase4.ts`

**Interfaces:**
- Consumes: `sendMail`, `orderMail` (Task 1); `Order.lang` (Task 2); `shareToken("order", id)` from `src/lib/auth.ts`; `site.url`.
- Produces: `sendOrderMail(orderId: string, kind: OrderMailKind, transport?: Transporter): Promise<boolean>` – loads the order with customer, returns `false` (no throw) when the customer has no email, the order is missing, or sending fails; otherwise calls `sendMail`. Reason comes from `order.adminNote` for `slipRejected`/`cancelled`. URL = `${site.url}/${order.lang}/order/${order.orderNumber}?t=${shareToken("order", order.id)}`.

- [ ] **Step 1: Write failing checks** (section `order-mail`): create a throwaway customer with email + order via `db` (clean up in `finally`); `sendOrderMail(id, "received", jsonTransport)` → `true` and message `to` equals the customer email, text contains the URL with `?t=`; set `lang:"en"` → English subject; customer with `email: null` → `false`; unknown order id → `false`; SMTP env unset and no transport → `false` without throwing; call `cancelOrder(orderId, "test")` (from `shop.ts`) on a `PENDING_PAYMENT` order and assert it still returns `true` with mail unconfigured.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** `src/lib/order-mail.ts` per the interface; wrap all in try/catch.
- [ ] **Step 4:** In `cancelOrder`, after the transaction returns `true`, `await sendOrderMail(orderId, "cancelled")` (outside the transaction; ignore result). This covers admin cancel and auto-expiry.
- [ ] **Step 5:** In `CartView.tsx` add `<input type="hidden" name="lang" value={lang} />` next to the `items` hidden input; in `order-actions.ts` add `lang: z.enum(["lo","en"]).catch("lo")` to `orderSchema`, store it in `tx.order.create({ data: { ..., lang } })`, and after the existing `notify("SALES", ...)` call `await sendOrderMail(order.id, "received")`.
- [ ] **Step 6:** In `shop-actions.ts`: after a successful `confirmPayment` (`changed.count > 0`) send `"paid"`; after `rejectSlip` success send `"slipRejected"`; after `markFulfilled` success send `"fulfilled"`. These actions use `updateMany` by `id`, so read the id from `formData` (`str(formData, "id")`) and call `sendOrderMail` before the final `back(...)` (which redirects/throws).
- [ ] **Step 7: Run** the script → PASS; `pnpm tsc --noEmit`, `pnpm lint`.
- [ ] **Step 8: Commit** `feat: email customers on order received, paid, rejected slip, fulfilled, cancelled`.

### Task 4: Reminder engine

**Files:**
- Create: `src/lib/reminders.ts`
- Modify: `src/lib/notify.ts`, `scripts/verify-phase4.ts`

**Interfaces:**
- Consumes: `notify`, `db`.
- Produces:
  - `notify(channel, text): Promise<boolean>` – now returns `true` only when Telegram accepted the message (`res.ok`); `false` when unconfigured or failed. Existing callers ignore the result, so no other changes.
  - `runReminders(now?: Date, send?: (channel: "SALES" | "SERVICE", text: string) => Promise<boolean>): Promise<{ sent: number; skipped: number; retried: number }>` – `send` defaults to `notify` (injectable for tests). `sent` = items delivered, `skipped` = items already logged, `retried` = items whose send failed and whose log keys were removed.
  - `pmWindow(nextDueAt: Date, now: Date): "30d" | "7d" | "overdue" | null` – pure, exported.

- [ ] **Step 1: Write failing checks** (section `reminders`, injectable `send` capturing calls, throwaway data cleaned in `finally`, and `now` fixed): `pmWindow` for +40 d → `null`, +20 d → `"30d"`, +7 d → `"7d"`, +1 d → `"7d"`, −1 d → `"overdue"`; a schedule due +5 d with an active flag → first `runReminders` calls `send("SERVICE", …)` once with text containing the equipment `deviceModel`, `sent` ≥ 1; the immediate second run sends nothing for it (`skipped` ≥ 1); inactive schedule → never; after changing `nextDueAt` to +6 d of a different date (simulating a completed PM) → sends again; warranty ending in +10 d → SERVICE message; lot with `quantity:5` expiring +20 d → SALES message with `lotNumber`, lot with `quantity:0` → none, lot expiring +100 d → none; `PENDING_PAYMENT` order with `expiresAt` +3 h → SALES message with `orderNumber`, +10 h → none; `send` returning `false` → result `retried` ≥ 1 and **no** `NotificationLog` rows with that run's keys remain, so the next run with a succeeding `send` delivers them.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement `notify` return value** in `src/lib/notify.ts`.
- [ ] **Step 4: Implement** `src/lib/reminders.ts`: gather candidates per category into `{ channel, key, line }`; for each, `db.notificationLog.create({ data: { key } })` and treat a unique violation (use the existing `isUniqueViolation` helper — find it with `grep -rn "isUniqueViolation" src/lib src/app`) as "already sent"; group newly-created lines by channel into one message with a Lao heading per section (`ບຳລຸງຮັກສາ / Calibration`, `ການຮັບປະກັນ`, `Lot ໃກ້ໝົດອາຍຸ`, `ຄຳສັ່ງຊື້ໃກ້ໝົດເວລາຊຳລະ`); call `send`; on `false` or throw, `deleteMany` the keys created in this run for that channel and count them as `retried`. Include in each line the customer organization / product / lot number / order number and the date, formatted with an existing date helper (or `toLocaleDateString("en-GB")`).
- [ ] **Step 5: Run** → PASS; `pnpm tsc --noEmit`, `pnpm lint`.
- [ ] **Step 6: Commit** `feat: reminder engine with dedup log for PM, warranty, lots and unpaid orders`.

### Task 5: Cron endpoint

**Files:**
- Create: `src/app/api/cron/reminders/route.ts`
- Modify: `scripts/verify-phase4.ts`

**Interfaces:**
- Consumes: `runReminders`, `releaseExpiredOrders` (`src/lib/shop.ts`).
- Produces: `GET` and `POST` handlers; header `Authorization: Bearer <CRON_SECRET>`; 401 JSON `{ error: "unauthorized" }` otherwise; 200 JSON `{ ok: true, ...runReminders result }`. Compare secrets with `timingSafeEqual` on equal-length buffers.

- [ ] **Step 1: Write failing checks** (section `cron`, import the route module's `GET` and call it with `new Request(url, { headers })`): `CRON_SECRET` unset + any header → 401; secret set + no header → 401; wrong secret → 401; correct secret → 200 with `ok: true` and numeric `sent`. Set/restore `process.env.CRON_SECRET` inside the check.
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the route: `export const dynamic = "force-dynamic"`; check auth first; call `releaseExpiredOrders()` (cancels expired holds and now emails customers) before `runReminders()`; catch errors → 500 `{ ok: false }` with `console.error`.
- [ ] **Step 4: Run** → PASS (note: the correct-secret case hits the real dev DB and Telegram is unconfigured → items retried, not lost).
- [ ] **Step 5:** `pnpm build` passes and `/api/cron/reminders` appears as a dynamic route.
- [ ] **Step 6: Commit** `feat: secret-protected cron endpoint for reminders`.

### Task 6: Go-live checklist, docs, wrap-up

**Files:**
- Create: `docs/GO_LIVE_CHECKLIST.md`
- Modify: `README.md` (root), `PROJECT_PLAN.md` (add "ໄລຍະ 4" section with checked items), `.claude/changelog/2026-10-05-phase4-a1-email-notifications.md` (summary)

- [ ] **Step 1:** Write `docs/GO_LIVE_CHECKLIST.md` in Lao, as `- [ ]` items grouped: back up old site and record all DNS for `xtklaos.com`; change web records only and **keep MX**; add JS/meta redirect + moved-notice to the 2 Blogger blogs; update link on the Facebook page; register Google Search Console; production env values (all vars from `.env.example`, `NEXT_PUBLIC_SITE_URL`, SMTP, Telegram, `CRON_SECRET`); schedule the cron (example: daily 08:00 Asia/Vientiane → `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/cron/reminders`); move uploads/slips to R2/S3; test on iOS/Android, WhatsApp link `8562055892929`, a real order email, a real Telegram reminder; first-time business data (prices, "buy online", lots, bank/QR, show prices).
- [ ] **Step 2:** Add Phase 4 to `PROJECT_PLAN.md` mirroring the spec scope (checked: email, reminders, cron, checklist; unchecked: items needing a real SMTP/DNS, with the reason), and mention the new env vars in the root `README.md` next to the Telegram line.
- [ ] **Step 3:** Run `pnpm tsx scripts/verify-phase4.ts`, `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` — all must pass; then check an order flow page renders (`/lo/cart` returns 200 on `pnpm start`) per the project's browser-verify practice.
- [ ] **Step 4:** Append the `## Summary` (what/why/status/next) to the changelog, stating plainly that real SMTP delivery and real Telegram cron delivery were **not** tested.
- [ ] **Step 5: Commit** `docs: Phase 4 go-live checklist and plan update`.
