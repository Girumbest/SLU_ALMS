"use client"
import React, { useState } from "react";
import Table, { TableColumn } from "@/components/Table";

interface Department {
  id: number;
  name: string;
  supervisor: string;
  employeeCount: number;
  dateCreated: string;
  description: string;
}

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, name: "Human Resources", supervisor: "Alice Johnson", employeeCount: 10, dateCreated: "2023-05-12", description: "Handles employee relations and benefits." },
    { id: 2, name: "IT Department", supervisor: "Bob Smith", employeeCount: 25, dateCreated: "2022-08-30", description: "Manages technical infrastructure and security." },
    { id: 3, name: "Finance", supervisor: "Charlie Brown", employeeCount: 15, dateCreated: "2021-11-15", description: "Oversees company finances and payroll." },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    supervisor: "",
    employeeCount: 0,
    dateCreated: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDepartment: Department = {
      id: departments.length + 1,
      ...formData,
      employeeCount: Number(formData.employeeCount),
    };
    setDepartments([...departments, newDepartment]);
    setFormData({ name: "", supervisor: "", employeeCount: 0, dateCreated: "", description: "" });
  };

  const columns:TableColumn[] = [
    { key: "name", label: "Department Name", filterType: "search" },
    { key: "supervisor", label: "Supervisor", filterType: "search" },
    { key: "employeeCount", label: "No. Employees", filterType: "search" },
    { key: "dateCreated", label: "Date Created", filterType: "search" },
    { key: "description", label: "Description" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Departments</h2>

      {/* Add Department Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Department</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Department Name" className="p-2 border rounded" required />
          <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} placeholder="Supervisor" className="p-2 border rounded" required />
          <input type="number" name="employeeCount" value={formData.employeeCount} onChange={handleChange} placeholder="No. Employees" className="p-2 border rounded" required />
          <input type="date" name="dateCreated" value={formData.dateCreated} onChange={handleChange} className="p-2 border rounded" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Department Description" className="col-span-2 p-2 border rounded" rows={3}></textarea>
          <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Department</button>
        </form>
      </div>

      {/* Department Table */}
      <Table columns={columns} data={departments} uniqueId="id" />
    </div>
  );
};

export default DepartmentsPage;
