"use client"
import React, { useState } from "react";
import { FaHome, FaUsers, FaBuilding, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image"; // For the logo

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    { name: "Employees", icon: <FaUsers />, path: "/admin/employees" },
    { name: "Departments", icon: <FaBuilding />, path: "/admin/departments" },
    { name: "Settings", icon: <FaCog />, path: "/admin/settings" },
  ];

  return (
    <div className={`h-screen left-0 top-0 bg-gray-900 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* Logo & Sidebar Toggle */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded" />
            <span className="ml-3 text-lg font-bold">Admin Panel</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-xl focus:outline-none w-5">
          <FaBars />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-all ${
              pathname === item.path ? "bg-blue-600" : ""
            }`}
            onClick={() => router.push(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 cursor-pointer hover:bg-red-600 flex items-center" onClick={() => alert("Logging out...")}>
        <FaSignOutAlt className="text-lg" />
        {!isCollapsed && <span className="ml-3">Logout</span>}
      </div>
    </div>
  );
};

export default AdminSidebar;
