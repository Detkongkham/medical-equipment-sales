
## Summary
- **What changed:** Prisma migration (tier prices, quotation terms/discount/sentAt, InstalledEquipment, MaintenanceSchedule/Record, ServiceLog, ticket assignee→AdminUser); quotation PDF (@react-pdf, Noto Sans Lao) + admin editor `/admin/quotes/[id]` + signed public link `/quote-pdf/[id]/[token]` + WhatsApp/mailto; tier prices in product form; CRM `/admin/customers` with dedupe on RFQ/ticket submit; equipment registry, PM/Calibration schedules, ticket assignment + service logs; dashboard tiles.
- **Why:** Phase 2 of PROJECT_PLAN.md.
- **Status:** done — tsc, lint, build pass; PDF render (Lao + Latin) and all new admin pages returned 200 against the production build with test data (removed afterwards). Not tested: clicking through forms in a browser, WhatsApp/mailto delivery.
- **Next:** SMTP for real email; ₭ glyph is missing from the font so PDF uses "ກີບ"; set AUTH_SECRET and NEXT_PUBLIC_SITE_URL in production (share links use them).
