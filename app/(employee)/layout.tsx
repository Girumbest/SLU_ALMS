import React from "react";
import SupervisorSidebar from "@/features/supervisor/components/SupervisorSidebar";
import Breadcrumb from "@/components/Breadcrumb";

const SupervisorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <SupervisorSidebar />

      {/* Main Content - Takes Full Width & Scrollable */}
      <main className=" w-full min-h-screen p-6 bg-gray-100 overflow-y-auto">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
};

export default SupervisorLayout;
