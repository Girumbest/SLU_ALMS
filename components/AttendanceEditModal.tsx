import { registerAttendance } from "@/features/hr-admin/actions";
import { UserFormState } from "@/features/hr-admin/types";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";


interface AttendanceTime {
  morningCheckInTime: Date | null;
  morningCheckOutTime: Date | null;
  afternoonCheckInTime: Date | null;
  afternoonCheckOutTime: Date | null;
}
interface Attendance extends AttendanceTime {
  isLateMorningCheckIn: Boolean;
  isEarlyMorningCheckOut: Boolean;
  isLateAfternoonCheckIn: Boolean;
  isEarlyAfternoonCheckOut: Boolean;
  checkOutEnabled: Boolean;
  date: Date;
  status: String;
}
interface AttendanceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance?:Attendance;
  attendanceSettings?: { key: string; value: string; type: string; }[];
  employeeId: number;
  selectedDate: Date;
  supId?: number;
}

const AttendanceEditModal: React.FC<AttendanceEditModalProps> = ({
  isOpen,
  onClose,
  attendance,
  attendanceSettings,
  employeeId,
  selectedDate,
  supId
}: // onSave,
AttendanceEditModalProps) => {
  
  const initialState: UserFormState = {};
  const [state, formAction] = useActionState(registerAttendance, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // use isPending instead of `useFormStatus().pending`
  const [isPending, startTransition] = useTransition();
  const [isModified, setIsModified] = useState(false);
  console.log("SETTINGS NEW: ",attendanceSettings?.find(item => item.key === 'check_out_enabled')?.value!== 'true')
  useEffect(() => {
    // console.log(state.errors);
    if (state?.successMsg) {
      toast.success(state.successMsg);
      // Request the form to reset once the action has completed
      formRef.current?.reset();
      onClose();
    } else if (state?.errorMsg) {
      toast.error(state.errorMsg);
    }
  }, [state]);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form reset

    if (!confirm("Do you really want to do this?")) return false;
    startTransition(async () => {
      // await action(new FormData(form)
      await formAction(new FormData(e.currentTarget)); // Manually trigger form action
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          <FaTimes />
        </button>
        <h3 className="text-lg font-semibold text-gray-700 mb-6">
          Edit Attendance for <span className="font-bold">{selectedDate?.toDateString()}</span>
        </h3>
        <form id="attendance-form" ref={formRef} onSubmit={handleSave} className="space-y-4">
          <div>
            <label
              htmlFor="morningCheckInTime"
              className="block text-sm font-medium text-gray-700"
            >
              Morning Check-In
            </label>
            <input type="hidden" name="employeeId" value={employeeId} />
            <input type="hidden" name="date" value={attendance?.date.toDateString()} />
            <input type="hidden" name="selectedDate" value={selectedDate?.toDateString()} />
            <input type="hidden" name="supId" value={supId} />
            <input
              disabled={supId?true:false}
              type="time"
              name="morningCheckInTime"
              id="morningCheckInTime"
              onChange={() => setIsModified(true)}
              min={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_in.morning}
              max={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_out.morning}
              defaultValue={
                attendance?.morningCheckInTime
                  ? new Date(attendance?.morningCheckInTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: 'UTC'
                        
                      }
                    )
                  : ""
              }
              // onChange={(e) => handleTimeChange(e, "morningCheckInTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="morningCheckOutTime"
              className="block text-sm font-medium text-gray-700"
            >
              Morning Check-Out
            </label>
            <input
              type="time"
              name="morningCheckOutTime"
              id="morningCheckOutTime"
              onChange={() => setIsModified(true)}
              min={attendance?.morningCheckInTime
                ? new Date(
                    attendance?.morningCheckInTime
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: 'UTC'
                  })
                : JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_in.morning}
              max={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_out.morning}
              
              // disabled={(!attendance?.checkOutEnabled || attendanceSettings?.find(item => item.key === 'check_out_enabled')?.value !== 'true')?false:true}
              disabled={((attendance && !attendance.checkOutEnabled)||(!attendance && (attendanceSettings?.find(item => item.key === 'check_out_enabled')?.value !== 'true'))) ? true: false}
              defaultValue={
                attendance?.morningCheckOutTime
                  ? new Date(attendance?.morningCheckOutTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: 'UTC'
                      }
                    )
                  : ""
              }
              // onChange={(e) => handleTimeChange(e, "morningCheckOutTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="afternoonCheckInTime"
              className="block text-sm font-medium text-gray-700"
            >
              Afternoon Check-In
            </label>
            <input
              disabled={supId?true:false}
              type="time"
              name="afternoonCheckInTime"
              id="afternoonCheckInTime"
              onChange={() => setIsModified(true)}
              min={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_in.afternoon}
              max={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_out.afternoon}
              defaultValue={
                attendance?.afternoonCheckInTime
                  ? new Date(
                      attendance?.afternoonCheckInTime
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: 'UTC'
                    })
                  : ""
              }
              // onChange={(e) => handleTimeChange(e, "afternoonCheckInTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="afternoonCheckOutTime"
              className="block text-sm font-medium text-gray-700"
            >
              Afternoon Check-Out
            </label>
            <input
              type="time"
              name="afternoonCheckOutTime"
              id="afternoonCheckOutTime"
              onChange={() => setIsModified(true)}
              min={attendance?.afternoonCheckInTime
                ? new Date(
                    attendance?.afternoonCheckInTime
                  ).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: 'UTC'
                  })
                : JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_in.afternoon}
              max={JSON.parse(attendanceSettings?.find(item => item.key === 'attendance_time')?.value!).check_out.afternoon}
              // disabled={!attendance?.morningCheckInTime && (!attendance?.checkOutEnabled || attendanceSettings?.find(item => item.key === 'check_out_enabled')?.value !== 'true')}
              disabled={((attendance && !attendance.checkOutEnabled)||(!attendance && (attendanceSettings?.find(item => item.key === 'check_out_enabled')?.value !== 'true'))) ? true: false}

              defaultValue={
                attendance?.afternoonCheckOutTime
                  ? new Date(
                      attendance?.afternoonCheckOutTime
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: 'UTC'
                    })
                  : ""
              }
              // onChange={(e) => handleTimeChange(e, "afternoonCheckOutTime")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              onChange={() => setIsModified(true)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              defaultValue={attendance?.status || "Absent"}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              {/* <option value="On_Leave">On Leave</option> */}
            </select>

          </div>
        </form>
        <div className="mt-6 flex justify-end">
          <button
              onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="attendance-form"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={isPending || !isModified}
            
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default AttendanceEditModal;
