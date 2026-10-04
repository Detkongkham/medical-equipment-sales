# XTK web

ເວັບໄຊທ໌ໃໝ່ຂອງ ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ (ໄລຍະ 1: Catalog + ຂໍລາຄາ + ແຈ້ງສ້ອມ + ຜົນງານ + ຮັບສະໝັກງານ).
ແຜນ ແລະ ຂໍ້ມູນຕົ້ນທາງຢູ່ໃນໂຟເດີແມ່: `../PROJECT_PLAN.md`, `../SYSTEM_ARCHITECTURE.md`, `../PRODUCT_STRUCTURE_AND_CATALOG.md`.

## ເລີ່ມໃຊ້ງານ

```bash
pnpm install
cp .env.example .env
pnpm db          # Postgres ສຳລັບ dev (port 54329, ຂໍ້ມູນຢູ່ .pgdata/) — ເປີດຄ້າງໄວ້
pnpm db:migrate  # ສ້າງຕາຕະລາງ
pnpm db:seed     # ໃສ່ສິນຄ້າ, ຍີ່ຫໍ້, ຜົນງານ, ຕຳແໜ່ງງານ
pnpm dev         # http://localhost:3100
```

## ຂຶ້ນລະບົບຈິງ (production)

- ຕັ້ງ `AUTH_SECRET` ເປັນຄ່າສຸ່ມຍາວ: `openssl rand -base64 32` (ໃສ່ໃນ environment ຂອງເຊີເວີ, ບໍ່ commit). ຖ້າບໍ່ຕັ້ງ ເວັບຈະບໍ່ເລີ່ມ admin ໃນ production.
- ສ້າງບັນຊີ admin ທຳອິດ: `pnpm admin:create ອີເມວ "ຊື່" ລະຫັດຜ່ານ(10+ຕົວ)`
- ຕັ້ງ `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` ແລະ (ຖ້າຕ້ອງການ) `TELEGRAM_*`.
- ລາຄາ: ສະວິດ "ສະແດງລາຄາໃນເວັບ" ປິດໄວ້ເປັນຄ່າເລີ່ມຕົ້ນ. `pnpm prices:sample` ໃສ່ລາຄາຕົວຢ່າງ (ບໍ່ແມ່ນລາຄາຈິງ) ໃຊ້ໃນ dev ເທົ່ານັ້ນ.

## ໂຄງສ້າງ

- `prisma/schema.prisma` — ຖານຂໍ້ມູນ; `prisma/seed.ts` — ຂໍ້ມູນສິນຄ້າຈາກເວັບເກົ່າ ແລະ ເພສ Facebook
- `src/app/[lang]/` — ໜ້າເວັບ 2 ພາສາ (`/lo`, `/en`)
- `src/app/actions.ts` — ຮັບຄຳຂໍລາຄາ, ແຈ້ງສ້ອມ, ໃບສະໝັກງານ
- `src/lib/site.ts` — ຂໍ້ມູນຕິດຕໍ່ຂອງບໍລິສັດ; `src/lib/i18n.ts` — ຂໍ້ຄວາມ 2 ພາສາ
- `public/catalog`, `public/posts` — ຮູບ (ຕົ້ນສະບັບຢູ່ `../assets/legacy`)

## ຍັງບໍ່ໄດ້ເຮັດ

- ຫຼັງບ້ານຢູ່ທີ່ `/admin` (ສິນຄ້າ, ລາຄາ, ສິນຄ້າທີ່ໃຊ້ຮ່ວມກັນ, ຄຳຂໍລາຄາ, ແຈ້ງສ້ອມ, ຜູ້ສະໝັກ, ຜົນງານ, ຕຳແໜ່ງງານ). ຢ່າຣັນ `db:seed` ໃສ່ຖານຂໍ້ມູນທີ່ໃຊ້ແລ້ວ — ມັນລຶບສິນຄ້າທັງໝົດ
- ໄຟລ໌ທີ່ອັບໂຫຼດເກັບໄວ້ໃນ `storage/` ຂອງເຄື່ອງ; production ຕ້ອງປ່ຽນເປັນ Cloudflare R2 / S3 (`src/lib/storage.ts`)
- ແຈ້ງເຕືອນ Telegram ເຮັດວຽກເມື່ອໃສ່ `TELEGRAM_*` ໃນ `.env`
