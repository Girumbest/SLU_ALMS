import React, {  } from "react";
import DepartmentTable from "@/features/hr-admin/components/DepartmentTable";
import DepartmentEditForm from "@/features/hr-admin/components/forms/DepartmentEditForm";
import { getDepartment, getDepartments } from "@/lib/db-ops";
import EmployeeTable from "@/components/EmployeeTable";
import DepartmentEmployeeTable from "@/components/DepartmentEmployeeTable";

interface Department {
  id: number;
  name: string;
  nameAmharic: string;
  supervisor: string;
  employeeCount: number;
  dateCreated: string;
  description: string;
}

const DepartmentsPage = async ({params}: {params:{departmentId:string}}) => {
  
  const res = await getDepartment(Number(params.departmentId));
   // Format the result to include the supervisor and user count
  //  const formattedDepartments = res.map((department) => ({
  //   id: department.id,
  //   name: department.name,
  //   nameAmharic: department.nameAmharic,
  //   description: department.description || "",
  //   dateCreated: department.createdAt.toString(),
  //   // updatedAt: department.updatedAt,
  //   employeeCount: department._count.users, // Total number of users
  //   supervisor: department.users[0]?.firstName || "", // The first supervisor (or null if none)
  // }));
  
  if(res){
  const employees = res.users
 
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Departments</h2>

      {/* Add Department Form */}
      <DepartmentEditForm department={{id: res.id+'', name: res.name, nameAmharic: res.nameAmharic as string, description: res.description as string}}/>
      <DepartmentEmployeeTable depId={res.id} depName={res.name} />
      {/* Department Table */}
      {/* <DepartmentTable departments={departments}/> */}
    </div>
  );
};
}

export default DepartmentsPage;
