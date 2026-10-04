-- CreateEnum
CREATE TYPE "SalesMode" AS ENUM ('RFQ_ONLY', 'DIRECT_BUY');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'PRE_ORDER');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('REAGENT', 'CONSUMABLE', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('HOSPITAL', 'CLINIC', 'DEALER', 'GOVERNMENT', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('NEWS', 'PROJECT');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SALES', 'TECHNICIAN', 'HR');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameLao" TEXT NOT NULL,
    "nameEng" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "country" TEXT,
    "isHouseBrand" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "modelNumber" TEXT,
    "titleLao" TEXT NOT NULL,
    "titleEng" TEXT NOT NULL,
    "shortDescLao" TEXT,
    "shortDescEng" TEXT,
    "fullDescLao" TEXT,
    "fullDescEng" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "salesMode" "SalesMode" NOT NULL DEFAULT 'RFQ_ONLY',
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'PRE_ORDER',
    "images" TEXT[],
    "brochurePdfUrl" TEXT,
    "fddRegNumber" TEXT,
    "certifications" TEXT[],
    "specifications" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nameLao" TEXT NOT NULL,
    "nameEng" TEXT NOT NULL,
    "packSize" TEXT,
    "priceLAK" DECIMAL(14,2),
    "priceTHB" DECIMAL(12,2),
    "priceUSD" DECIMAL(10,2),
    "dealerPriceLAK" DECIMAL(14,2),
    "stockStatus" "StockStatus" NOT NULL DEFAULT 'PRE_ORDER',

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRelation" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,

    CONSTRAINT "ProductRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'CLINIC',
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "note" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmountLAK" DECIMAL(14,2),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(14,2),

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "serialNumber" TEXT,
    "issueDescription" TEXT NOT NULL,
    "attachmentUrls" TEXT[],
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTech" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PostType" NOT NULL,
    "titleLao" TEXT NOT NULL,
    "titleEng" TEXT,
    "bodyLao" TEXT NOT NULL,
    "bodyEng" TEXT,
    "images" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOpening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "positions" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL DEFAULT 'Vientiane Capital',
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobOpening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicant" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "documentUrls" TEXT[],
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PostToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PostToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRelation_fromId_toId_key" ON "ProductRelation"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quoteNumber_key" ON "Quotation"("quoteNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTicket_ticketNumber_key" ON "ServiceTicket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "_PostToProduct_B_index" ON "_PostToProduct"("B");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "Quotation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicant" ADD CONSTRAINT "JobApplicant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToProduct" ADD CONSTRAINT "_PostToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToProduct" ADD CONSTRAINT "_PostToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
