-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "lang" TEXT NOT NULL DEFAULT 'lo';

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_key_key" ON "NotificationLog"("key");
