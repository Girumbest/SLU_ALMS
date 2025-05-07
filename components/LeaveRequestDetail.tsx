"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaUserEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaThumbsDown,
  FaThumbsUp,
  FaPrint,
  FaFilePdf,
} from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { approveLeave, getEmployees, getLeaveRequests, getSettings, rejectLeave } from "@/features/hr-admin/actions";
import { useSession } from "next-auth/react";
import { ClipLoader, PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import EmployeeSummary from "./EmployeeBriefInfo";
import { exportToCSV, printTable } from "@/features/hr-admin/utils";

interface LeaveRequest{
  id: number;
  startDate: Date,
  endDate: Date;
  createdAt: Date;
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
  empId: string
}

const LeaveRequestDetailTable: React.FC<EmployeeTableProps> = ({ departments, empId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(10);

  const [filters, setFilters] = useState<{
    filterKey: string;
    searchValue: string;
  }>({
    filterKey: "",
    searchValue: "",
  });

  const [totalResults, setTotalPages] = useState<number>(0);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  const status = ["Pending", "Approved", "Rejected"];
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string }[]>([]);
  
  const [isSupApprovalRequired, setIsSupApprovalRequired] = useState(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [rejectActionLoading, setRejectActionLoading] = useState<boolean>(false);

  const {data: session, status: sessionStatus} = useSession();


  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaveRequests(Number(empId));
      setFilteredLeaves(data.leaveRequests);
      setLeaves(data.leaveRequests)
      setLeaveTypes(data.leaveTypes);
      // setTotalPages(data.total);
      const settings = (await getSettings("supervisor_approval_required")).settings;
      setIsSupApprovalRequired(settings?.value === "true");
      setDataLoading(false);
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
  const handleLeaveApprove = async (leaveId: number) => {
    setActionLoading(true);
    const leaveApprove = await approveLeave(leaveId);
    if(leaveApprove?.successMsg){
      toast.success(leaveApprove.successMsg)
      
    }
    if(leaveApprove?.errorMsg){
      toast.error(leaveApprove.errorMsg)
    }
    setActionLoading(false);
  }
  const handleLeaveReject = async (leaveId: number) => {
    setRejectActionLoading(true);
    const leaveReject = await rejectLeave(leaveId);
    if(leaveReject?.successMsg){
      toast.success(leaveReject.successMsg)
    }
    if(leaveReject?.errorMsg){
      toast.error(leaveReject.errorMsg)
    }
    setRejectActionLoading(false);
  }

  const handleFilterChange = (column: string, value: string) => {
    setFilters({ filterKey: column, searchValue: value });
    if (column == "name") {
      setFilteredLeaves(
        leaves.filter(
          (leave) =>
            leave.user.firstName.toLowerCase().includes(value.toLowerCase())
          )
      );
    }
    if (column == "username") {
      setFilteredLeaves(
        leaves.filter(
          (leave) =>
            leave.user.username.toLowerCase().includes(value.toLowerCase())
          )
      );
    }
    if (column == "department"){
      setFilteredLeaves(
        leaves.filter(
          (leave) =>
            leave.user.department.name.toLowerCase().includes(value.toLowerCase())
          )
      );
    }
    if (column == "leaveType"){
      setFilteredLeaves(
        leaves.filter(
          (leave) =>
            leave.leaveType.name.toLowerCase().includes(value.toLowerCase())
          )
      );
    }
    if (column == "startdate"){
      setFilteredLeaves(
        leaves.filter(
          (leave) => {
            return new Date(leave.startDate).toLocaleDateString('en-GB') == new Date(value).toLocaleDateString('en-GB')
          }
          )
      );
    }
    if (column == "enddate"){
      setFilteredLeaves(
        leaves.filter((leave) => new Date(leave.endDate).toLocaleDateString('en-GB') == new Date(value).toLocaleDateString('en-GB')
          )
      );
    }
    if (column == "status"){
      if(!value) return setFilteredLeaves(leaves)
      setFilteredLeaves(
        leaves.filter((leave) => leave.status.toLowerCase() == value.toLowerCase())
      );
    }
   if(column == "days"){
    setFilteredLeaves(
      leaves.filter((leave) => (leave.endDate.getDate() - leave.startDate.getDate()) == Number(value))
    ) 
  }
  if (column == "createdat"){
    setFilteredLeaves(
      leaves.filter((leave) => new Date(leave.createdAt).toLocaleDateString('en-GB') == new Date(value).toLocaleDateString('en-GB')
        )
    );
  }
  if(column == "reason"){
    setFilteredLeaves(
      leaves.filter((leave) => leave.reason.toLowerCase().includes(value.toLowerCase()))
    )
  }
  
 }
  const totalPages = Math.ceil(filteredLeaves.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const paginatedEmployees = filteredLeaves.slice(startIndex, startIndex + employeesPerPage);
//==============================REPORT==================================
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [isPrinting, setIsPrinting] = useState(false)

  // Add these functions inside your component
  const generateCSVReport = () => {
    setIsGeneratingReport(true);
    try {
      const reportData = filteredLeaves.map(leave => ({
        'Employee Name': `${leave.user.firstName} ${leave.user.lastName}`,
        Username: leave.user.username,
        Department: leave.user.department?.name || 'N/A',
        'Leave Type': leave.leaveType.name,
        'Request Date': new Date(leave.createdAt).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        'Start Date': new Date(leave.startDate).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        'End Date': new Date(leave.endDate).toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        'Total Days': Math.ceil((new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 3600 * 24)) + 1,
        Reason: leave.reason,
        Status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1).toLowerCase(),
        'Supervisor Approval': leave.isSupervisorApproved ? 'Approved' : 'Pending'
      }));

      exportToCSV(reportData, `Employee_Leave_Requests_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Failed to generate report', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    if(employeesPerPage >= filteredLeaves.length){
      printTable('leave-request-detail-table', `Employee Leave Requests - ${new Date().toLocaleDateString()}`);
      return
    }
    setEmployeesPerPage(filteredLeaves.length)
    setIsPrinting(true)
    setTimeout(() => {
      printTable('leave-request-detail-table', `Employee Leave Requests - ${new Date().toLocaleDateString()}`);
      setEmployeesPerPage(employeesPerPage)
      setIsPrinting(false)
    }, 2000);
  };
//======================================================================
  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      {/* Employee Info Card */}
      
      <EmployeeSummary empId={Number(empId)}/>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Leave Requests
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={generateCSVReport}
            disabled={isGeneratingReport || filteredLeaves.length === 0}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isGeneratingReport ? (
              <ClipLoader color="#ffffff" size={14} />
            ) : (
              <>
                <FaFilePdf className="mr-1" size={14} />
                Export CSV
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            disabled={filteredLeaves.length === 0 || isPrinting}
            className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            <FaPrint className="mr-1" size={14} />
            {!isPrinting && "Print"}
            <ClipLoader loading={isPrinting} color="#ffffff" size={8} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table id="leave-request-detail-table" className="w-full border-collapse">
          <thead>
            <tr id='header-row' className="bg-blue-600 text-white text-left">
              {[
                // "Photo",
                // "Name",
                // "Username",
                // "Department",
                "Leave Type",
                "Created At",
                "Start Date",
                "End Date",
                "Days",
                "Reason",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-3 relative">
                  {header}
                </th>
              ))}
            </tr>

            <tr id="search-row" className="bg-gray-200">
              {[
                // "Photo",
                // "Name",
                // "Username",
                // "Department",
                "Leave Type",
                "Created At",
                "Start Date",
                "End Date",
                "Days",
                "Reason",
                "Status",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {!["Photo", "Department", "Leave Type",
                      "Created At",
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
                      value={filters.filterKey === "department" ? filters.searchValue : ""}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
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

                  {header === "Leave Type" && (
                    <select
                      onChange={(e) =>
                        handleFilterChange("leaveType", e.target.value)
                      }
                      value={filters.filterKey === "leaveType" ? filters.searchValue : ""}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="">
                        All
                      </option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {(header === "Start Date" || header === "End Date" || header === "Created At") && (
                    <div className="flex items-center">
                    <input
                    type="date"
                    value={
                      filters.filterKey !==
                      header.toLowerCase().replace(" ", "")
                        ? ""
                        : filters.searchValue
                    }
                    placeholder={`Search ${header}`}
                    className="w-full p-1.5 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
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
                      value={filters.filterKey === "status" ? filters.searchValue : ""}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="" >
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
                  {/* <td className="p-3">
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
                  </td> */}
                  {[
                    // "username",
                    // "department",
                    "leaveType",
                    "createdAt",
                    "startDate",
                    "endDate",
                    "days",
                    "reason"
                  ].map((field) => (
                    <td
                      key={field}
                      className="p-3 text-gray-600 truncate max-w-[150px]"
                      title={leave[field as keyof LeaveRequest]?.toString()}
                    >
                      {field === "startDate" || field === "endDate" || field === "createdAt"
                        ? new Date(leave[field as keyof LeaveRequest]!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : field === "leaveType"
                        ? leave.leaveType.name
                        : field === "department"
                        ? leave.user.department?.name
                        : field === "username"
                        ? leave.user.username
                        
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

                  <td className="p-3 text-center flex action">
                    {/* <Link
                      href={`./leave/${leave.user.username}`}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      <FaEye size={18} />
                    </Link> */}
                    {leave.status.toLowerCase() === "pending" && (
                      <>
                        <button
                          // href={`./leave/edit/${leave.user.username}`}
                          className="text-green-600 hover:text-green-800 mx-1"
                          title="Approve"
                          disabled={(session?.user.role === "Supervisor" && !isSupApprovalRequired) || (session?.user.role === "HRAdmin" && (isSupApprovalRequired && !leave?.isSupervisorApproved)) || actionLoading}
                          onClick={e => handleLeaveApprove(leave.id)}
                        >
                          {!actionLoading && <FaThumbsUp size={18} />}
                          <ClipLoader 
                            loading={actionLoading}
                            size={18}
                            color="green"
                            cssOverride={{
                              display: 'block',
                              margin: '0 auto',
                            }}
                          />
                        </button>
                        <button title="Reject" 
                        className="text-red-600 hover:text-red-800 mx-1"
                        disabled={(session?.user.role === "Supervisor" && !isSupApprovalRequired) || (session?.user.role === "HRAdmin" && (isSupApprovalRequired && !leave?.isSupervisorApproved)) || actionLoading}
                          onClick={e => handleLeaveReject(leave.id)}>
                          {!rejectActionLoading && <FaThumbsDown size={18} />}
                          <ClipLoader 
                            size={18}
                            color="red"
                            cssOverride={{
                                display: 'block',
                                margin: '0 auto',
                            }}
                            loading={rejectActionLoading}
                          />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">
                {!dataLoading && <span>No leave requests found.</span>}
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
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LeaveRequestDetailTable;
