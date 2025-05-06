"use client"
import React, { useState } from "react";
import { FaHome, FaUsers, FaBuilding, FaCog, FaSignOutAlt, FaBars, FaChevronDown, FaCalendarCheck, FaCalendarTimes, FaSitemap, FaUserPlus, FaAddressBook, FaCalendar } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from 'next-auth/react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar = () => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed ] = useState(false);
  const pathname = usePathname();

  const mainMenu = [
    { name: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    // { name: "Employees", icon: <FaUsers />, path: "/admin/employees" },
    // { name: "Departments", icon: <FaBuilding />, path: "/admin/departments" },
  ];

  const employeesMenu = [
    { name: "Employees", icon: <FaAddressBook />, path: "/admin/employees" },
    { name: "Register Employee", icon: <FaUserPlus />, path: "/admin/employees/new" },
    { name: "Departments", icon: <FaSitemap />, path: "/admin/departments" },
    { name: "Attendance", icon: <FaCalendarCheck />, path: "/admin/attendance" },
    { name: "Leave", icon: <FaCalendarTimes />, path: "/admin/leave" },
    { name: "Leave Types", icon: <FaCalendarTimes />, path: "/admin/leave/leave-types" },
    { name: "Calendar", icon: <FaCalendar />, path: "/admin/calendar" },
  ];

  const settingsMenu = [
    { name: "Settings", icon: <FaCog />, path: "/admin/settings" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "#" },
  ];

  const isActive = (menuItem:{name:string, path:string, icon:any}) => {
    const current = pathname.split("/").pop();
    const employeeMenu = ["/admin/employees", "/admin/employees/edit/", `/admin/employees/edit/${current}`, `/admin/employees/${current}`]
    const departmentMenu = ["/admin/departments", `/admin/departments/${current}`]
    const registerEmployee = "/admin/employees/new"
    const leaveMenu = ["/admin/leave", `/admin/leave/${current}`]
    
    return (
     menuItem.name === "Employees" && employeeMenu.includes(pathname) && !employeeMenu.includes(registerEmployee) ||
     menuItem.name === "Departments" && departmentMenu.includes(pathname) ||
     menuItem.name === "Register Employee" && registerEmployee === pathname ||
     menuItem.name === "Leave Types" && "/admin/leave/leave-types" === pathname ||
     menuItem.name === "Leave" && pathname !== "/admin/leave/leave-types" &&  leaveMenu.includes(pathname) ||
     menuItem.path === pathname
    )
  };
  

  return (
    <div className={`h-screen  left-0 top-0 bg-gray-900 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "max-w-16" : "min-w-64"}`}>
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

      {/* Main Navigation */}
      <nav className="flex-1 mt-4">
        <p className={`text-gray-400 ${isCollapsed ? "hidden" : "px-4 text-xs uppercase"}`}>Main</p>
        {mainMenu.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-all ${
              pathname === item.path || isActive(item) ? "bg-blue-600" : ""
            }`}
            onClick={() => router.push(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3 ">{item.name}</span>}
          </div>
        ))}

        {/* Employee Management*/}
        <p className={`text-gray-400 ${isCollapsed ? "hidden" : "px-4 text-xs uppercase"}`}>Employee Management</p>
        {employeesMenu.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-all ${
             isActive(item) ? "bg-blue-600" : ""
            }`}
            onClick={() => router.push(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </div>
        ))}

        {/* Settings Section */}
        <p className={`text-gray-400 mt-6 ${isCollapsed ? "hidden" : "px-4 text-xs uppercase"}`}>Settings</p>
        {settingsMenu.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-700 transition-all ${
              pathname === item.path ? "bg-blue-600" : ""
            }`}
            onClick={() => {
              if (item.name === "Logout") {
                signOut({ callbackUrl: '/login' });
              }
              else router.push(item.path);
            }}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </div>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="p-4 mt-auto flex items-center justify-between cursor-pointer hover:bg-gray-800" onClick={() => setIsProfileOpen(true)}>
        <div className="flex items-center">
          <Image src="/profile.jpg" alt="Profile" width={32} height={32} className="rounded-full" />
          {!isCollapsed && <span className="ml-3">John Doe</span>}
        </div>
        {!isCollapsed && <FaChevronDown className="text-sm" />}
      </div>

      {/* Profile Popup */}
      {isProfileOpen && (
        <div className="absolute bottom-16 left-4 bg-white text-gray-800 shadow-lg rounded-lg p-4 w-64">
          <div className="flex items-center mb-3">
            <Image src="/profile.jpg" alt="Profile" width={48} height={48} className="rounded-full" />
            <div className="ml-3">
              <p className="font-bold">John Doe</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">View Profile</button>
          <button className="w-full mt-2 bg-red-600 text-white p-2 rounded hover:bg-red-700" onClick={() => setIsProfileOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
