"use client"
import React, { useState } from "react";
import { 
  FaHome, FaCalendarCheck, FaCalendarTimes, 
  FaCalendar, FaSignOutAlt, FaBars, FaSitemap 
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from 'next-auth/react';
import Link from "next/link";

const EmployeeSidebar = () => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const {data:session, status: sessionStatus} = useSession();
  

  const menuItems = [
    // { name: "Dashboard", icon: <FaHome />, path: "/admin/dashboard" },
    { name: "Attendance", icon: <FaCalendarCheck />, path: "/" },
    { name: "Request Leave", icon: <FaSitemap />, path: "/leave/request" },
    { name: "Leave History", icon: <FaCalendarTimes />, path: "/leave/history" },
    { name: "Calendar", icon: <FaCalendar />, path: "/calendar" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "#" },
  ];

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    if (path === "#") {
      signOut({ callbackUrl: '/login' });
    } else {
      router.push(path);
    }
  };

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-0" : "w-64"
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
            <span className="ml-3 text-lg font-semibold">SLU ALMS</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={`text-xl hover:text-blue-400 transition-colors focus:outline-none ${isCollapsed ? "absolute left-0 top-10  text-gray-600" : "relative"}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-2 `}>
        {menuItems.map((item) => (
          <div
            key={item.name}
            className={`flex items-center p-3 cursor-pointer transition-all ${
              isActive(item.path) ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="text-lg">{item.icon}</span>
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </div>
        ))}
      </nav>

      {/* Profile Section */}
      <div 
        className="p-4 border-t border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsProfileOpen(!isProfileOpen)}
      >
        <div className="flex items-center">
          <Image 
            src="/profile.jpg" 
            alt="Profile" 
            width={32} 
            height={32} 
            className="rounded-full"
          />
          {!isCollapsed && (
            <div className="ml-3">
              <p className="font-medium">{`@${session?.user.name}`}</p>
              <p className="text-xs text-gray-400">{`${session?.user.role}`}</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Popup */}
      {isProfileOpen && !isCollapsed && (
        <div className="absolute bottom-16 left-4 bg-gray-800 text-white rounded-lg shadow-xl overflow-hidden w-56 z-10">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center">
              <Image 
                src="/profile.jpg" 
                alt="Profile" 
                width={48} 
                height={48} 
                className="rounded-full"
              />
              <div className="ml-3">
                <p className="font-medium">{`@${session?.user.name}`}</p>
                {/* <p className="text-sm text-gray-400">john.doe@example.com</p> */}
              </div>
            </div>
          </div>
          <Link href={`/profile`} className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors">
            View Profile
          </Link>
          <button 
            className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-t border-gray-700"
            onClick={() => {
              signOut({ callbackUrl: '/login' });
              setIsProfileOpen(false);
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployeeSidebar;