"use client"
import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/FaceDetection1'; // Your existing component
import { useSession } from 'next-auth/react';
import { getEmployeeAttendanceHistory, registerAttendanceByEmployee } from '@/features/hr-admin/actions';
import toast from 'react-hot-toast';

interface AttendanceRecord {
  id: string;
  userId: string; // Add userId field
  date: Date;
  status: 'PRESENT' | 'ON_LEAVE' | 'ABSENT';
  morningCheckInTime: Date;
  morningCheckOutTime: Date;
  afternoonCheckInTime: Date;
  afternoonCheckOutTime: Date;
  checkOutEnabled: boolean;
}
interface AttendanceRegisterStatus{
  timeOfTheDay:string;
  attendance: any;
  checkOutEnabled: boolean;
  lateClockInEnabled: boolean;
  isLateForClockIn: boolean;
  isEarlyForClockOut: boolean;
}
export default function AttendancePage() {
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState<boolean>(false);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {data:session, status: sessionStatus} = useSession();
  const [attendanceRegisterStatus, setAttendanceRegisterStatus] = useState<AttendanceRegisterStatus>()
  const [isWorkingDay, setIsWorkingDay] = useState<boolean>(true)
  const [isOnLeave, setIsOnLeave] = useState<boolean>(false)

  // Fetch attendance history (mock data for example)
  useEffect(() => {
    const fetchAttendanceRegisterStatus = async () => {
      try {
        const response = session?.user && await registerAttendanceByEmployee(Number(session?.user?.id), true)
        if(!response){return toast.error('Error fetching attendance register status');}
        if(response?.isWorkingDay === false){setIsWorkingDay(false); return}
        if(response?.onLeave){setIsOnLeave(true); return}
        
        setAttendanceRegisterStatus(response as AttendanceRegisterStatus);

      } catch (error) {
        toast.error('Error fetching attendance register status');
        console.error('Error fetching attendance register status:', error);
      }
    };
    const fetchAttendanceHistory = async () => {
      try {
        // In a real app, you would fetch this from your API
        const attendanceData: AttendanceRecord[] = session?.user ? await getEmployeeAttendanceHistory(Number(session?.user?.id)) : [];
        
        // const mockData: AttendanceRecord[] = [
        //   {
        //     id: '1',
        //     date: '2023-05-15',
        //     clockIn: '09:00:00',
        //     morningCheckInTime: new Date(),
        //     afternoonCheckInTime: new Date(),
        //     morningCheckOutTime: new Date(),
        //     afternoonCheckOutTime: new Date(),
        //     checkOutEnabled: true,
        //     clockOut: '17:30:00',
        //     status: 'ABSENT'
        //   },
        //   {
        //     id: '2',
        //     date: '2023-05-14',
        //     clockIn: '09:15:00',
        //     clockOut: '17:45:00',
        //     status: 'ON_LEAVE',
        //     morningCheckInTime: new Date(),
        //     afternoonCheckInTime: new Date(),
        //     morningCheckOutTime: new Date(),
        //     afternoonCheckOutTime: new Date(),
        //   },
        //   {
        //     id: '3',
        //     date: '2023-05-13',
        //     clockIn: '08:45:00',
        //     clockOut: '17:15:00',
        //     status: 'PRESENT',
        //     morningCheckInTime: new Date(),
        //     afternoonCheckInTime: null,
        //     morningCheckOutTime: new Date(),
        //     afternoonCheckOutTime: new Date(),
        //   },
        // ];
        
        // Check if user is already clocked in today
        // const todayRecord = mockData.find(record => 
        //   record.date === new Date().toISOString().split('T')[0]
        // );
        
        // if (todayRecord && !todayRecord.clockOut) {
        //   setIsClockedIn(true);
        // }
        
        setAttendanceHistory(attendanceData);
      } catch (error) {
        toast.error('Error fetching attendance history');
        console.error('Error fetching attendance history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceRegisterStatus();
    fetchAttendanceHistory();
  }, [session?.user?.id]);

  useEffect(() => {
    if (attendanceRegisterStatus) {
      if(attendanceRegisterStatus.timeOfTheDay === "morning"){
        if(attendanceRegisterStatus.attendance?.morningCheckInTime){
          setIsClockedIn(true)
        }
      }
      if(attendanceRegisterStatus.timeOfTheDay === "afternoon"){
        if(attendanceRegisterStatus.attendance?.afternoonCheckInTime){
          setIsClockedIn(true)
        }
      }
    }
  }, [attendanceRegisterStatus]);


  const handleClockAction = () => {
    setShowFaceRecognition(true);
  };

  const handleFaceRecognitionSuccess = (userId: string) => {
    setShowFaceRecognition(false);
    
    // In a real app, you would call your API here to record the attendance
    if (isClockedIn) {
      // Clock out logic
      console.log('Clocking out...');
      setIsClockedIn(false);
      // Update the attendance history with clock out time
      setAttendanceHistory(prev => {
        const today = new Date().toISOString().split('T')[0];
        return prev.map(record => {
          if (record.date === today && record.userId === userId) {
            return {
              ...record,
              clockOut: new Date().toLocaleTimeString(),
            };
          }
          return record;
        });
      });
    } else {
      // Clock in logic
      console.log('Clocking in...');
      setIsClockedIn(true);
      // Add new attendance record
      const today = new Date().toISOString().split('T')[0];
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: userId, // Add userId from face recognition
        date: today,
        clockIn: new Date().toLocaleTimeString(),
        clockOut: null,
        status: 'present'
      };
      setAttendanceHistory(prev => [newRecord, ...prev]);
    }
  };

  const handleFaceRecognitionClose = () => {
    setShowFaceRecognition(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Employee Attendance</h1>
        
        {/* Clock In/Out Button */}
        <div className="flex flex-col items-center justify-center mb-12">
          <button
            disabled={isClockedIn && !attendanceRegisterStatus?.checkOutEnabled || !isWorkingDay || isOnLeave || !attendanceRegisterStatus?.timeOfTheDay}
            onClick={handleClockAction}
            className={`relative overflow-hidden px-8 py-4 rounded-lg text-white font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              (isClockedIn && !attendanceRegisterStatus?.checkOutEnabled || !isWorkingDay || isOnLeave || !attendanceRegisterStatus?.timeOfTheDay) 
                ? 'bg-gray-500 cursor-not-allowed' 
                :
              isClockedIn 
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500' 
                : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
            }`}
          >
            <span className="relative z-10">
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </span>
            <span 
              className={`absolute inset-0 z-0 bg-black bg-opacity-10 transition-opacity duration-300 ${
                isClockedIn ? 'hover:bg-opacity-20' : 'hover:bg-opacity-20'
              }`}
            ></span>
            <span 
              className={`absolute inset-0 rounded-lg ${
                (isClockedIn && !attendanceRegisterStatus?.checkOutEnabled || !isWorkingDay || isOnLeave || !attendanceRegisterStatus?.timeOfTheDay) 
                ? 'bg-gray-500'
                : 
                isClockedIn ? 'bg-red-600' : 'bg-green-600'
              } opacity-0 hover:opacity-100 transition-opacity duration-300`}
            ></span>
          </button>
          <span className='text-sm text-gray-500 mt-2'>{attendanceRegisterStatus?.isLateForClockIn ? "You are late" : attendanceRegisterStatus?.isEarlyForClockOut ? "You are early" : ""}</span>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Attendance History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance records...</p>
            </div>
          ) : attendanceHistory.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No attendance records found.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {attendanceHistory.map((record) => (
                <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="flex space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'PRESENT' 
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'ON_LEAVE' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500"><span>M-Clock In: {record?.morningCheckInTime ? new Date(record?.morningCheckInTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '--:--:--'}</span><span className='ml-2'>{record.checkOutEnabled && "M-Clock Out: "}</span><span>{record?.morningCheckOutTime ? new Date(record?.morningCheckOutTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : record.checkOutEnabled ? '--:--:--' : ''}</span></p>
                      <p className="text-sm text-gray-500"><span>A-Clock In: {record?.afternoonCheckInTime ? new Date(record?.afternoonCheckInTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '--:--:--'}</span><span className='ml-2'>{record.checkOutEnabled && "A-Clock Out: "}</span><span>{record?.afternoonCheckOutTime ? new Date(record?.afternoonCheckOutTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : record.checkOutEnabled ? '--:--:--' : ''}</span></p>
                      
                      {/* <p className="text-sm text-gray-500">
                        Clock Out: {record.clockOut || '--:--:--'}
                      </p> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Face Recognition Modal */}
      {showFaceRecognition && (
  <FaceRecognition 
    onSuccess={handleFaceRecognitionSuccess}
    onClose={handleFaceRecognitionClose}
  />
)}
    </div>
  );
}