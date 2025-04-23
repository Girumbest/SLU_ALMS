"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaUserEdit,
  FaTrash,
  FaEye,
  FaSearch,
} from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { getEmployees, getLeaveRequests } from "@/features/hr-admin/actions";

enum LeaveStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

interface LeaveRequest{
  id: number;
  startDate: Date,
  endDate: Date;
  reason: string;
  status: string;
  leaveType: {name:string};
  user: Employee;
}
interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  photograph: string;
  department: {name:string}
}

interface EmployeeTableProps {
  departments: { name: string; id: number }[];
}

const LeaveRequestTable: React.FC<EmployeeTableProps> = ({ departments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5;

  const [filters, setFilters] = useState<{
    filterKey: string;
    searchValue: string;
  }>({
    filterKey: "",
    searchValue: "",
  });

  const [totalResults, setTotalPages] = useState<number>(0);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const status = ["Pending", "Approved", "Rejected"];
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaveRequests();
      setFilteredLeaves(data.leaveRequests);
      setLeaveTypes(data.leaveTypes);
      console.log(data)
      
      // setTotalPages(data.total);
    };
    fetchData();
  }, []);

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
      setFilteredLeaves(
        filteredLeaves.filter(
          (leave) =>
            leave.user.firstName.toLowerCase().includes(value.toLowerCase())
          )
      );
    }

  };

  const totalPages = Math.ceil(filteredLeaves.length / employeesPerPage);
  const paginatedEmployees = filteredLeaves;

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {"Leave Requests"}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              {[
                "Photo",
                "Name",
                "Username",
                "Department",
                "Leave Type",
                "Start Date",
                "End Date",
                "Days",
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
                "Photo",
                "Name",
                "Username",
                "Department",
                "Leave Type",
                "Start Date",
                "End Date",
                "Days",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {!["Photo", "Department", "Leave Type",
                      "Start Date",
                      "End Date", "Status","Actions"].includes(
                    header
                  ) && (
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

                  {header === "Department" && (
                    <select
                      onChange={(e) =>
                        handleFilterChange("department", e.target.value)
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option
                        value=""
                        selected={filters.filterKey != "department"}
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

                  {header === "Leave Type" && (
                    <select
                      onChange={(e) =>
                        handleFilterChange("leaveType", e.target.value)
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="" selected={filters.filterKey != "role"}>
                        All
                      </option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {(header === "Start Date" || header === "End Date") && (
                    <div className="flex items-center">
                    <input
                    type="date"
                    placeholder={`Search ${header}`}
                    className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                    onChange={(e) =>
                      handleFilterChange(
                        header.toLowerCase().replace(" ", ""),
                        e.target.value
                      )
                    }
                    
                  />
                  <FaSearch className="text-gray-500 ml-2" />
                </div>
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

                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((leave, index) => (
                <tr
                  key={leave.id}
                  className={`border-b ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200`}
                >
                  <td className="p-3">
                    <img
                      suppressHydrationWarning
                      src={
                        "/api/photos/" + leave.user.photograph ||
                        "/default-profile.png"
                      }
                      alt={`${leave.user.firstName} ${leave.user.lastName}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                    {leave.user.firstName} {leave.user.lastName}
                  </td>
                  {[
                    "username",
                    "department",
                    "leaveType",
                    "startDate",
                    "endDate",
                    "days",
                  ].map((field) => (
                    <td
                      key={field}
                      className="p-3 text-gray-600 truncate max-w-[150px]"
                      title={leave[field as keyof LeaveRequest]?.toString()}
                    >
                      {field === "startDate" || field === "endDate"
                        ? new Date(leave[field as keyof LeaveRequest]!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : field === "department"
                        ? leave.user.department?.name
                        : leave[field as keyof LeaveRequest]?.toString()}
                        {field === "days" && (leave.endDate.getDate() - leave.startDate.getDate())}

                    </td>
                  ))}
                {/* Status */}
                <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {(
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leave.status.toLowerCase() ===
                          "approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status.toLowerCase() ===
                              "rejected"
                            ? "bg-red-100 text-red-800"
                            : leave.status.toLowerCase() ===
                              "late"
                            ? "bg-yellow-100 text-yellow-800"
                            : leave.status.toLowerCase() ===
                              "pending"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800" // Default for unknown status
                        }`}
                      >
                        {leave.status
                          .charAt(0)
                          .toUpperCase() +
                          leave.status.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center flex">
                    <Link
                      href={`./leave/${leave.user.id}`}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      <FaEye size={18} />
                    </Link>
                    <Link
                      href={`./leave/edit/${leave.user.username}`}
                      className="text-green-600 hover:text-green-800 mx-1"
                    >
                      <FaUserEdit size={18} />
                    </Link>
                    <button className="text-red-600 hover:text-red-800 mx-1">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">
                  No leave requests found.
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaveRequestTable;
