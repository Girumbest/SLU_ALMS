/*
  Warnings:

  - A unique constraint covering the columns `[userId,leaveTypeId]` on the table `LeaveBalance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_userId_leaveTypeId_key" ON "LeaveBalance"("userId", "leaveTypeId");
