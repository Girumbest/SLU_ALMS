/*
  Warnings:

  - The `recurringType` column on the `Calendar` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "recurringType",
ADD COLUMN     "recurringType" TEXT NOT NULL DEFAULT 'yearly';
