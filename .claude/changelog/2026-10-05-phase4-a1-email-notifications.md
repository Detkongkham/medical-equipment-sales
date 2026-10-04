# 2026-10-05-phase4-a1-email-notifications

## Auto log (file changes)

| Time | Tool | File |
|------|------|------|
| 02:51:26 | Write | docs/superpowers/specs/2026-10-05-phase4-notifications-design.md |
| 02:53:25 | Write | docs/superpowers/plans/2026-10-05-phase4-notifications.md |

## Summary
- **What changed:** `lib/mailer.ts` (nodemailer, no-op without SMTP env), `lib/mail-templates.ts` (lo/en order emails), `lib/order-mail.ts` + hooks in `submitOrder`, `confirmPayment`, `rejectSlip`, `markFulfilled`, `cancelOrder` (covers auto-expiry); migration `phase4_notifications` (`Order.lang`, `NotificationLog`); `lib/reminders.ts` (PM/Calibration, warranty, expiring lots, unpaid orders, deduped); `notify()` now returns boolean; `/api/cron/reminders` (Bearer `CRON_SECRET`); `proxy.ts` skips `/api`; `scripts/verify-phase4.ts`; `docs/GO_LIVE_CHECKLIST.md`; PROJECT_PLAN/README updated.
- **Why:** Phase 4 — automatic customer emails and team reminders (spec/plan in docs/superpowers).
- **Status:** done in code — verify-phase4 (mail, order-mail, reminders, cron) PASS against dev DB; tsc, lint, build pass; production build: `/lo/cart` 200, cron 401 without/with wrong secret. **Not tested:** real SMTP delivery, real Telegram delivery from cron, a scheduler actually calling the endpoint. Go-live DNS/Blogger/Search Console work is manual (checklist).
- **Next:** set SMTP/Telegram/CRON_SECRET in production, schedule the cron, work through docs/GO_LIVE_CHECKLIST.md.
