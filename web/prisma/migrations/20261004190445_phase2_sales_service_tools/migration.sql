/*
  Warnings:

  - You are about to drop the column `assignedTech` on the `ServiceTicket` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PriceTier" AS ENUM ('GENERAL', 'MEDICAL', 'DEALER');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PM', 'CALIBRATION');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "dealerPriceLAK" DECIMAL(14,2),
ADD COLUMN     "medicalPriceLAK" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "medicalPriceLAK" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "discountLAK" DECIMAL(14,2),
ADD COLUMN     "priceTier" "PriceTier",
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "terms" TEXT,
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ServiceTicket" DROP COLUMN "assignedTech",
ADD COLUMN     "assignedToId" TEXT,
ADD COLUMN     "equipmentId" TEXT;

-- CreateTable
CREATE TABLE "ServiceLog" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT,
    "status" "TicketStatus",
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstalledEquipment" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "deviceModel" TEXT NOT NULL,
    "serialNumber" TEXT,
    "location" TEXT,
    "installedAt" TIMESTAMP(3) NOT NULL,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 12,
    "warrantyUntil" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstalledEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSchedule" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "intervalMonths" INTEGER NOT NULL,
    "nextDueAt" TIMESTAMP(3) NOT NULL,
    "assignedToId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL,
    "doneById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTicket" ADD CONSTRAINT "ServiceTicket_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "InstalledEquipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLog" ADD CONSTRAINT "ServiceLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "ServiceTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLog" ADD CONSTRAINT "ServiceLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstalledEquipment" ADD CONSTRAINT "InstalledEquipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstalledEquipment" ADD CONSTRAINT "InstalledEquipment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "InstalledEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSchedule" ADD CONSTRAINT "MaintenanceSchedule_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "MaintenanceSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
