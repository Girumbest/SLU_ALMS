/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `LeaveType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_name_key" ON "LeaveType"("name");
