import React from "react";
import AdminSidebar from "@/features/hr-admin/components/AdminSidebar";
import Breadcrumb from "@/components/Breadcrumb";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content - Takes Full Width & Scrollable */}
      <main className=" w-full min-h-screen p-6 bg-gray-100 overflow-y-auto">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
