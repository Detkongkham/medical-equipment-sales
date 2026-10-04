# ສະຖາປັດຕະຍະກຳລະບົບ ແລະ ຖານຂໍ້ມູນ (System Architecture & Database Design)
**ລະບົບ:** XUPTHAVYKHOUN Medical Platform  
**ທີ່ຕັ້ງໂຟເດີ:** `/Users/ta/xtvk`  
**ປັບປຸງຫຼ້າສຸດ:** 2026-10-04

---

## 1. ເຕັກໂນໂລຊີທີ່ເລືອກໃຊ້ (Tech Stack)

* **Framework:** `Next.js` ລຸ້ນ stable ຫຼ້າສຸດ (App Router)
  - *ເຫດຜົນ:* SSG / SSR ເໝາະກັບ SEO ຂອງໜ້າສິນຄ້າ ແລະ ໂຫຼດໄວໃນມືຖື.
* **UI:** `Tailwind CSS`, `shadcn/ui`, `Lucide Icons`; ຟອນ `Noto Sans Lao`
* **2 ພາສາ:** route ແຍກ `/lo` ແລະ `/en` ພ້ອມ `hreflang`
* **Backend:** `Next.js Route Handlers / Server Actions`
* **Database & ORM:** `PostgreSQL` + `Prisma`
* **File Storage:** `Cloudflare R2` ຫຼື `AWS S3` (ຮູບສິນຄ້າ, Brochure PDF, CV)
* **ແຈ້ງເຕືອນ:** `Telegram Bot API`
* **ແຊັດ:** WhatsApp click-to-chat, Messenger (`m.me/xtkadmin`)
* **ໄລຍະ 2:** `@react-pdf/renderer` ສຳລັບໃບສະເໜີລາຄາ PDF
* **ໄລຍະ 3:** LAO QR / ໂອນທະນາຄານ

---

## 2. ໂຄງສ້າງຖານຂໍ້ມູນ ໄລຍະ 1 (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ໝວດໝູ່ (ຮອງຮັບໝວດຍ່ອຍ ເຊັ່ນ Laboratory > Reagents > Chemistry)
model Category {
  id          String     @id @default(cuid())
  slug        String     @unique
  nameLao     String
  nameEng     String
  description String?
  image       String?
  sortOrder   Int        @default(0)
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]
  createdAt   DateTime   @default(now())
}

// ຍີ່ຫໍ້
model Brand {
  id           String    @id @default(cuid())
  slug         String    @unique
  name         String
  logoUrl      String?
  country      String?
  isHouseBrand Boolean   @default(false) // ຍີ່ຫໍ້ຂອງບໍລິສັດເອງ ເຊັ່ນ XTKBio+, Xupwell
  products     Product[]
}

enum SalesMode {
  RFQ_ONLY   // ຂໍລາຄາເທົ່ານັ້ນ (ຄ່າເລີ່ມຕົ້ນ)
  DIRECT_BUY // ຊື້ອອນລາຍໄດ້ (ໄລຍະ 3)
}

enum StockStatus {
  IN_STOCK  // ພ້ອມສົ່ງ
  PRE_ORDER // ສັ່ງຈອງ
}

// ສິນຄ້າ
model Product {
  id             String            @id @default(cuid())
  sku            String            @unique
  slug           String            @unique
  modelNumber    String?           // ເຊັ່ນ TK-200, KT-6510
  titleLao       String
  titleEng       String
  shortDescLao   String?
  shortDescEng   String?
  fullDescLao    String?           @db.Text
  fullDescEng    String?           @db.Text
  categoryId     String
  category       Category          @relation(fields: [categoryId], references: [id])
  brandId        String?
  brand          Brand?            @relation(fields: [brandId], references: [id])
  salesMode      SalesMode         @default(RFQ_ONLY)
  stockStatus    StockStatus       @default(PRE_ORDER)
  images         String[]
  brochurePdfUrl String?
  fddRegNumber   String?           // ເລກທະບຽນ ກົມອາຫານ ແລະ ຢາ
  certifications String[]          // ["CE", "FDA", "ISO 13485"]
  specifications Json?             // [{ "labelLao": "...", "labelEng": "...", "value": "..." }]
  isFeatured     Boolean           @default(false)
  isPublished    Boolean           @default(false)
  variants       ProductVariant[]
  relatedFrom    ProductRelation[] @relation("RelationFrom")
  relatedTo      ProductRelation[] @relation("RelationTo")
  quotationItems QuotationItem[]
  posts          Post[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
}

// ຕົວເລືອກ ແລະ ຂະໜາດບັນຈຸ (ເຊັ່ນ HBsAg Card 25 test/ກ່ອງ, Strip 50 test/ກ່ອງ)
model ProductVariant {
  id             String          @id @default(cuid())
  productId      String
  product        Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku            String          @unique
  nameLao        String
  nameEng        String
  packSize       String?         // "25 test/box", "100/pack", "110mm x 20m"
  priceLAK       Decimal?        @db.Decimal(14, 2) // ຫວ່າງ = ຂໍລາຄາ
  priceTHB       Decimal?        @db.Decimal(12, 2)
  priceUSD       Decimal?        @db.Decimal(10, 2)
  dealerPriceLAK Decimal?        @db.Decimal(14, 2) // ລາຄາຕົວແທນ (ໄລຍະ 2), ບໍ່ສະແດງໜ້າເວັບ
  stockStatus    StockStatus     @default(PRE_ORDER)
  quotationItems QuotationItem[]
}

enum RelationType {
  REAGENT    // ນ້ຳຢາທີ່ໃຊ້ກັບເຄື່ອງ
  CONSUMABLE // ເຈ້ຍພິມ, strip
  ACCESSORY
}

// ສິນຄ້າທີ່ໃຊ້ຮ່ວມກັນ (ເຄື່ອງວິເຄາະ -> ນ້ຳຢາ / ເຈ້ຍ)
model ProductRelation {
  id     String       @id @default(cuid())
  fromId String
  from   Product      @relation("RelationFrom", fields: [fromId], references: [id], onDelete: Cascade)
  toId   String
  to     Product      @relation("RelationTo", fields: [toId], references: [id], onDelete: Cascade)
  type   RelationType

  @@unique([fromId, toId])
}

enum CustomerType {
  HOSPITAL
  CLINIC
  DEALER     // ຕົວແທນ
  GOVERNMENT
  INDIVIDUAL
}

// ລູກຄ້າ / ອົງກອນ
model Customer {
  id             String          @id @default(cuid())
  organization   String
  type           CustomerType    @default(CLINIC)
  contactName    String
  phone          String
  whatsapp       String?
  email          String?
  address        String?
  quotations     Quotation[]
  serviceTickets ServiceTicket[]
  createdAt      DateTime        @default(now())
}

enum QuoteStatus {
  PENDING   // ຮັບຄຳຂໍແລ້ວ
  REVIEWING // ຝ່າຍຂາຍກຳລັງກວດ
  QUOTED    // ສົ່ງໃບສະເໜີລາຄາແລ້ວ
  APPROVED  // ລູກຄ້າຕົກລົງ
  CLOSED    // ປິດ (ສຳເລັດ ຫຼື ຍົກເລີກ)
}

// ຄຳຂໍໃບສະເໜີລາຄາ (RFQ)
model Quotation {
  id             String          @id @default(cuid())
  quoteNumber    String          @unique // Q-2026-0001
  customerId     String
  customer       Customer        @relation(fields: [customerId], references: [id])
  note           String?
  status         QuoteStatus     @default(PENDING)
  totalAmountLAK Decimal?        @db.Decimal(14, 2)
  pdfUrl         String?         // ໄລຍະ 2
  items          QuotationItem[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model QuotationItem {
  id          String          @id @default(cuid())
  quotationId String
  quotation   Quotation       @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  productId   String
  product     Product         @relation(fields: [productId], references: [id])
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  quantity    Int             @default(1)
  unitPrice   Decimal?        @db.Decimal(14, 2)
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_PARTS
  RESOLVED
  CLOSED
}

// ແຈ້ງສ້ອມ
model ServiceTicket {
  id               String       @id @default(cuid())
  ticketNumber     String       @unique // SR-2026-0001
  customerId       String
  customer         Customer     @relation(fields: [customerId], references: [id])
  deviceModel      String
  serialNumber     String?
  issueDescription String       @db.Text
  attachmentUrls   String[]
  status           TicketStatus @default(OPEN)
  assignedTech     String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

enum PostType {
  NEWS    // ຂ່າວ, ກິດຈະກຳ
  PROJECT // ຜົນງານ: ຕິດຕັ້ງ, ສົ່ງມອບ, ສອນການນຳໃຊ້
}

// ຂ່າວ ແລະ ຜົນງານ
model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  type        PostType
  titleLao    String
  titleEng    String?
  bodyLao     String    @db.Text
  bodyEng     String?   @db.Text
  images      String[]
  products    Product[] // ສິນຄ້າທີ່ກ່ຽວຂ້ອງ
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
}

// ຮັບສະໝັກງານ
model JobOpening {
  id           String         @id @default(cuid())
  title        String         // ເຊັ່ນ ເຕັກນິກການແພດ, ເຕັກນິກທົ່ວໄປ
  department   String
  positions    Int            @default(1)
  location     String         @default("Vientiane Capital")
  description  String         @db.Text
  requirements String         @db.Text
  benefits     String?        @db.Text
  isActive     Boolean        @default(true)
  applicants   JobApplicant[]
  createdAt    DateTime       @default(now())
}

model JobApplicant {
  id           String     @id @default(cuid())
  jobId        String
  job          JobOpening @relation(fields: [jobId], references: [id])
  fullName     String
  phone        String
  email        String?
  documentUrls String[]   // CV, ໃບຄຳຮ້ອງ, ໃບປະກາດ, ໃບປະສົບການ
  note         String?
  createdAt    DateTime   @default(now())
}

enum AdminRole {
  ADMIN
  SALES
  TECHNICIAN
  HR
}

model AdminUser {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         AdminRole
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
}
```

### Model ທີ່ຈະເພີ່ມໃນໄລຍະຕໍ່ໄປ
* **ໄລຍະ 2:** `InstalledDevice` (ເຄື່ອງທີ່ຕິດຕັ້ງຢູ່ລູກຄ້າ: Serial No, ວັນຕິດຕັ້ງ, ວັນໝົດຮັບປະກັນ, ນັດ PM), `ServiceLog` (ປະຫວັດສ້ອມ ແລະ ອາໄຫຼ່).
* **ໄລຍະ 3:** `Order`, `OrderItem`, `Payment`, `StockBatch` (Lot ແລະ ວັນໝົດອາຍຸ).

---

## 3. ການເຊື່ອມຕໍ່ພາຍນອກ

1. **WhatsApp:** ເບີຕ້ອງເປັນຮູບແບບສາກົນບໍ່ມີ 0 ນຳໜ້າ (ເວັບເກົ່າໃຊ້ `85602055892929` ເຊິ່ງຜິດ).
   ```text
   https://wa.me/8562055892929?text=ສະບາຍດີ%20ຂ້າພະເຈົ້າສົນໃຈ:%20[PRODUCT_TITLE]%20(SKU:%20[SKU])
   ```
2. **Messenger:** `https://m.me/xtkadmin`
3. **Telegram Bot:** ແຈ້ງເຂົ້າກຸ່ມຝ່າຍຂາຍ ເມື່ອມີ RFQ ໃໝ່; ກຸ່ມຊ່າງ ເມື່ອມີແຈ້ງສ້ອມ; HR ເມື່ອມີໃບສະໝັກ.
4. **Google Maps:** ພິກັດ 17.9991, 102.6105.
5. **LAO QR (ໄລຍະ 3):** ຕ້ອງມີສັນຍາ merchant ກັບທະນາຄານກ່ອນ.

---

## 4. ໂດເມນ ແລະ ການຍ້າຍລະບົບ

1. **DNS ຂອງ `xtklaos.com`:** ປັດຈຸບັນເວັບ ແລະ ອີເມວຢູ່ hosting ດຽວກັນ (EasyWinHOST). ປ່ຽນສະເພາະ record ຂອງເວັບ (`@` ແລະ `www`); ຮັກສາ MX ແລະ record ຂອງອີເມວໄວ້. ບັນທຶກ DNS ທັງໝົດກ່ອນແກ້.
2. **Blogspot:** Blogger ຕັ້ງ 301 ໄປໂດເມນນອກບໍ່ໄດ້. ໃຊ້ວິທີ:
   * ໃສ່ JavaScript / meta refresh ໃນ template ຂອງ 2 ບລັອກ ຊີ້ໄປໜ້າທີ່ກົງກັນ.
   * ໃສ່ປ້າຍ "ເວັບໄຊທ໌ຍ້າຍໄປ www.xtklaos.com" ເທິງສຸດຂອງທຸກໂພສ.
   * ຕາຕະລາງຈັບຄູ່ URL:

   | ບລັອກເກົ່າ | ເວັບໃໝ່ |
   | :--- | :--- |
   | `/2021/06/pharmaceuticals.html` | `/products/pharmaceuticals` |
   | `/2020/06/health-care.html`, `/2020/07/medical-equipment.html` | `/products/health-care` |
   | `/2021/06/laboratory-equipment.html` | `/products/laboratory` |
   | `/2021/06/consumable.html` | `/products/consumable` |
   | `/2024/11/security.html` | `/products/security` |
   | `/2020/06/career.html` | `/services` |
   | `/2020/06/career_4.html` | `/careers` |
   | `/2020/06/about-us.html` | `/about` |
   | `/2020/06/blog-post.html` | `/contact` |
   | `/2020/06/get-quote.html` | `/quote` |

3. **SEO:** `sitemap.xml`, `robots.txt`, `hreflang` (lo / en), structured data (`Organization`, `Product`), alt ຂອງທຸກຮູບ, ລົງທະບຽນ Google Search Console.
