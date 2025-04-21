/*
  Warnings:

  - You are about to drop the column `checkOutEnabled` on the `Settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "checkOutEnabled",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "type" "SettingType" NOT NULL DEFAULT 'STRING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
