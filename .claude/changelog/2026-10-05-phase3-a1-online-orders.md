# 2026-10-05-phase3-a1-online-orders

## Auto log (file changes)

| Time | Tool | File |
|------|------|------|
| 02:32:27 | Edit | web/src/app/robots.ts |

## Summary
- **What changed:** Prisma migration `phase3_orders_and_lots` (Order, OrderItem, StockLot, OrderAllocation, OrderStatus, PaymentMethod); `lib/shop.ts` (server-side pricing, FEFO allocation, cancel/restore stock, 48h hold auto-release, payment settings); `order-actions.ts` (previewCart, submitOrder, uploadSlip); public `/[lang]/cart` and `/[lang]/order/[number]?t=token`, cart store + header link, buy buttons on product page; admin `/admin/orders` (confirm / reject slip / fulfil / cancel + bank & LAO QR settings), `/admin/stock` (lots, expiry, manual qty), product form "sales mode" (pharmaceuticals blocked), dashboard tiles; en/lo strings; robots; `lib/numbering.ts` extracted from actions.ts.
- **Why:** Phase 3 of PROJECT_PLAN.md (online sales of consumables, payment slips, stock by lot/expiry).
- **Status:** done — tsc, lint, build pass. Verified against the dev DB with a script: only DIRECT_BUY + priced + non-pharma products are sellable, expired lots excluded, FEFO order, over-ordering refused, two concurrent orders for the last units -> exactly one wins and no lot goes negative, cancel returns stock once, expired unpaid order auto-cancels. Pages return 200 on the production build (cart, order with valid token; 404 with a bad/missing token; admin orders/stock). Test data removed; the showPrices setting was deleted afterwards (default = hidden). Not tested: clicking through the cart/checkout/slip-upload/admin buttons in a browser.
- **Next:** Business inputs still needed before going live: set prices, set products to "buy online", enter lots, enter bank account / LAO QR in Admin > Orders, turn on "show prices". Delivery fee is not modelled (use the payment note). Slips and the LAO QR are stored on local disk (move to R2/S3 in production like other uploads). No email to the customer; the order link is shown on screen only (customer should save it / sales can send it via WhatsApp).
