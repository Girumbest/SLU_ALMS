"use client";
import React, { useState, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { calculateLeaveDays, createLeaveRequest, getLeaveBalance, getLeaveTypes } from "@/features/hr-admin/actions";
import { UserFormState } from "@/features/hr-admin/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";

interface LeaveType {
  id: number;
  name: string;
  maxDays: number;
}

const LeaveRequestPage = () => {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<number | null>(
    null
  );

  const initialState: UserFormState = {};
  const [state, formAction] = useActionState(createLeaveRequest, initialState);

  const [leaveBalance, setLeaveBalance] = useState<number | null>(null);
  const [leaveDays, setLeaveDays] = useState<number>(0);
  const [calculatingLeave, setCalculatingLeave] = useState<boolean>(false);
  const [loadingLeaveBalance, setLoadingLeaveBalance] = useState<boolean>(false);

  // const leaveTypes = []

  // const leaveTypes = []
  const { data: session } = useSession();
  const empId = session?.user?.id; //temp
  
  useEffect(() => {
    getLeaveTypes().then((data) => {
      setLeaveTypes(data.leaveTypes);
    });
    if (selectedLeaveType){
      setLoadingLeaveBalance(true);
      getLeaveBalance(Number(empId), selectedLeaveType).then((data) => {
        setLeaveBalance(data.leaveBalance?.balance!);
        setLoadingLeaveBalance(false);
      });
    }
    // setLeaveTypes([
    //   { id: 1, name: "Casual Leave" },
    //   { id: 2, name: "Sick Leave" },
    //   { id: 3, name: "Maternity Leave" },
    //   { id: 4, name: "Paternity Leave" },])
    
  }, [selectedLeaveType]);

  useEffect(() => {
    if (state.successMsg) {
      toast.success(state.successMsg);
      router.push("/leave/history");
    } else if (state.errorMsg) {
      toast.error(state.errorMsg);
    }
  }, [state, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLeaveType) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate) || leaveTypes.find(type => type.id === selectedLeaveType)?.name !== "Sick Leave" && (new Date(endDate) < new Date() || new Date(startDate) < new Date())) {
      toast.error("Please select a valid date range.");
      return;
    }
    if (!reason) {
      toast.error("Please provide a reason for your leave request.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("leaveTypeId", selectedLeaveType.toString());
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("reason", reason);
    formData.append("empId", (empId && empId.toString() || ""));
    startTransition(async () => {
      // await action(new FormData(form)
      await formAction(formData); // Manually trigger form action
  });
    // await formAction(formData);
  };

  const setCalculatedLeaveDays =  async () => {
    if (startDate && endDate) {
      const leaveDays = await calculateLeaveDays(new Date(startDate), new Date(endDate));
      setLeaveDays(leaveDays);
      setCalculatingLeave(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Request Leave
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="empId" value={empId} />
        <div>
          <label
            htmlFor="leaveType"
            className="block text-sm font-medium text-gray-700"
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            name="leaveType"
            onChange={(e) =>
              setSelectedLeaveType(parseInt(e.target.value, 10))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700"
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={endDate}
            onChange={(e) => {setEndDate(e.target.value); setCalculatingLeave(true);setCalculatedLeaveDays()}}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mt-2 flex justify-between">
          <p className="text-gray-700 sm:text-sm">No. Days: <ClipLoader loading={calculatingLeave} size={18} />{leaveDays && leaveDays}</p>
          {/* <p className="text-gray-700 sm:text-sm">Leave Balance: {leaveBalance ? leaveBalance - (new Date(endDate).getDate() - new Date(startDate).getDate()) || leaveBalance : startDate && endDate ? leaveTypes.find(type => type.id === selectedLeaveType)?.maxDays! - (new Date(endDate).getDate() - new Date(startDate).getDate()) : leaveTypes.find(type => type.id === selectedLeaveType)?.maxDays}</p> */}
          <p className="text-gray-700 sm:text-sm">Leave Balance: <ClipLoader loading={loadingLeaveBalance} size={18} /> {leaveBalance ? leaveBalance - (leaveDays) || leaveBalance : startDate && endDate ? leaveTypes.find(type => type.id === selectedLeaveType)?.maxDays! - (leaveDays) : leaveTypes.find(type => type.id === selectedLeaveType)?.maxDays}</p>

        </div>
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestPage;
