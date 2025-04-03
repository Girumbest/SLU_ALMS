"use client"
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaUserEdit, FaTrash, FaEye, FaSearch, FaChevronDown } from "react-icons/fa";
import { deleteDepartment } from "../actions";

interface Department {
    id: number;
    name: string;
    supervisor: string;
    employeeCount: number;
    dateCreated: string;
    description: string;
  }

const DepartmentTable: React.FC<{ departments: Department[] }> = ({ departments }) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const departmentsPerPage = 5; // Change this to adjust page size

  // Extract unique department & role values for dropdowns
 

  // Handle input change for search filters
  const handleFilterChange = (column: string, value: string) => {
    let key = column
    switch(column){
      case "departmentname": key = "name"; break;
      case "no.employees": key = "employeeCount"; break;
      case "datecreated": key = "dateCreated"; break;
    }
    setFilters((prev) => ({ ...prev, [key]: value.toLowerCase() }));
    console.log(filters)
  };

  // Filter departments based on search input
  const filteredDepartments = departments.filter((department) =>
    Object.keys(filters).every((key) =>
      !filters[key]
        ? true
        : department[key as keyof Department]?.toString().toLowerCase().includes(filters[key])
    )
  );

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      const res = await deleteDepartment(id);
      if (res.successMsg) {
        toast.success(res.successMsg)
      } else {
        toast.error(res.errorMsg)
      }
    }
  };
 

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Departments</h2>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              {[
                "Department Name",
                "Supervisor",
                "No. Employees",
                "Date Created",
                "Description",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-3 relative">{header}</th>
              ))}
            </tr>
            
            {/* Search Row */}
            <tr className="bg-gray-200">
              {[
                "Department Name",
                "Supervisor",
                "No. Employees",
                "Date Created",
                "Description",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="p-2">
                  {!["Actions"].includes(header) && (
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

                  
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department, index) => (
                <tr key={department.id} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
                  

                  <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{department.name} </td>
                  {["supervisor", "employeeCount", "dateCreated", "description", ].map((field) => (
                    <td key={field} className="p-3 text-gray-600 truncate max-w-[150px]" title={department[field as keyof Department]?.toString()}>
                      {department[field as keyof Department]?.toString()}
                    </td>
                  ))}

                  <td className="p-3 text-center flex">
                    <Link href={`/admin/departments/${department.id}`} className="text-blue-600 hover:text-blue-800 mx-1"><FaEye size={18} /></Link>
                    {/* <button className="text-green-600 hover:text-green-800 mx-1"><FaUserEdit size={18} /></button> */}
                    <button className="text-red-600 hover:text-red-800 mx-1" onClick={e => handleDelete(department.id)}><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-5 text-center text-gray-500">No departments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      
    </div>
  );
};

export default DepartmentTable;
