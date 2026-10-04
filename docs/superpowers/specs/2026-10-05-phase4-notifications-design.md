# Phase 4 – ອີເມວລູກຄ້າ ແລະ ແຈ້ງເຕືອນອັດຕະໂນມັດ (Design)

## ເປົ້າໝາຍ
ໃຫ້ລະບົບແຈ້ງເຕືອນເອງ ແທນທີ່ຄົນຕ້ອງຈື່: (1) ອີເມວເຖິງລູກຄ້າໃນຂັ້ນຕອນສັ່ງຊື້, (2) Telegram ເຖິງທີມພາຍໃນເມື່ອ PM / Calibration, ການຮັບປະກັນ, Lot ແລະ ຄຳສັ່ງຊື້ໃກ້ຄົບກຳນົດ.

## ຂອບເຂດ
**ລວມ:** SMTP mailer, ອີເມວສັ່ງຊື້, cron reminders, ຕາຕະລາງກັນສົ່ງຊ້ຳ, checklist ຂຶ້ນລະບົບຈິງ (ເອກະສານ).
**ບໍ່ລວມ:** ການປ່ຽນ DNS/MX/redirect Blogger/Search Console ຕົວຈິງ (ງານມື ຢູ່ນອກໂຄດ); payment gateway; ຍ້າຍໄຟລ໌ໄປ R2/S3; ຄ່າຈັດສົ່ງ; ອີເມວ RFQ/ໃບສະເໜີລາຄາ (ຍັງເປັນ mailto ເດີມ).

## ສົມມຸດຖານ
- ລູກຄ້າສ່ວນຫຼາຍໃຊ້ WhatsApp; ອີເມວເປັນຊ່ອງທາງເສີມ. ຊ່ອງອີເມວໃນຟອມຍັງ**ບໍ່ບັງຄັບ** (ມີຢູ່ແລ້ວ). ບໍ່ມີອີເມວ = ຂ້າມການສົ່ງ.
- ຖ້າບໍ່ໄດ້ຕັ້ງ env ຂອງ SMTP, ຫຼື ສົ່ງບໍ່ສຳເລັດ: ຂ້າມ/ບັນທຶກ log, ບໍ່ເຮັດໃຫ້ request ລົ້ມ (ຄືກັບ `notify.ts`).

## ອົງປະກອບ
1. **`lib/mailer.ts`** – `sendMail({to, subject, text})` ດ້ວຍ nodemailer. Env: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM`. ບໍ່ຕັ້ງ = no-op. Timeout 8 ວິ, ຈັບ error.
2. **`lib/mail-templates.ts`** – ຂໍ້ຄວາມ plain text ສອງພາສາ (lo/en) ສຳລັບ: ຮັບຄຳສັ່ງຊື້ (ພ້ອມລິ້ງຕິດຕາມ + ວິທີຊຳລະ), ຢືນຢັນການຊຳລະ, ສະລິບຖືກປະຕິເສດ (ພ້ອມເຫດຜົນ), ຈັດສົ່ງແລ້ວ, ຄຳສັ່ງຊື້ຖືກຍົກເລີກ/ໝົດເວລາ. ພາສາ: ໃຊ້ພາສາທີ່ລູກຄ້າສັ່ງ (ເກັບ `lang` ໃນ Order; ຄ່າເລີ່ມຕົ້ນ lo).
3. **ຈຸດສົ່ງ** – ເອີ້ນຈາກ `order-actions.ts` (submitOrder) ແລະ admin order actions (confirm / reject / fulfil / cancel) ຫຼັງຈາກປ່ຽນສະຖານະສຳເລັດ.
4. **`lib/reminders.ts`** – ຟັງຊັນ `runReminders(now)` ທີ່ຄົ້ນຫາ:
   - `MaintenanceSchedule` (active) ທີ່ `nextDueAt` ຢູ່ໃນ 30 ແລະ 7 ວັນ, ແລະ ເກີນກຳນົດ;
   - `InstalledEquipment.warrantyUntil` ໃນ 30 ວັນ;
   - `StockLot` ທີ່ມີ `quantity>0` ແລະ `expiryDate` ໃນ 60 / 30 ວັນ;
   - `Order` ທີ່ PENDING_PAYMENT ແລະ `expiresAt` ໃນ 6 ຊົ່ວໂມງ.
   ແລ້ວສົ່ງ `notify("SERVICE" | "SALES", ...)` ເປັນຂໍ້ຄວາມສະຫຼຸບຕໍ່ຊ່ອງ (ບໍ່ແມ່ນຕໍ່ລາຍການ).
5. **Model `NotificationLog`** (`key` unique ເຊັ່ນ `pm:<id>:7d:<dueDate>`, `sentAt`) – ກັນສົ່ງຊ້ຳ; ເຮັດ insert ກ່ອນສົ່ງ (unique ຊົນ = ຂ້າມ). ກຳນົດ due ໃໝ່ຫຼັງເຮັດ PM ແລ້ວ key ຈະປ່ຽນ ຈຶ່ງແຈ້ງໃໝ່ໄດ້.
6. **`/api/cron/reminders`** (GET/POST) – ກວດ header `Authorization: Bearer $CRON_SECRET`; 401 ຖ້າບໍ່ກົງ ຫຼື ບໍ່ໄດ້ຕັ້ງ secret. ຍັງເອີ້ນ auto-cancel ຄຳສັ່ງຊື້ໝົດເວລາຢູ່ແລ້ວ (ຖ້າມີ) ຕື່ມ. ໃຫ້ cron ຂອງ host ເອີ້ນວັນລະເທື່ອ (ເຊັ່ນ 08:00 ເວລາລາວ).
7. **Order.lang** – field ໃໝ່ (migration), ຕັ້ງຈາກ locale ຕອນສັ່ງ.
8. **`docs/GO_LIVE_CHECKLIST.md`** – ຂັ້ນຕອນ DNS (ຮັກສາ MX), redirect Blogger, Search Console, ຄ່າ env ຜະລິດ, ຕັ້ງ cron, ທົດສອບມືຖື/WhatsApp.

## Data flow
ສັ່ງຊື້ → DB commit → `sendMail` (ຖ້າມີອີເມວ) + `notify("SALES")` ເດີມ. Cron → `runReminders` → insert NotificationLog → `notify`.

## Error handling
ທຸກການສົ່ງ (mail/Telegram) ຖືກຫໍ່ດ້ວຍ try/catch, ບໍ່ສົ່ງ error ຂຶ້ນໄປຫາຜູ້ໃຊ້. ຖ້າ Telegram ລົ້ມ ຕອນ cron, ລຶບ log key ນັ້ນ ເພື່ອລອງໃໝ່ຮອບຕໍ່ໄປ.

## ການທົດສອບ
- ສະຄຣິບທົດສອບກັບ dev DB (ຕາມແບບ Phase 3): ສ້າງຂໍ້ມູນໃກ້ກຳນົດ → `runReminders` ສົ່ງຄັ້ງດຽວ, ເອີ້ນຊ້ຳບໍ່ສົ່ງຊ້ຳ; ເຮັດ PM ແລ້ວ nextDue ປ່ຽນ → ແຈ້ງໃໝ່ໄດ້.
- Mailer: ໃຊ້ transport ທົດສອບ (jsonTransport) ກວດເນື້ອຫາ/ຜູ້ຮັບ; ບໍ່ມີ env → no-op.
- Endpoint cron: 401 ບໍ່ມີ/ຜິດ secret, 200 ເມື່ອຖືກ.
- `tsc`, lint, build ຜ່ານ. ບໍ່ໄດ້ທົດສອບສົ່ງອີເມວຈິງ ເພາະບໍ່ມີ SMTP ຈິງ (ຈະບອກຊັດເຈນໃນ changelog).
