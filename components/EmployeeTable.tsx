"use client"
import React, { useState } from "react";
import { FaUserEdit, FaTrash, FaEye, FaSearch, FaChevronDown } from "react-icons/fa";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  jobTitle: string;
  department: string;
  role: string;
  salary: number;
  hireDate: string;
  photograph?: string;
}

const EmployeeTable: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Extract unique department & role values for dropdowns
  const departments = [...new Set(employees.map(emp => emp.department))];
  const roles = [...new Set(employees.map(emp => emp.role))];

  // Handle input change for search filters
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value.toLowerCase() }));
  };

  // Filtered employees based on search input
  const filteredEmployees = employees.filter((employee) =>
    Object.keys(filters).every((key) =>
      !filters[key] ? true : employee[key as keyof Employee]?.toString().toLowerCase().includes(filters[key])
    )
  );

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Employees</h2>

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
                  {/* Search bars for all except specified headers */}
                  {!["Photo", "Department", "Role", "Hire Date", "Actions"].includes(header) && (
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={`Search ${header}`}
                        className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                        onChange={(e) => handleFilterChange(header.toLowerCase().replace(" ", ""), e.target.value)}
                      />
                      <FaSearch className="text-gray-500 ml-2" />
                    </div>
                  )}

                  {/* Dropdown for Department */}
                  {header === "Department" && (
                    <select
                      onChange={(e) => handleFilterChange("department", e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="">All</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  )}

                  {/* Dropdown for Role */}
                  {header === "Role" && (
                    <select
                      onChange={(e) => handleFilterChange("role", e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="">All</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  )}

                  {/* Date Picker for Hire Date */}
                  {header === "Hire Date" && (
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                        onChange={(e) => handleFilterChange("hireDate", e.target.value)}
                      />
                      {/* <FaChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" /> */}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr key={employee.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
                  {/* Employee Photo */}
                  <td className="p-3">
                    <img
                      src={employee.photograph || "/default-profile.png"}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-12 h-12 object-cover rounded-full border-2 border-gray-300"
                    />
                  </td>

                  {/* Employee Info */}
                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{employee.firstName} {employee.lastName}</td>
                  {["username", "phoneNumber", "jobTitle", "department", "role", "salary", "hireDate"].map((field) => (
                    <td key={field} className="p-3 text-gray-600 truncate max-w-[150px]" title={employee[field as keyof Employee]?.toString()}>
                      {field === "salary" ? `$${employee.salary.toLocaleString()}` : employee[field as keyof Employee]?.toString()}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 mx-1"><FaEye size={18} /></button>
                    <button className="text-green-600 hover:text-green-800 mx-1"><FaUserEdit size={18} /></button>
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
    </div>
  );
};

export default EmployeeTable;
