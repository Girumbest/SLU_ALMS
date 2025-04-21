/*
  Warnings:

  - The values [LATE] on the enum `AttendanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isEarlyCheckout` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `isLate` on the `Attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[statusId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `statusId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttendanceStatus_new" AS ENUM ('PRESENT', 'ABSENT', 'ON_LEAVE');
ALTER TABLE "Attendance" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Attendance" ALTER COLUMN "status" TYPE "AttendanceStatus_new" USING ("status"::text::"AttendanceStatus_new");
ALTER TYPE "AttendanceStatus" RENAME TO "AttendanceStatus_old";
ALTER TYPE "AttendanceStatus_new" RENAME TO "AttendanceStatus";
DROP TYPE "AttendanceStatus_old";
ALTER TABLE "Attendance" ALTER COLUMN "status" SET DEFAULT 'ABSENT';
COMMIT;

-- AlterEnum
ALTER TYPE "SettingType" ADD VALUE 'DATE_TIME';

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "isEarlyCheckout",
DROP COLUMN "isLate",
ADD COLUMN     "checkOutEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "statusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AttendanceCheckInOutStatus" (
    "id" SERIAL NOT NULL,
    "isLateMorningCheckIn" BOOLEAN,
    "isEarlyMorningCheckOut" BOOLEAN,
    "isLateAfternoonCheckIn" BOOLEAN,
    "isEarlyAfternoonCheckOut" BOOLEAN,

    CONSTRAINT "AttendanceCheckInOutStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_statusId_key" ON "Attendance"("statusId");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AttendanceCheckInOutStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
