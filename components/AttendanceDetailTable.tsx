"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaUserEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { getAllAttendance, getEmployeesAttendance } from "@/features/hr-admin/actions";
import AttendanceEditModal from "./AttendanceEditModal";

interface AttendanceTime {
  morningCheckInTime: Date | null;
  morningCheckOutTime: Date | null;
  afternoonCheckInTime: Date | null;
  afternoonCheckOutTime: Date | null;
}
interface Attendance extends AttendanceTime {
  id: number,
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
  departments: { name: string; id: number }[];
  empId: string;
}

const AttendanceDetailTable: React.FC<AttendanceTableProps> = ({ departments, empId }) => {
  const [attendance, setAttendance] = useState<
    Employee["attendances"] | undefined
  >();
  const [settings, setSettings] =
    useState<{ key: string; value: string; type: string }[]>();
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<number>();

  const openAttendanceEditModal = (
    attendance?: Attendance[],
    employeeId?: number
  ) => {
    setEmployeeId(employeeId);
    setAttendance(attendance);
    setIsAttendanceModalOpen(true);
  };

  const [date, setDate] = useState<Date>();
  const [rerender, setRerender] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const attendancesPerPage = 5;

  const [searchKey, setSearchKey] = useState<string>('') // used to reset filter search input
  const [filters, setFilters] = useState<{
    filterKey: string;
    searchValue: string;
  }>({
    filterKey: "",
    searchValue: "",
  });

  const [totalResults, setTotalPages] = useState<number>(0);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [employeesAttendance, setEmployeesAttendance] = useState<Attendance[]>(
    []
  );
  const status = ["Absent", "Present", "On_Leave"];
  const [employeeName, setEmployeeName] = useState<string>();
  
  useEffect(() => {
    // setFilters({ filterKey: "", searchValue: "" });
    setCurrentPage(1);
    const fetchData = async () => {
      const data = await getAllAttendance(
        Number(empId),
        filters.searchValue,
        filters.filterKey,
        attendancesPerPage,
        currentPage,
        // date
      );
      setFilteredAttendances(data.employee?.attendances);
      setEmployeeName(data.employee?.firstName + " " + data.employee?.lastName)
      // setEmployeesAttendance(data.employees);
      setSettings(data.settings);
      setTotalPages(data.total);
      console.log(filteredAttendances);
    };
    fetchData();
  }, [date, filters, currentPage, rerender]); //[filters, currentPage, date]);

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    if (!startDate && !endDate) {
      setFilters({ filterKey: "", searchValue: "" });
    } else {
      // setDate(`${startDate}:${endDate}`)
      setFilters({
        filterKey: "date",
        searchValue: `${startDate}:${endDate}`,
      });
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    console.log(searchKey)
    setSearchKey(column);
    setFilters({ filterKey: column, searchValue: value });
    // if (column == "name") {
    //   setFilteredAttendances(
    //     employeesAttendance.filter(
    //       (employee) =>
    //         employee.firstName.toLowerCase().includes(value.toLowerCase()) ||
    //         employee.lastName.toLowerCase().includes(value.toLowerCase())
    //     )
    //   );
    // }
    // if (column == "username") {
    //   setFilteredAttendances(
    //     employeesAttendance.filter((employee) =>
    //       employee.username.toLowerCase().includes(value.toLowerCase())
    //     )
    //   );
    // }
    // if (column == "department") {
    //   setFilteredAttendances(
    //     employeesAttendance.filter((employee) =>
    //       employee.department?.name.toLowerCase().includes(value.toLowerCase())
    //     )
    //   );
    // }
    if (column == "m-check-in") {
      setFilters({ filterKey: "morningCheckInTime", searchValue: value});
    }
    if (column == "m-check-out") {
      setFilters({ filterKey: "morningCheckOutTime", searchValue: value});

    }

    if (column == "a-check-in") {
      setFilters({ filterKey: "afternoonCheckInTime", searchValue: value});

    }

    if (column == "a-check-out") {
      setFilters({ filterKey: "afternoonCheckOutTime", searchValue: value});
    }
  };

  const totalPages = Math.ceil(totalResults / attendancesPerPage);
  const paginatedEmployees = filteredAttendances;

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        
        <span className="mr-3 text-gray-700">{`Attendances of Employee: ${employeeName}`}</span>
        {/* <input
          className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          type="date"
          max={new Date().toISOString().split("T")[0]}
          defaultValue={date?.toISOString().split("T")[0]}
          onChange={(e) => setDate(new Date(e.target.value))}
        />
        <span className="ml-3 text-gray-600">
          {date?.toLocaleDateString("en-US", { weekday: "long" })}
        </span> */}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              {[
                "Date",
                "M-Check-In",
                "M-Check-Out",
                "A-Check-In",
                "A-Check-Out",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-3 relative">
                  {header}
                </th>
              ))}
            </tr>

            <tr className="bg-gray-200">
              {[
                "Date",
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
                    "Date",
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
                          searchKey !==
                          header.toLowerCase().replace(" ", "")
                            ? ""
                            : filters.searchValue
                        }
                      />
                      <FaSearch className="text-gray-500 ml-2" />
                    </div>
                  )}

                  {header === "Department" && (
                    <select
                      onChange={(e) =>
                        handleFilterChange("department", e.target.value)
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                      value={filters.filterKey === "department" ? filters.searchValue : ""}
                    >
                      <option
                        value=""
                      >
                        All
                      </option>
                      {departments.map((dept) => (
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
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="" selected={filters.filterKey != "status"}>
                        All
                      </option>
                      {status.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )}

                  {header === "Date" && (
                    <div className="relative">
                      <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                        style="left-5 right-auto"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((attendance, index) => (
                <tr
                  key={attendance.id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200`}
                >
                  {/* <td className="p-3">
                    <img
                      suppressHydrationWarning
                      src={
                        "/api/photos/" + employee.photograph ||
                        "/default-profile.png"
                      }
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  </td> */}

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                    {attendance.date.toDateString()}
                  </td> 
                  
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
                      {attendance &&
                      attendance &&
                      attendance[
                        field as keyof (typeof attendance)
                      ] ? (
                        <div className="flex items-center">
                          {new Date(
                            attendance[
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
                            (attendance?.isLateMorningCheckIn ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Late
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 1 &&
                            (attendance?.isEarlyMorningCheckOut ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Early
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 2 &&
                            (attendance?.isLateAfternoonCheckIn ? (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                Late
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                On Time
                              </span>
                            ))}
                          {i == 3 &&
                            (attendance
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
                        !attendance?.checkOutEnabled ? (
                        "N/A"
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}

                  {/* <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {attendance?.status
                    ? attendance.status.charAt(0).toUpperCase() +
                    attendance.status.slice(1).toLowerCase()
                    : "Absent"}

                  </td> */}
                  <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {attendance?.status ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          attendance.status.toLowerCase() ===
                          "present"
                            ? "bg-green-100 text-green-800"
                            : attendance.status.toLowerCase() ===
                              "absent"
                            ? "bg-red-100 text-red-800"
                            : attendance.status.toLowerCase() ===
                              "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : attendance.status.toLowerCase() ===
                              "on_leave"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800" // Default for unknown status
                        }`}
                      >
                        {attendance.status
                          .charAt(0)
                          .toUpperCase() +
                          attendance.status.slice(1).toLowerCase()}
                      </span>
                    ) : attendance?.leaveRequests?.length > 0//Not needed
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

                  <td className="p-3 text-center flex">
                    {/* <Link
                      href={`./employees/${""}`}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      <FaEye size={18} />
                    </Link> */}
                    <button
                      // href={`./employees/edit/${employee.username}`}
                      className="text-green-600 hover:text-green-800 mx-1"
                      onClick={(e) =>
                        openAttendanceEditModal(
                          [attendance],
                          Number(empId)
                        )
                      }
                    >
                      <FaUserEdit size={18} />
                    </button>
                    {/* <button className="text-red-600 hover:text-red-800 mx-1">
                      <FaTrash size={18} />
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">
                  No attendances found.
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
        />
        // )
      )}
    </div>
  );
};

export default AttendanceDetailTable;
