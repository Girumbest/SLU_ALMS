-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "isApprovedByAdmin" BOOLEAN DEFAULT false,
ADD COLUMN     "isApprovedBySupervisor" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "LeaveType" ADD COLUMN     "isReccuring" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leaveTypeId" INTEGER NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_leaveTypeId_key" ON "LeaveBalance"("leaveTypeId");

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
