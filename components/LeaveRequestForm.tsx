"use client";
import React, { useState, useEffect, startTransition } from "react";
import { useActionState } from "react";
import { calculateLeaveDays, createLeaveRequest, getLeaveBalance, getLeaveTypes } from "@/features/hr-admin/actions";
import { UserFormState } from "@/features/hr-admin/types";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ClipLoader } from "react-spinners";
import { set } from "zod";

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
    
      getLeaveTypes()
      .then((data) => {
        if (data.leaveTypes) {
          setLeaveTypes(data.leaveTypes);
        } else {
          setLeaveTypes([]);
          toast.error("Failed to load leave types.");
        }
      })
      .catch((error) => {
        console.error("Error fetching leave types:", error);
        setLeaveTypes([]);
        toast.error("Failed to load leave types.");
      });
  }, []);

  useEffect(() => {
    if (selectedLeaveType && empId) {
      setLoadingLeaveBalance(true);
 getLeaveBalance(Number(empId), selectedLeaveType)
        .then((data) => {
          setLeaveBalance(data.leaveBalance?.balance ?? null);
        })
        .catch((error) => {
          console.error("Error fetching leave balance:", error);
          toast.error("Failed to fetch leave balance.");
          setLeaveBalance(null);
        })
        .finally(() => {
          setLoadingLeaveBalance(false);
        });
    } else {
      setLeaveBalance(null); // Reset if no type selected or no empId
    }
  }, [selectedLeaveType, empId]);

  useEffect(() => {
    if (state.successMsg) {
      toast.success(state.successMsg);
      router.push("/leave/history");
    } else if (state.errorMsg) {
      // Clear previous success messages if an error occurs
      if (state.successMsg) state.successMsg = undefined;
      toast.error(state.errorMsg);
    }
  }, [state, router]);

  useEffect(() => {
    // Clear form fields after successful submission and navigation
    if (state.successMsg) {
      setStartDate("");
      setEndDate("");
      setReason("");
      setSelectedLeaveType(null);
      setLeaveDays(0);
      // state.successMsg = undefined; // Reset message after handling
    }
  }, [state.successMsg]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedLeaveType) {
      toast.error("Please select a leave type.");
      return;
    }

    if (!empId) {
      toast.error("Employee ID not found. Please re-login.");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates.");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStartDate = new Date(startDate);
    currentStartDate.setHours(0, 0, 0, 0);

    const currentEndDate = new Date(endDate);
    currentEndDate.setHours(0, 0, 0, 0);

    if (currentEndDate < currentStartDate) {
      toast.error("End date cannot be before start date.");
      return;
    }

    const selectedLeave = leaveTypes.find(
      (type) => type.id === selectedLeaveType
    );
    if (selectedLeave?.name !== "Sick Leave") {
      if (currentStartDate < today || currentEndDate < today) {
        toast.error(
          "Leave dates (except for Sick Leave) cannot be in the past. Please select today or a future date."
        );
        return;
      }
    }
    if (!reason) {
      toast.error("Please provide a reason for your leave request.");
      return;
    }
    const formData = new FormData(event.currentTarget);
 // Ensure empId from session is used as the source of truth
    formData.set("empId", empId.toString());
    // The select name is now 'leaveTypeId', so it's already on formData.
    // If selectedLeaveType (state) was null, the initial check would have caught it.
    // formData.set("leaveTypeId", selectedLeaveType.toString()); // Not needed if select name is leaveTypeId

    // startDate, endDate, reason are already on formData from their respective inputs

    startTransition(() => {
      formAction(formData);
    });
    
  };
 useEffect(() => {
    const calculateAndSetLeaveDays = async () => {
      if (startDate && endDate && new Date(endDate) >= new Date(startDate)) {
        setCalculatingLeave(true);
        try {
          const days = await calculateLeaveDays(
            new Date(startDate),
            new Date(endDate)
          );
          setLeaveDays(days);
        } catch (error) {
          console.error("Error calculating leave days:", error);
          toast.error("Could not calculate leave days.");
          setLeaveDays(0);
        } finally {
          setCalculatingLeave(false);
        }
      } else {
        setLeaveDays(0); // Reset if dates are invalid or not set
      }
    };
    //Maternity Leave / Paternity Leave
    const selectedLeaveTypeDetails = leaveTypes.find(item => item.id === selectedLeaveType);

    if (selectedLeaveTypeDetails && (selectedLeaveTypeDetails.name === "Maternity Leave" || selectedLeaveTypeDetails.name === "Paternity Leave")) {
      const maxDaysForLeave = selectedLeaveTypeDetails.maxDays;
      if (startDate) {
        // Ensure maxDaysForLeave is a positive number before using it in date calculations
        if (typeof leaveBalance === 'number' && leaveBalance > 0) {
          const startingDate = new Date(startDate);
          const newEndDate = new Date(startingDate);
          newEndDate.setDate(startingDate.getDate() + leaveBalance);
          
          setEndDate(newEndDate.toISOString().split('T')[0]);
          setLeaveDays(leaveBalance);
        } else {
          // Handle cases where maxDays might not be configured or is invalid
          setEndDate(""); // Clear end date as it cannot be calculated
          setLeaveDays(0); // Reset leave days
          toast.error(`Max days for ${selectedLeaveTypeDetails.name} is not set or invalid. Please check configuration.`);
        }
      } else {
        // If startDate is not yet selected, set leaveDays to maxDays (if available) and clear endDate
        // setLeaveDays(typeof leaveBalance === 'number' ? leaveBalance : 0);
        setLeaveDays(0)
        setEndDate(""); 
      }
    } else {
      // Not Maternity/Paternity leave OR no leave type selected
      if (!selectedLeaveType) { // If "Select Leave Type" is chosen (selectedLeaveType is null)
        setLeaveDays(0);
        setEndDate("");
        setStartDate(""); 
      }
      calculateAndSetLeaveDays();
    }
  }, [startDate, endDate, selectedLeaveType, leaveTypes]);
 
 

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Request Leave
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="empId" value={empId ?? ""} />
        <div>
          <label
            htmlFor="leaveType"
            className="block text-sm font-medium text-gray-700"
          >
            Leave Type
          </label>
          <select
            id="leaveType"
            name="leaveTypeId" // Changed name to match expected FormData key
            value={selectedLeaveType ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const newLeaveTypeId = value ? parseInt(value, 10) : null;

              // When changing leave type, reset date fields and leave days.
              // The useEffect will then correctly calculate/set values for the new type.
              setStartDate("");
              setEndDate("");
              setLeaveDays(0); 
              setSelectedLeaveType(newLeaveTypeId);
            }}
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
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mt-2 flex justify-between">
           <p className="text-gray-700 sm:text-sm">
            No. Days: <ClipLoader loading={calculatingLeave} size={15} color="#3b82f6" />
            {!calculatingLeave && leaveDays > 0 ? leaveDays : (!calculatingLeave && startDate && endDate ? leaveDays : "-")}
          </p>
          <p className="text-gray-700 sm:text-sm">
            Balance After: <ClipLoader loading={loadingLeaveBalance} size={15} color="#3b82f6" />
            {!loadingLeaveBalance &&
              (() => {
                if (leaveBalance !== null) {
                  return leaveBalance - leaveDays;
                }
                const currentLeaveType = leaveTypes.find(
                  (type) => type.id === selectedLeaveType
                );
                if (currentLeaveType?.maxDays !== undefined) {
                  return currentLeaveType.maxDays - leaveDays;
                }
                return "-";
              })()}
          </p>
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
