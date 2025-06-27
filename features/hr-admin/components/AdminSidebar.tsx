"use client"
import React, { useState, useRef } from "react";
import { 
  FaHome, FaUsers, FaBuilding, FaCog, FaSignOutAlt, 
  FaBars, FaChevronDown, FaCalendarCheck, FaCalendarTimes, 
  FaSitemap, FaUserPlus, FaAddressBook, FaCalendar, 
  FaList
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { signOut, useSession } from 'next-auth/react';
import Link from "next/link";
import "../styles/Sidebar.css"

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: MenuItem[];
  isParentLink?: boolean;
}

const AdminSidebar = () => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const id = session?.user?.id;
  const pathname = usePathname();
  const chevronRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  // const [loading, setLoading] = useState(false)

  const menus: MenuItem[] = [
    { name: "Dashboard", icon: <FaHome />, path: "/admin" },
    { 
      name: "Employees", 
      icon: <FaAddressBook />, 
      path: "#",
      subItems: [
        { name: "All Employees", icon: <FaUsers />, path: "/admin/employees" },
        { name: "Register New", icon: <FaUserPlus />, path: "/admin/employees/new" }
      ]
    },
    { name: "Departments", icon: <FaSitemap />, path: "/admin/departments" },
    { 
      name: "Attendance", 
      icon: <FaCalendarCheck />, 
      path: "/admin/attendance" 
    },
    { 
      name: "Leave", 
      icon: <FaCalendarTimes />, 
      path: "#",
      subItems: [
        { name: "Leave Requests", icon: <FaCalendarTimes />, path: "/admin/leave" },
        { name: "Leave Types", icon: <FaList />, path: "/admin/leave/leave-types" }
      ]
    },
    { name: "Calendar", icon: <FaCalendar />, path: "/admin/calendar" },
    { name: "Settings", icon: <FaCog />, path: "/admin/settings" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "#" },
  ];

  const isActive = (menuItem: MenuItem): boolean => {
    // Skip parent items from being highlighted
    if (menuItem.subItems) return false;
    
    // Exact match for the current path
    if (pathname === menuItem.path) return true;
    
    // Special cases for dynamic routes
    const current = pathname.split("/").pop();
    
    // Handle /admin/employees/new
    if (menuItem.name === "Register New" && pathname === "/admin/employees/new") {
      return true;
    }
    
    // Handle /admin/employees/[id] and /admin/employees/edit/[id]
    if (menuItem.name === "All Employees" && 
        (pathname.startsWith("/admin/employees/") && 
         !pathname.startsWith("/admin/employees/new"))) {
      return true;
    }
    
    // Handle /admin/leave/leave-types
    if (menuItem.name === "Leave Types" && pathname === "/admin/leave/leave-types") {
      return true;
    }
    
    // Handle /admin/leave/[id]
    if (menuItem.name === "Leave Requests" && 
        pathname.startsWith("/admin/leave/") && 
        pathname !== "/admin/leave/leave-types") {
      return true;
    }

    // Handle /admin/departments/[id]
    if (menuItem.name === "Departments" && 
        pathname.startsWith("/admin/departments/")) {
      return true;
    }

    // Handle /admin/attendance/[id]
    if (menuItem.name === "Attendance" && 
        pathname.startsWith("/admin/attendance/")) {
      return true;
    }
    
    return false;
  };

  const handleChevronClick = (e: React.MouseEvent, menuName: string) => {
    e.stopPropagation();
    setOpenSubMenu(openSubMenu === menuName ? null : menuName);
  };

  const handleMenuClick = (menuItem: MenuItem) => {
    if (menuItem.name === "Logout") {
      signOut({ callbackUrl: '/login' });
      return;
    }

    if (menuItem.subItems) {
      // For parent items, only toggle submenu (don't navigate)
      if (!isCollapsed) {
        setOpenSubMenu(openSubMenu === menuItem.name ? null : menuItem.name);
      } else {
        // In collapsed mode, open the first sub-item
        if (menuItem.subItems.length > 0) {
          router.push(menuItem.subItems[0].path);
        }
      }
    } else if (menuItem.path !== "#") {
      // Only navigate if it's not a non-clickable item
      router.push(menuItem.path);
    }
  };

  // Automatically open submenu if any child is active
  const shouldSubMenuBeOpen = (menuItem: MenuItem): boolean => {
    if (!menuItem.subItems) return false;
    return menuItem.subItems.some(subItem => isActive(subItem));
  };

  const renderMenuItems = (items: MenuItem[], isSubMenu = false) => {
    return items.map((item) => {
      const isSubMenuOpen = openSubMenu === item.name || shouldSubMenuBeOpen(item);
      
      return (
        <React.Fragment key={item.name}>
          <div
            className={`flex items-center p-3 transition-all cursor-pointer
              ${isActive(item) ? "bg-blue-600" : "hover:bg-gray-700"}
              ${isSubMenu ? "pl-8" : ""}
              ${isCollapsed && !isSubMenu ? "justify-center" : ""}
            `}
            onClick={() => handleMenuClick(item)}
            title={!isCollapsed ? "" : item.name}
          >
            {/* <ClipLoader loading={loading} size={20} color="#fff" className="mr-2" /> */}
            <span className="text-lg">{item.icon}</span>
            {(!isCollapsed || isSubMenu) && (
              <span className="ml-3 flex-1">
                {item.name}
              </span>
            )}
            {item.subItems && !isCollapsed && (
              <span 
                ref={el => chevronRefs.current[item.name] = el}
                className="ml-2 p-1 hover:bg-gray-600 rounded"
                onClick={(e) => handleChevronClick(e, item.name)}
              >
                <FaChevronDown 
                  className={`text-xs transition-transform duration-200 
                    ${isSubMenuOpen ? "transform rotate-180" : ""}
                  `}
                />
              </span>
            )}
          </div>
          
          {item.subItems && (isCollapsed ? false : isSubMenuOpen) && (
            <div className="bg-gray-800">
              {renderMenuItems(item.subItems, true)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 
      ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between w-full border-b border-gray-700">
        <div className={`flex items-center justify-between ${!isCollapsed && 'min-w-[85%]'} `}> {/* This div is always present */}
          {!isCollapsed && (
            <> {/* Use a fragment for the conditionally rendered logo and text */}
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="rounded"
                priority
              />
              <span className=" mr-3 text-md font-semibold">Admin Panel</span>
            </>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="text-xl hover:text-blue-400 transition-colors focus:outline-none"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thumb-gray-700 scrollbar-track-gray-900 hide-scrollbar">
        {renderMenuItems(menus)}
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-700">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-gray-800 rounded p-2 transition-colors"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="flex items-center">
            <Image 
              src={session?.user?.image || "/profile.jpg"} 
              alt="Profile" 
              width={32} 
              height={32} 
              className="rounded-full"
            />
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <FaChevronDown 
              className={`text-sm transition-transform duration-200 
                ${isProfileOpen ? "transform rotate-180" : ""}
              `}
            />
          )}
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && !isCollapsed && (
          <div className="absolute bottom-16 left-4 bg-gray-800 text-white rounded-lg shadow-xl overflow-hidden w-56 z-10">
            <div className="p-4 border-b border-gray-700">
              {/* <p className="font-medium">{session?.user?.name}</p> */}
              <p className="text-sm text-gray-400 truncate">{session?.user?.name}</p>
            </div>
            <Link 
              href={`/admin/employees/${session?.user?.name}`}
              className="block px-4 py-3 hover:bg-gray-700 transition-colors"
              onClick={() => setIsProfileOpen(false)}
            >
              View Profile
            </Link>
            <button 
              className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-t border-gray-700"
              onClick={() => {
                signOut({ callbackUrl: '/login' });
                setIsProfileOpen(false);
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;