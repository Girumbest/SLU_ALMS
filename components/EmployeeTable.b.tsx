// "use client"
// import Link from "next/link";
// import React, { useState } from "react";
// import { FaUserEdit, FaTrash, FaEye, FaSearch, FaChevronDown } from "react-icons/fa";

// interface Employee {
//   id: number;
//   firstName: string;
//   lastName: string;
//   username: string;
//   phoneNumber: string | null;
//   jobTitle: string | null;
//   department: {name:string} | null;
//   role: string;
//   salary: number | null;
//   hireDate: Date | null;
//   photograph?: string;

// }

// const EmployeeTable: React.FC<{ employees: Employee[] }> = ({employees}) => {
//   const [filters, setFilters] = useState<{ [key: string]: string }>({});
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const employeesPerPage = 5; // Change this to adjust page size

//   // Extract unique department & role values for dropdowns
//   const departments = [...new Set(employees.map((emp) => emp.department))];
//   const roles = [...new Set(employees.map((emp) => emp.role))];

//   // Handle input change for search filters
//   const handleFilterChange = (column: string, value: string) => {
//     setFilters((prev) => ({ ...prev, [column]: value.toLowerCase() }));
//   };

//   // Filter employees based on search input
//   const filteredEmployees = employees.filter((employee) =>
//     Object.keys(filters).every((key) =>
//       !filters[key]
//         ? true
//         : employee[key as keyof Employee]?.toString().toLowerCase().includes(filters[key])
//     )
//   );

//   // Pagination logic
//   const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
//   const paginatedEmployees = filteredEmployees.slice(
//     (currentPage - 1) * employeesPerPage,
//     currentPage * employeesPerPage
//   );

//   return (
//     <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">{"Registered Employees"}</h2>

//       {/* Responsive Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse">
//           {/* Table Header */}
//           <thead>
//             <tr className="bg-blue-600 text-white text-left">
//               {["Photo", "Name", "Username", "Phone", "Job Title", "Department", "Role", "Salary", "Hire Date", "Actions"].map((header, index) => (
//                 <th key={index} className="p-3 relative">{header}</th>
//               ))}
//             </tr>
            
//             {/* Search Row */}
//             <tr className="bg-gray-200">
//               {[
//                 "Photo",
//                 "Name",
//                 "Username",
//                 "Phone",
//                 "Job Title",
//                 "Department",
//                 "Role",
//                 "Salary",
//                 "Hire Date",
//                 "Actions",
//               ].map((header, index) => (
//                 <th key={index} className="p-2">
//                   {!["Photo", "Department", "Role", "Hire Date", "Actions"].includes(header) && (
//                     <div className="flex items-center">
//                       <input
//                         type="text"
//                         placeholder={`Search ${header}`}
//                         className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
//                         onChange={(e) => handleFilterChange(header.toLowerCase().replace(" ", ""), e.target.value)}
//                       />
//                       <FaSearch className="text-gray-500 ml-2" />
//                     </div>
//                   )}

//                   {header === "Department" && (
//                     <select
//                       onChange={(e) => handleFilterChange("department", e.target.value)}
//                       className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
//                     >
//                       <option value="">All</option>
//                       {departments.map((dept) => (
//                         <option key={dept?.name} value={dept?.name}>{dept?.name}</option>
//                       ))}
//                     </select>
//                   )}

//                   {header === "Role" && (
//                     <select
//                       onChange={(e) => handleFilterChange("role", e.target.value)}
//                       className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
//                     >
//                       <option value="">All</option>
//                       {roles.map((role) => (
//                         <option key={role} value={role}>{role}</option>
//                       ))}
//                     </select>
//                   )}

//                   {header === "Hire Date" && (
//                     <div className="relative">
//                       <input
//                         type="date"
//                         className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
//                         onChange={(e) => handleFilterChange("hireDate", e.target.value)}
//                       />
//                       <FaChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
//                     </div>
//                   )}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           {/* Table Body */}
//           <tbody>
//             {paginatedEmployees.length > 0 ? (
//               paginatedEmployees.map((employee, index) => (
//                 <tr key={employee.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
//                   <td className="p-3">
//                     <img
//                       suppressHydrationWarning
//                       src={"/api/photos/" + employee.photograph || "/default-profile.png"}
//                       alt={`${employee.firstName} ${employee.lastName}`}
//                       className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
//                     />
//                   </td>

//                   <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{employee.firstName} {employee.lastName}</td>
//                   {["username", "phoneNumber", "jobTitle", "department", "role", "salary", "hireDate"].map((field) => (
//                     <td key={field} className="p-3 text-gray-600 truncate max-w-[150px]" title={employee[field as keyof Employee]?.toString()}>
//                       {field === "salary" ? `$${employee.salary?.toLocaleString()}` : employee[field as keyof Employee]?.toString()}
//                     </td>
//                   ))}

//                   <td className="p-3 text-center flex">
//                     <Link href={`./employees/${employee.username}`} className="text-blue-600 hover:text-blue-800 mx-1"><FaEye size={18} /></Link>
//                     <Link href={`./employees/edit/${employee.username}`} className="text-green-600 hover:text-green-800 mx-1"><FaUserEdit size={18} /></Link>
//                     <button className="text-red-600 hover:text-red-800 mx-1"><FaTrash size={18} /></button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={10} className="p-5 text-center text-gray-500">No employees found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Controls */}
//       <div className="flex justify-between items-center mt-4">
//         <button
//           className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-24"
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//         >
//           Previous
//         </button>

//         <span className="text-gray-700">
//           Page {currentPage} of {totalPages}
//         </span>

//         <button
//           className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 w-24"
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EmployeeTable;

"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaUserEdit, FaTrash, FaEye, FaSearch, FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import DateRangePicker from "./DateRangePicker";
import { getEmployees } from "@/features/hr-admin/actions";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  jobTitle: string | null;
  department: {name:string} | null;
  role: string;
  salary: number | null;
  hireDate: Date | null;
  photograph?: string;

}

const EmployeeTable: React.FC<{ departments: {name:string, id:number}[] }> = ({departments}) => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 5; // Change this to adjust page size

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  //Date Range selecter

  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  

  const handleDateRangeChange = (startDate: string, endDate: string) => {
   
    if(!startDate && !endDate) setFilters({filterKey: "", searchValue: ""})
    startDate &&
    setFilters({filterKey: "hireDate", searchValue: `${startDate}:${endDate}`})
  };

  const roles = ["Employee", "Supervisor"];

  // Handle input change for search filters
  //-----------
  const [filters, setFilters] = useState<{ filterKey: string; searchValue: string }>({
    filterKey: '',
    searchValue: '',
  });


  const [totalResults, setTotalPages] = useState<number>(0)
  useEffect(()=>{
    console.log(currentPage)
    const fetchData = async () => {
      const data = await getEmployees(filters.searchValue, filters.filterKey,employeesPerPage,currentPage);
      // setEmployeesTest(data.employees);
      setFilteredEmployees(data.employees);
      console.log(filters.searchValue, filters.filterKey)
      setTotalPages(data.total)
    };
    fetchData();
  },[filters, currentPage])

  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  

  //const filteredEmployees = employeesTest;

  const handleFilterChange = (column: string, value: string) => {
    // setFilters((prev) => ({ ...prev, [column]: value.toLowerCase() }));
    console.log("column: ",column, " value: ",value)
    setFilters({ filterKey: column, searchValue: value })
  };

 
  // Pagination logic
  const totalPages = Math.ceil(totalResults / employeesPerPage);//Math.ceil(filteredEmployees.length / employeesPerPage);
  const paginatedEmployees = filteredEmployees
 

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{"Registered Employees"}</h2>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              {["Photo", "Name", "Username", "Phone", "Job Title", "Department", "Role", "Salary", "Hire Date", "Actions"].map((header, index) => (
                <th key={index} className="p-3 relative">{header}</th>
              ))}
            </tr>
            
            {/* Search Row */}
            <tr className="bg-gray-200">
              {[
                "Photo",
                "Name",
                "Username",
                "Phone",
                "Job Title",
                "Department",
                "Role",
                "Salary",
                "Hire Date",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {!["Photo", "Department", "Role", "Hire Date", "Actions"].includes(header) && (
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={`Search ${header}`}
                        className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                        onChange={(e) => handleFilterChange(header.toLowerCase().replace(" ", ""), e.target.value)}
                        value={filters.filterKey !== header.toLowerCase().replace(" ", "") ? "" : filters.searchValue}
                      />
                      <FaSearch className="text-gray-500 ml-2" />
                    </div>
                  )}

                  {header === "Department" && (
                    <select
                      onChange={(e) => handleFilterChange("department", e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="" selected={filters.filterKey != "department"}>All</option>
                      {departments.map((dept) => (
                        <option key={dept?.name} value={dept?.name}>{dept?.name}</option>
                      ))}
                    </select>
                  )}

                  {header === "Role" && (
                    <select
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="" selected={filters.filterKey != "role"} >All</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  )}

                  {header === "Hire Date" && (
                    <div className="relative">
                      {/* <input
                        type="date"
                        className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                        onChange={(e) => handleFilterChange("hireDate", e.target.value)}
                      /> */}
                      
                      <DateRangePicker onDateRangeChange={handleDateRangeChange} />
                      
                      {/* <FaCalendarAlt className="input-icon" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}/> */}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee, index) => (
                <tr key={employee.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
                  <td className="p-3">
                    <img
                      suppressHydrationWarning
                      src={"/api/photos/" + employee.photograph || "/default-profile.png"}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  </td>

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{employee.firstName} {employee.lastName}</td>
                  {["username", "phoneNumber", "jobTitle", "department", "role", "salary", "hireDate"].map((field) => (
                    <td key={field} className="p-3 text-gray-600 truncate max-w-[150px]" title={employee[field as keyof Employee]?.toString()}>
                      {field === "salary" ? `$${employee.salary?.toLocaleString()}` : (field === "department" ? employee.department?.name : employee[field as keyof Employee]?.toString())}
                    </td>
                  ))}

                  <td className="p-3 text-center flex">
                    <Link href={`./employees/${employee.username}`} className="text-blue-600 hover:text-blue-800 mx-1"><FaEye size={18} /></Link>
                    <Link href={`./employees/edit/${employee.username}`} className="text-green-600 hover:text-green-800 mx-1"><FaUserEdit size={18} /></Link>
                    <button className="text-red-600 hover:text-red-800 mx-1"><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

export default EmployeeTable;
