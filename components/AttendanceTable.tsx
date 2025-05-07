"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { FaUserEdit, FaTrash, FaEye, FaSearch, FaFilePdf, FaPrint } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { getEmployeesAttendance} from "@/features/hr-admin/actions";
import { exportToCSV,printTable } from "@/features/hr-admin/utils";
import AttendanceEditModal from "./AttendanceEditModal";
import toast from "react-hot-toast";
import { ClipLoader, PropagateLoader } from "react-spinners";

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
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  // phoneNumber: string | null;
  // jobTitle: string | null;
  department: { name: string } | null;
  attendances: Attendance[];
  photograph?: string;
}

interface AttendanceTableProps {
  departments?: { name: string; id: number }[];
  supId?: number;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ departments,supId }) => {
  const [attendance, setAttendance] = useState<
    Employee["attendances"] | undefined
  >();
  const [settings, setSettings] =
    useState<{ key: string; value: string; type: string }[]>();
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number>();

  const openAttendanceEditModal = (
    attendance?: Employee["attendances"],
    employeeId?: number
  ) => {
    setEmployeeId(employeeId);
    setAttendance(attendance);
    setIsAttendanceModalOpen(true);
  };

  const [date, setDate] = useState<Date>(new Date());
  const [rerender, setRerender] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(10)
  // const employeesPerPage = 5;

  const [filters, setFilters] = useState<{
    filterKey: string;
    searchValue: string;
  }>({
    filterKey: "",
    searchValue: "",
  });

  const [totalResults, setTotalResults] = useState<number>(0);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [employeesAttendance, setEmployeesAttendance] = useState<Employee[]>(
    []
  );
  const status = ["Absent", "Present", "On_Leave"];
  const [isWorkDay, setIsWorkDay] = useState<boolean>(true)
  const [dataLoading, setDataLoading] = useState<boolean>(true)


  useEffect(() => {
    setFilters({ filterKey: "", searchValue: "" });
    setCurrentPage(1);
    const fetchData = async () => {
      const data = await getEmployeesAttendance(
        // filters.searchValue,
        "",
        filters.filterKey,
        undefined,
        currentPage,
        date,
        supId
      );
      if(data?.errorMsg){
        if(!(data?.isWorkingDay)){
          setIsWorkDay(false)
          setFilteredEmployees([]);
          setEmployeesAttendance([]);
        }
        toast.error(data.errorMsg)
        setDataLoading(false);
        return
      }
      setFilteredEmployees(data.employees);
      setEmployeesAttendance(data.employees);
      setSettings(data.settings);
      setTotalResults(data.total);
    setDataLoading(false);

    };
    fetchData();
  }, [date, rerender]); //[filters, currentPage, date]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) {
      setFilters({ filterKey: "", searchValue: "" });
    } else {
      setFilters({
        filterKey: "hireDate",
        searchValue: `${startDate}:${endDate}`,
      });
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters({ filterKey: column, searchValue: value });
    if (column == "name") {
      setFilteredEmployees(
        employeesAttendance.filter(
          (employee) =>
            employee.firstName.toLowerCase().includes(value.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    if (column == "username") {
      setFilteredEmployees(
        employeesAttendance.filter((employee) =>
          employee.username.toLowerCase().includes(value.toLowerCase())
        )
      );
      setTotalResults(filteredEmployees.length)
    }
    if (column == "department") {
      setFilteredEmployees(
        employeesAttendance.filter((employee) =>
          employee.department?.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
    if (column == "m-check-in") {
      setFilteredEmployees(
        employeesAttendance.filter((employee) => {
          return new Date(employee.attendances[0]?.morningCheckInTime!)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
            .includes(value);
        })
      );
    }

    if (column == "m-check-out") {
      // alert(value)
      setFilteredEmployees(
        employeesAttendance.filter((employee) => {
          return new Date(employee.attendances[0]?.morningCheckOutTime!)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
            .includes(value);
        })
      );
    }

    if (column == "a-check-in") {
      // alert(value)
      setFilteredEmployees(
        employeesAttendance.filter((employee) => {
          return new Date(employee.attendances[0]?.afternoonCheckInTime!)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
            .includes(value);
        })
      );
    }

    if (column == "a-check-out") {
      // alert(value)
      setFilteredEmployees(
        employeesAttendance.filter((employee) => {
          return new Date(employee.attendances[0]?.afternoonCheckOutTime!)
            .toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            })
            .includes(value);
        })
      );
    }
    if (column == "status") {
      if(!value){
        setFilteredEmployees(employeesAttendance); 
        return
      }
      
      if(value == "Absent"){
        setFilteredEmployees(
          employeesAttendance.filter((employee) =>{
            return (employee.attendances[0]?.status.toLowerCase().includes(value.toLowerCase()) || !(employee.attendances[0]?.status))
          }
          )
        );
      }
      else{
      setFilteredEmployees(
        employeesAttendance.filter((employee) =>
          employee.attendances[0]?.status.toLowerCase().includes(value.toLowerCase())
          || employee?.leaveRequests?.length > 0
        )
      );
    }
    }

  };

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + employeesPerPage)



  //==========================REPORT===========================
  const tableRef = useRef<HTMLTableElement>(null);

  // Add this near your other state declarations
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [isPrinting, setIsPrinting] = useState(false)

// Add these functions inside your component
const generateCSVReport =  () => {
  setIsGeneratingReport(true);
  try {
    const reportData = filteredEmployees.map(employee => {
      const attendance = employee.attendances[0] || {};
      return {
        Name: `${employee.firstName} ${employee.lastName}`,
        Username: employee.username,
        Department: employee.department?.name || 'N/A',
        'Morning Check-In': attendance.morningCheckInTime 
          ? new Date(attendance.morningCheckInTime).toLocaleTimeString('en-US', {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            })
          : '-',
        'Morning Check-Out': attendance.morningCheckOutTime 
          ? new Date(attendance.morningCheckOutTime).toLocaleTimeString('en-US', {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            })
          : '-',
        'Afternoon Check-In': attendance.afternoonCheckInTime 
          ? new Date(attendance.afternoonCheckInTime).toLocaleTimeString('en-US', {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            })
          : '-',
        'Afternoon Check-Out': attendance.afternoonCheckOutTime 
          ? new Date(attendance.afternoonCheckOutTime).toLocaleTimeString('en-US', {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false,
              timeZone: 'UTC'
            })
          : '-',
        Status: attendance.status 
          ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1).toLowerCase()
          : employee?.leaveRequests?.length > 0 ? 'On Leave' : 'Absent',
        'Late Morning': attendance.isLateMorningCheckIn ? 'Yes' : 'No',
        'Early Morning': attendance.isEarlyMorningCheckOut ? 'Yes' : 'No',
        'Late Afternoon': attendance.isLateAfternoonCheckIn ? 'Yes' : 'No',
        'Early Afternoon': attendance.isEarlyAfternoonCheckOut ? 'Yes' : 'No'
      };
    });

    exportToCSV(reportData, `Attendance_Report_${date.toISOString().split('T')[0]}`);
  } catch (error) {
    toast.error('Failed to generate report');
    console.error(error);
  } finally {
    setIsGeneratingReport(false);
  }
};

const handlePrint = () => {
  if(employeesPerPage >= filteredEmployees.length){
    printTable('attendance-table', `Attendance Report - ${date.toLocaleDateString()}`);
    return
  }
  setEmployeesPerPage(filteredEmployees.length)
  setIsPrinting(true)
  setTimeout(() => {
    printTable('attendance-table', `Attendance Report - ${date.toLocaleDateString()}`);
    setEmployeesPerPage(employeesPerPage)
    setIsPrinting(false)
  }, 2000);
};
  //===========================================================

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-3 text-gray-700">Employee Attendances for</span>
        <input
          className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={date.toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
        />
        <span className="ml-3 text-gray-600">
          {date.toLocaleDateString("en-US", { weekday: "long" })}
        </span>
      
      </h2>
      {/* REPORT */}
      <div className="flex space-x-2">
          <button
            onClick={generateCSVReport}
            disabled={isGeneratingReport || filteredEmployees.length === 0}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isGeneratingReport ? (
              <ClipLoader color="#ffffff" size={8} />
            ) : (
              <>
                <FaFilePdf className="mr-1" size={14} />
                Export CSV
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredEmployees.length === 0 || isPrinting}
            className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            <FaPrint className="mr-1" size={14} />
            {!isPrinting && "Print"}
            <ClipLoader loading={isPrinting} color="#ffffff" size={8} />
          </button>
        </div>
      </div>
      {/* END */}
      <div className="overflow-x-auto">
        <table ref={tableRef} id="attendance-table" className="w-full border-collapse">
          <thead>
            <tr id='header-row' className="bg-blue-600 text-white text-left">
              {[
                "Photo",
                "Name",
                "Username",
                "Department",
                "M-Check-In",
                "M-Check-Out",
                "A-Check-In",
                "A-Check-Out",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-3 relative">
                  {header === "Department" && supId ? undefined : header}
                </th>
              ))}
            </tr>

            <tr id="search-row" className="bg-gray-200">
              {[
                "Photo",
                "Name",
                "Username",
                "Department",
                "M-Check-In",
                "M-Check-Out",
                "A-Check-In",
                "A-Check-Out",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {![
                    "Photo",
                    "Department",
                    "Status",
                    "Hire Date",
                    "Actions",
                  ].includes(header) && (
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={`Search ${header}`}
                        className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                        onChange={(e) =>
                          handleFilterChange(
                            header.toLowerCase().replace(" ", ""),
                            e.target.value
                          )
                        }
                        value={
                          filters.filterKey !==
                          header.toLowerCase().replace(" ", "")
                            ? ""
                            : filters.searchValue
                        }
                      />
                      <FaSearch className="text-gray-500 ml-2" />
                    </div>
                  )}

                  {header === "Department" && !supId &&(
                    <select
                    onChange={(e) => handleFilterChange("department", e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    value={filters.filterKey === "department" ? filters.searchValue : ""}
                  >
                    <option value="">All</option>
                    {departments?.map((dept) => (
                      <option key={dept?.name} value={dept?.name}>
                        {dept?.name}
                      </option>
                    ))}
                  </select>
                  
                  )}

                  {header === "Status" && (
                    <select
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      value={filters.filterKey === "status" ? filters.searchValue : ""}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="">
                        All
                      </option>
                      {status.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )}

                  {header === "Hire Date" && (
                    <div className="relative">
                      <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200`}
                >
                  <td className="p-3">
                    <img
                      suppressHydrationWarning
                      src={
                        "/api/photos/" + employee.photograph ||
                        "/default-profile.png"
                      }
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300  "
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                    {employee.firstName} {employee.lastName}
                  </td>
                  {["username", "department"].map((field) => (
                    <td
                      key={field}
                      className="p-3 text-gray-600 truncate max-w-[150px]"
                      title={employee[field as keyof Employee]?.toString()}
                    >
                      {/* {field === "salary"
                        ? `$${employee.salary?.toLocaleString() || "N/A"}`
                        : field === "hireDate"
                        ? new Date(employee.hireDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) :*/}
                      {field === "department"
                        ? !supId && employee.department?.name
                        : employee[field as keyof Employee]?.toString()}
                    </td>
                  ))}
                  
                  {[
                    "morningCheckInTime",
                    "morningCheckOutTime",
                    "afternoonCheckInTime",
                    "afternoonCheckOutTime",
                  ].map((field, i) => (
                    <td
                      key={field}
                      className="p-3 text-gray-600 truncate max-w-[150px]"
                    >
                      {employee.attendances &&
                      employee.attendances[0] &&
                      employee.attendances[0][
                        field as keyof (typeof employee.attendances)[0]
                      ] ? (
                        <div className="flex items-center">
                          {new Date(
                            employee.attendances[0][
                              field as keyof AttendanceTime
                            ]!
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "UTC",
                          })}
                          {/* Status Badge */}
                          {i == 0 &&
                            (employee.attendances[0]?.isLateMorningCheckIn ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Late
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 1 &&
                            (employee.attendances[0]?.isEarlyMorningCheckOut ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Early
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 2 &&
                            (employee.attendances[0]?.isLateAfternoonCheckIn ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Late
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 3 &&
                            (employee.attendances[0]
                              ?.isEarlyAfternoonCheckOut ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Early
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                        </div>
                      ) : field.endsWith("CheckOutTime") &&
                      ((employee.attendances[0]&&!employee.attendances[0]?.checkOutEnabled)||(!employee.attendances[0] && (settings?.find(item => item.key === 'check_out_enabled')?.value !== 'true'))) ? (
                        "N/A"
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}

                  {/* <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {employee.attendances[0]?.status
                    ? employee.attendances[0].status.charAt(0).toUpperCase() +
                    employee.attendances[0].status.slice(1).toLowerCase()
                    : "Absent"}

                  </td> */}
                  {/* Status Badge */}
                  <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {employee.attendances[0]?.status ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.attendances[0].status.toLowerCase() ===
                          "present"
                            ? "bg-green-100 text-green-800"
                            : employee.attendances[0].status.toLowerCase() ===
                              "absent"
                            ? "bg-red-100 text-red-800"
                            : employee.attendances[0].status.toLowerCase() ===
                              "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : employee.attendances[0].status.toLowerCase() ===
                              "on_leave"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800" // Default for unknown status
                        }`}
                      >
                        {employee.attendances[0].status
                          .charAt(0)
                          .toUpperCase() +
                          employee.attendances[0].status.slice(1).toLowerCase()}
                      </span>
                    ) : employee?.leaveRequests?.length > 0
                    ? 
                    (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      On Leave
                    </span>)
                    :
                    (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Absent
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center flex action">
                    <Link
                      href={supId ? `/supervisor/attendance/${employee.id}`:`/admin/attendance/${employee.id}`}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      <FaEye size={18} />
                    </Link>
                    {(supId && settings?.find(item => item.key === 'check_out_enabled')?.value! === 'true' || !supId) &&
                    <button
                      // href={`./employees/edit/${employee.username}`}
                      disabled={employee.attendances[0]?.status === "ON_LEAVE"}
                      className="text-green-600 hover:text-green-800 mx-1"
                      onClick={(e) =>
                        openAttendanceEditModal(
                          employee.attendances,
                          employee.id
                        )
                      }
                    >
                      <FaUserEdit size={18} />
                    </button>
                    }
                    {/* <button className="text-red-600 hover:text-red-800 mx-1">
                      <FaTrash size={18} />
                    </button> */}
                  </td>
                </tr>
              ))
            ) : 
            (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">
                  {!dataLoading && (!filters.filterKey && !isWorkDay ?"Today is not a work day.":"No employees found.")}
                  <PropagateLoader 
                    loading={dataLoading}
                    color="#2563eb"
                    cssOverride={{
                      display: 'block',
                      margin: '0 auto',
                    }}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-24"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-24"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        >
          Next
        </button>
      </div>
      {isAttendanceModalOpen && (
        // attendance && attendance[0] && (
        <AttendanceEditModal
          isOpen={isAttendanceModalOpen}
          onClose={() => {
            setIsAttendanceModalOpen(false);
            setRerender(!rerender);
          }}
          attendance={attendance && attendance[0]}
          attendanceSettings={settings}
          employeeId={employeeId}
          selectedDate={date}
          supId={supId}
        />
        // )
      )}
    </div>
  );
};

export default AttendanceTable;
