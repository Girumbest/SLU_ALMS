/*
  Warnings:

  - The values [WEEKEND,WORKDAY_ADJUSTMENT] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `recurringDay` on the `Calendar` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RecurringType" AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('HOLIDAY', 'OTHER');
ALTER TABLE "Calendar" ALTER COLUMN "eventType" TYPE "EventType_new" USING ("eventType"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "recurringDay",
ADD COLUMN     "eventEnd" TIMESTAMP(3),
ADD COLUMN     "recurringType" "RecurringType" NOT NULL DEFAULT 'yearly';

-- DropEnum
DROP TYPE "RecurringDay";
