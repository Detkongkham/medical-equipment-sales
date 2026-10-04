-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "priceLAK" DECIMAL(14,2),
ADD COLUMN     "showPrice" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);
