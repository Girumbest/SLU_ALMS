/*
  Warnings:

  - You are about to drop the column `isReccuring` on the `LeaveType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LeaveType" DROP COLUMN "isReccuring",
ADD COLUMN     "accrued" BOOLEAN NOT NULL DEFAULT false;
