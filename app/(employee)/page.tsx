"use client"
import { useState, useEffect, useCallback } from 'react';
import FaceRecognition from '@/components/FaceDetection1'; // Your existing component
import { useSession } from 'next-auth/react';
import { getEmployeeAttendanceHistory, registerAttendanceByEmployee } from '@/features/hr-admin/actions';
import toast from 'react-hot-toast';
import * as faceapi from 'face-api.js';
import { ClipLoader } from 'react-spinners';

interface AttendanceRecord {
  [x: string]: any;
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
  const [loadAttendanceHistory, setLoadAttendanceHistory] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  const [areModelsLoaded, setAreModelsLoaded] = useState(false);
  const [modelLoadingError, setModelLoadingError] = useState<string | null>(null);

  // Fetch attendance history (mock data for example)
  useEffect(() => {
    const fetchAttendanceRegisterStatus = async () => {
      try {
        const response = session?.user && await registerAttendanceByEmployee(Number(session?.user?.id), true)
        if(!response){return toast.error('Error fetching attendance register status');}
        if(response?.isWorkingDay === false){setIsWorkingDay(false); 
          setToastMessage("Not a work day.")
         return
        }
        if(response?.onLeave){setIsOnLeave(true); return}
        console.log("status: ",response)
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
  }, [session?.user?.id, loadAttendanceHistory]);

  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        console.log('Loading face detection models in page...');
        // You can show a global loading toast if desired:
        // toast.loading('Loading recognition engine...', { id: 'model-load-toast' });
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setAreModelsLoaded(true);
        setModelLoadingError(null);
        console.log('Face detection models loaded in page.');
        // toast.success('Recognition engine ready!', { id: 'model-load-toast' });
      } catch (error) {
        console.error('Error loading face-api models in page:', error);
        setModelLoadingError('Failed to load face recognition models. Please try refreshing the page.');
        toast.error('Failed to load face recognition models.');
      }
    };
    if (sessionStatus === 'authenticated') { // Only load if session is authenticated
      loadFaceApiModels();
    }
  }, [sessionStatus]);

  const [isClockedOut, setIsClockedOut] = useState(false)

  useEffect(() => {
    if (attendanceRegisterStatus) {
      if(attendanceRegisterStatus.timeOfTheDay === "morning"){
        if(attendanceRegisterStatus.attendance?.morningCheckInTime){
          setIsClockedIn(true)
          if(attendanceRegisterStatus.attendance?.morningCheckOutTime){
            setIsClockedOut(true)
          }
        }
      }
      if(attendanceRegisterStatus.timeOfTheDay === "afternoon"){
        if(attendanceRegisterStatus.attendance?.afternoonCheckInTime){
          setIsClockedIn(true)
          if(attendanceRegisterStatus.attendance?.afternoonCheckOutTime){
            setIsClockedOut(true)
          }
        }
      }
    }
  }, [attendanceRegisterStatus]);

  const disabled = useCallback(() => {
    if(isOnLeave){
      setToastMessage("You are on leave.")
      return true
    }

    if(!isWorkingDay){
     setToastMessage("Not a work day.")
      return true
    }

    

    if(attendanceRegisterStatus && !attendanceRegisterStatus?.timeOfTheDay){
      setToastMessage("Not within attendance time.")
      return true
    }
    
    if(isClockedIn && isClockedOut){
      setToastMessage("Already clocked-out.")
      return true
    }
    if(attendanceRegisterStatus && isClockedIn && !attendanceRegisterStatus?.checkOutEnabled){
      setToastMessage("Already clocked-in.")
      return true
    }
    //check for lateness
    if(attendanceRegisterStatus && attendanceRegisterStatus.isLateForClockIn && !attendanceRegisterStatus?.lateClockInEnabled){
      // alert(attendanceRegisterStatus?.lateClockInEnabled)
      setToastMessage("Not within attendance time.")
      return true
    }
    return false;
  }, [isOnLeave, isWorkingDay, attendanceRegisterStatus, isClockedIn, isClockedOut]);

  useEffect(() => {
    setIsDisabled(disabled());
  }, [disabled]);

  const displayToastMessage = () => {
    if(attendanceRegisterStatus && toastMessage){
      toast(toastMessage, {
        style:{
          background: "#1E88E5"
        }
      })
    }else{
      toastMessage && toast(toastMessage, {
        style:{
          background: "#1E88E5"
        }
      })
    }

  }

  const handleClockAction = () => {
    setShowFaceRecognition(true);
  };

  const handleFaceRecognitionSuccess = (userId: string) => {
    setShowFaceRecognition(false);
    
    // In a real app, you would call your API here to record the attendance
    if (isClockedIn) {
      // Clock out logic
      console.log('Clocking out...');
      setLoadAttendanceHistory(true)
    } else {
      // Clock in logic
      setLoadAttendanceHistory(true)
      console.log('Clocking in...');
      // setIsClockedIn(true);
      // Add new attendance record
      const today = new Date().toISOString().split('T')[0];
      // const newRecord: AttendanceRecord = {
      //   id: Date.now().toString(),
      //   userId: userId, // Add userId from face recognition
      //   date: today,
      //   clockIn: new Date().toLocaleTimeString(),
      //   clockOut: null,
      //   status: 'present'
      // };
      // setAttendanceHistory(prev => [newRecord, ...prev]);
    }
  };

  const handleFaceRecognitionClose = () => {
    setShowFaceRecognition(false);
    setLoadAttendanceHistory(!loadAttendanceHistory)
  };

  const overallButtonDisabled = isDisabled || !areModelsLoaded || !!modelLoadingError;
  const clockButtonText = () => {
    if (modelLoadingError) return "Error Loading Models";
    if (!areModelsLoaded && sessionStatus === 'authenticated') return ""//"Engine Loading..."; // Show only if session is loaded
    if (!areModelsLoaded && sessionStatus !== 'authenticated') return isClockedIn ? 'Clock Out' : 'Clock In'; // Default text if session not loaded yet
    return isClockedIn ? 'Clock Out' : 'Clock In';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Employee Attendance</h1>
        {/* Clock In/Out Button */}
        <div className="flex flex-col items-center justify-center mb-12">
          <span  className="inline-block"> {/* Wrapper element onMouseOver={isDisabled ? displayToastMessage : undefined}*/}
            <button
              disabled={overallButtonDisabled}
              onClick={!overallButtonDisabled ? handleClockAction : undefined} // Prevent click if disabled
              className={`relative overflow-hidden px-8 py-4 rounded-lg text-white font-bold text-lg shadow-lg transform transition-all duration-300 ${!overallButtonDisabled ? 'hover:scale-105' : ''} focus:outline-none ${!overallButtonDisabled ? 'focus:ring-2 focus:ring-offset-2' : ''} ${
                overallButtonDisabled
                  ? 'bg-gray-500 cursor-not-allowed'
                  :
                  isClockedIn
                    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
              }`}
              // Conditionally apply pointer-events if you want to ensure the button itself doesn't capture hover when disabled
              // style={isDisabled ? { pointerEvents: 'none' } : {}}
            >
              <span className="relative z-10">
                {clockButtonText()}
              </span>
              {!overallButtonDisabled && ( // Only show hover effects if not disabled
                <>
                  <span
                    className={`absolute inset-0 z-0 bg-black bg-opacity-10 transition-opacity duration-300 ${
                      isClockedIn ? 'hover:bg-opacity-20' : 'hover:bg-opacity-20'
                    }`}
                  ></span>
                  <span
                    className={`absolute inset-0 rounded-lg ${
                      isClockedIn ? 'bg-red-600' : 'bg-green-600'
                    } opacity-0 hover:opacity-100 transition-opacity duration-300`}
                  ></span>
                </>
              )}
              <ClipLoader color="#ffffff"
                loading={!areModelsLoaded && sessionStatus === 'authenticated'}
                size={20}
                cssOverride={{
                  display: 'block',
                  margin: '0 auto',
                  // If the loader needs to be absolutely centered within the button,
                  // you might need to adjust button styles or use absolute positioning here.
                  // For now, this will center it horizontally.
                }}
              />
            </button>
          </span>
          {!overallButtonDisabled && attendanceRegisterStatus && <span className={`text-sm text-gray-500 mt-2`}>{!isClockedIn && attendanceRegisterStatus?.isLateForClockIn ? "You are late" : isClockedIn && attendanceRegisterStatus?.isEarlyForClockOut ? "It is early" : ""}</span>}
          {toastMessage && isDisabled && <span className={`text-sm text-red-500 mt-2`}>{toastMessage}</span>}
          {modelLoadingError && <span className={`text-sm text-red-500 mt-2`}>{modelLoadingError}</span>}
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
                      <p className="text-sm text-gray-500"><span>M-Clock In: {record?.morningCheckInTime ? new Date(record?.morningCheckInTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Addis_Ababa' }) : '--:--:--'}</span><span className='ml-2'>{record.checkOutEnabled && "M-Clock Out: "}</span><span>{record?.morningCheckOutTime ? new Date(record?.morningCheckOutTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Addis_Ababa' }) : record.checkOutEnabled ? '--:--:--' : ''}</span></p>
                      <p className="text-sm text-gray-500"><span>A-Clock In: {record?.afternoonCheckInTime ? new Date(record?.afternoonCheckInTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Addis_Ababa' }) : '--:--:--'}</span><span className='ml-2'>{record.checkOutEnabled && "A-Clock Out: "}</span><span>{record?.afternoonCheckOutTime ? new Date(record?.afternoonCheckOutTime)?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Addis_Ababa' }) : record.checkOutEnabled ? '--:--:--' : ''}</span></p>
                      {record?.manuallyCheckedIn && <p className="text-xs text-pretty text-gray-300">Manually Registered</p>}
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
      {showFaceRecognition && areModelsLoaded && !modelLoadingError && (
        <FaceRecognition
          onSuccess={handleFaceRecognitionSuccess}
          onClose={handleFaceRecognitionClose}
        />
      )}
    </div>
  );
}