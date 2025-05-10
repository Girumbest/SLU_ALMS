"use client"
import React, { useState } from "react";
import { 
  FaHome, FaUsers, FaBuilding, FaCog, FaSignOutAlt, 
  FaBars, FaChevronDown, FaCalendarCheck, FaCalendarTimes, 
  FaSitemap, FaUserPlus, FaAddressBook, FaCalendar 
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from 'next-auth/react';

const SupervisorSidebar = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menus = [
    { name: "Dashboard", icon: <FaHome />, path: "/supervisor" },
    { name: "Employees", icon: <FaAddressBook />, path: "/supervisor/employees" },
    { name: "Attendance", icon: <FaCalendarCheck />, path: "/supervisor/attendance" },
    { name: "Leave", icon: <FaCalendarTimes />, path: "/supervisor/leave" },
    { name: "Calendar", icon: <FaCalendar />, path: "/supervisor/calendar" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "#" },
  ];

  const isActive = (menuItem: {name: string, path: string}) => {
    // Exact path match
    if (pathname === menuItem.path) return true;
    
    // Special cases for dynamic routes
    const current = pathname.split("/").pop();
    
    // Employees section
    if (menuItem.name === "Employees" && 
        (pathname.startsWith("/supervisor/employees/") || 
         pathname === "/supervisor/employees")) {
      return true;
    }
    
    // Attendance section
    if (menuItem.name === "Attendance" && 
        pathname.startsWith("/supervisor/attendance")) {
      return true;
    }
    
    // Leave section
    if (menuItem.name === "Leave" && 
        pathname.startsWith("/supervisor/leave")) {
      return true;
    }
    
    return false;
  };

  const handleNavigation = (path: string) => {
    if (path === "#") {
      signOut({ callbackUrl: '/login' });
    } else {
      router.push(path);
    }
  };

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={40} 
              height={40} 
              className="rounded"
              priority
            />
            <span className="ml-3 text-lg font-semibold">Supervisor Panel</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="text-xl hover:text-blue-400 transition-colors focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {menus.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer transition-all ${
              isActive(item) ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SupervisorSidebar;