/*
  Warnings:

  - You are about to drop the column `statusId` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the `AttendanceCheckInOutStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_statusId_fkey";

-- DropIndex
DROP INDEX "Attendance_statusId_key";

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "statusId",
ADD COLUMN     "isEarlyAfternoonCheckOut" BOOLEAN,
ADD COLUMN     "isEarlyMorningCheckOut" BOOLEAN,
ADD COLUMN     "isLateAfternoonCheckIn" BOOLEAN,
ADD COLUMN     "isLateMorningCheckIn" BOOLEAN;

-- DropTable
DROP TABLE "AttendanceCheckInOutStatus";
