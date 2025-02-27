import React, {  } from "react";
import DepartmentTable from "@/features/hr-admin/components/DepartmentTable";
import DepartmentForm from "@/features/hr-admin/components/forms/DepartmentForm";
import { getDepartments } from "@/lib/db-ops";

interface Department {
  id: number;
  name: string;
  nameAmharic: string;
  supervisor: string;
  employeeCount: number;
  dateCreated: string;
  description: string;
}

const DepartmentsPage = async () => {
  
  const res = await getDepartments();
   // Format the result to include the supervisor and user count
   const formattedDepartments = res.map((department) => ({
    id: department.id,
    name: department.name,
    nameAmharic: department.nameAmharic,
    description: department.description || "",
    dateCreated: department.createdAt.toString(),
    // updatedAt: department.updatedAt,
    employeeCount: department._count.users, // Total number of users
    supervisor: department.users[0]?.firstName || "", // The first supervisor (or null if none)
  }));
  
  const departments = formattedDepartments
  // const departments = [
  //   { id: 1, name: "Human Resources", supervisor: "Alice Johnson", employeeCount: 10, dateCreated: "2023-05-12", description: "Handles employee relations and benefits." },
  //   { id: 2, name: "IT Department", supervisor: "Bob Smith", employeeCount: 25, dateCreated: "2022-08-30", description: "Manages technical infrastructure and security." },
  //   { id: 3, name: "Finance", supervisor: "Charlie Brown", employeeCount: 15, dateCreated: "2021-11-15", description: "Oversees company finances and payroll." },
  // ]

  const supervisorsTest: {id:string, name:string}[] = [
    {id: "123", name: "Girum"},
    {id: "124", name: "Greg"},
    {id: "125", name: "Groot"},
  ]
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Departments</h2>

      {/* Add Department Form */}
      <DepartmentForm supervisors={supervisorsTest}/>

      {/* Department Table */}
      {/* <Table columns={columns} data={departments} uniqueId="id" /> */}
      <DepartmentTable departments={departments}/>
    </div>
  );
};

export default DepartmentsPage;
