import React from "react";
import EmployeeSidebar from "@/features/employee/components/EmployeeSidebar";
import Breadcrumb from "@/components/Breadcrumb";

const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content - Takes Full Width & Scrollable */}
      <main className=" w-full min-h-screen p-6 bg-gray-100 overflow-y-auto">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;
