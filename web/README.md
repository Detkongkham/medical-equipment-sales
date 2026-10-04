# XTK web

ເວັບໄຊທ໌ໃໝ່ຂອງ ບໍລິສັດ ຊັບທະວີຄູນ ຈຳກັດຜູ້ດຽວ (ໄລຍະ 1: Catalog + ຂໍລາຄາ + ແຈ້ງສ້ອມ + ຜົນງານ + ຮັບສະໝັກງານ).
ແຜນ ແລະ ຂໍ້ມູນຕົ້ນທາງຢູ່ໃນໂຟເດີແມ່: `../PROJECT_PLAN.md`, `../SYSTEM_ARCHITECTURE.md`, `../PRODUCT_STRUCTURE_AND_CATALOG.md`.

## ເລີ່ມໃຊ້ງານ

```bash
npm install
cp .env.example .env
npm run db          # Postgres ສຳລັບ dev (port 54329, ຂໍ້ມູນຢູ່ .pgdata/) — ເປີດຄ້າງໄວ້
npm run db:migrate  # ສ້າງຕາຕະລາງ
npm run db:seed     # ໃສ່ສິນຄ້າ, ຍີ່ຫໍ້, ຜົນງານ, ຕຳແໜ່ງງານ
npm run dev         # http://localhost:3100
```

## ໂຄງສ້າງ

- `prisma/schema.prisma` — ຖານຂໍ້ມູນ; `prisma/seed.ts` — ຂໍ້ມູນສິນຄ້າຈາກເວັບເກົ່າ ແລະ ເພສ Facebook
- `src/app/[lang]/` — ໜ້າເວັບ 2 ພາສາ (`/lo`, `/en`)
- `src/app/actions.ts` — ຮັບຄຳຂໍລາຄາ, ແຈ້ງສ້ອມ, ໃບສະໝັກງານ
- `src/lib/site.ts` — ຂໍ້ມູນຕິດຕໍ່ຂອງບໍລິສັດ; `src/lib/i18n.ts` — ຂໍ້ຄວາມ 2 ພາສາ
- `public/catalog`, `public/posts` — ຮູບ (ຕົ້ນສະບັບຢູ່ `../assets/legacy`)

## ຍັງບໍ່ໄດ້ເຮັດ

- ໜ້າຫຼັງບ້ານ (admin): ຕອນນີ້ແກ້ສິນຄ້າຜ່ານ `prisma/seed.ts` ແລະ ເບິ່ງຄຳຂໍຜ່ານ `npx prisma studio`
- ໄຟລ໌ທີ່ອັບໂຫຼດເກັບໄວ້ໃນ `storage/` ຂອງເຄື່ອງ; production ຕ້ອງປ່ຽນເປັນ Cloudflare R2 / S3 (`src/lib/storage.ts`)
- ແຈ້ງເຕືອນ Telegram ເຮັດວຽກເມື່ອໃສ່ `TELEGRAM_*` ໃນ `.env`
