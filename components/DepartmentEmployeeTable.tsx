"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaUserEdit, FaTrash, FaEye, FaSearch, FaFilePdf, FaPrint } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { getDepartmentEmployees } from "@/features/hr-admin/actions";
import { ClipLoader, PropagateLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { exportToCSV, printTableDepartmentEmployees } from "@/features/hr-admin/utils";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  department: { name: string } | null;
  role: string;
  salary: number | null;
  hireDate: Date | null;
  photograph?: string;
}

interface EmployeeTableProps {
  depId: number;
  depName: string;
}

const DepartmentEmployeeTable: React.FC<EmployeeTableProps> = ({
  depId,
  depName,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage,setEmployeesPerPage] = useState(5)

  const [filters, setFilters] = useState<{
    filterKey: string;
    searchValue: string;
  }>({
    filterKey: "",
    searchValue: "",
  });

  const [totalResults, setTotalPages] = useState<number>(0);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(true)
  const {data:session, status: sessionStatus} = useSession();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDepartmentEmployees(
        depId,
        filters.searchValue,
        filters.filterKey,
        employeesPerPage,
        currentPage
      );
      console.log(data.employees)
      setFilteredEmployees(data.employees);
      setTotalPages(data.total!);
      setDataLoading(false)
    };
    fetchData();
  }, [filters, currentPage, depId, employeesPerPage]);

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
  };

  const totalPages = Math.ceil(totalResults / employeesPerPage);
  const paginatedEmployees = filteredEmployees;
//==========================REPORT=======================
const [isGeneratingReport, setIsGeneratingReport] = useState(false);
const [isPrinting, setIsPrinting] = useState(false)

  // Add these functions inside your component
  const generateCSVReport = async() => {
    setIsGeneratingReport(true);
    try {
      const data: Employee[] = (await getDepartmentEmployees(
        depId,
        filters.searchValue,
        filters.filterKey,
        totalResults,
        currentPage
      )).employees;
      const reportData = data.map(employee => ({
        Name: `${employee.firstName} ${employee.lastName}`,
        Username: employee.username,
        'Phone Number': employee.phoneNumber || 'N/A',
        'Job Title': employee.jobTitle || 'N/A',
        Department: depName,
        Salary: employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A',
        'Hire Date': employee.hireDate 
          ? new Date(employee.hireDate).toLocaleDateString('en-GB', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })
          : 'N/A'
      }));

      exportToCSV(reportData, `${depName.replace(/\s+/g, '_')}_Employees_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Failed to generate report', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handlePrint = () => {
    if(employeesPerPage >= totalResults){
      printTableDepartmentEmployees('department-employee-table', `${depName} Employees - ${new Date().toLocaleDateString()}`);
      return
    }
    setEmployeesPerPage(totalResults)
    setIsPrinting(true)
    setTimeout(() => {
      printTableDepartmentEmployees('department-employee-table', `${depName} Employees - ${new Date().toLocaleDateString()}`);
      setEmployeesPerPage(employeesPerPage)
      setIsPrinting(false)
    }, 2000);
  };
//=======================================================
  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {`${depName} Employees List`}
          {session?.user?.role === "Supervisor" && <span className="ml-3 text-gray-600">Total: {totalResults}</span>}
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
            disabled={filteredEmployees.length === 0}
            className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
          >
            <FaPrint className="mr-1" size={14} />
            {!isPrinting && "Print"}
            <ClipLoader loading={isPrinting} color="#ffffff" size={8} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table id="department-employee-table" className="w-full border-collapse">
          <thead>
            <tr id='header-row' className="bg-blue-600 text-white text-left">
              {[
                "Photo",
                "Name",
                "Username",
                "Phone",
                "Job Title",
                "Salary",
                "Hire Date",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-3 relative">
                  {header}
                </th>
              ))}
            </tr>

            <tr id="search-row" className="bg-gray-200">
              {[
                "Photo",
                "Name",
                "Username",
                "Phone",
                "Job Title",
                "Salary",
                "Hire Date",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {!["Photo", "Hire Date", "Actions"].includes(header) && (
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
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">
                    {employee.firstName} {employee.lastName}
                  </td>
                  {[
                    "username",
                    "phoneNumber",
                    "jobTitle",
                    "salary",
                    "hireDate",
                  ].map((field) => (
                    <td
                      key={field}
                      className="p-3 text-gray-600 truncate max-w-[150px]"
                      title={employee[field as keyof Employee]?.toString()}
                    >
                      {field === "salary"
                        ? `$${employee.salary?.toLocaleString() || "N/A"}`
                        : field === "hireDate"
                        ? new Date(employee.hireDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : employee[field as keyof Employee]?.toString()}
                    </td>
                  ))}

                  <td className="p-3 text-center flex action">
                    <Link
                      href={session?.user?.role === "HRAdmin" ? `/admin/employees/${employee.username}`: `/supervisor/employees/${employee.username}`}
                      className="text-blue-600 hover:text-blue-800 mx-1"
                    >
                      <FaEye size={18} />
                    </Link>
                    {session?.user?.role === "HRAdmin" &&
                    <Link
                      href={`/admin/employees/edit/${employee.username}`}
                      className="text-green-600 hover:text-green-800 mx-1"
                    >
                      <FaUserEdit size={18} />
                    </Link>
                    }
                    {/* <button className="text-red-600 hover:text-red-800 mx-1">
                      <FaTrash size={18} />
                    </button> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">
                {!dataLoading && "No employees found."}
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

export default DepartmentEmployeeTable;
