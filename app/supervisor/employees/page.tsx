import React, {  } from "react";
import DepartmentTable from "@/features/hr-admin/components/DepartmentTable";
import DepartmentEditForm from "@/features/hr-admin/components/forms/DepartmentEditForm";
import { getDepartment, getDepartments } from "@/lib/db-ops";
import EmployeeTable from "@/components/EmployeeTable";
import DepartmentEmployeeTable from "@/components/DepartmentEmployeeTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  
  const session = await getServerSession(authOptions)

  const res = await getDepartment(Number(session?.user?.department));
  
 
  return session?.user?.role === "Supervisor" && res ? (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      {session?.user?.role === "HRAdmin" && <h2 className="text-3xl font-bold text-gray-800 mb-4">Manage Departments</h2>}
      <DepartmentEmployeeTable depId={res.id} depName={res.name} />
    </div>
  ):(
    <div>
      <div className="p-4 text-center text-danger flex-col justify-center items-center h-screen">
        Unauthorized
      </div>
    </div>
  );
};

export default DepartmentsPage;
