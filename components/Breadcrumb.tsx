"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight, FaHome } from "react-icons/fa";

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    let displayName = segment;

    // Customize display names for specific segments
    switch (segment) {
      case "admin":
        displayName = "Admin";
        break;
      case "dashboard":
        displayName = "Dashboard";
        break;
      case "employees":
        displayName = "Employees";
        break;
      case "new":
        displayName = "Register Employee";
        break;
      case "departments":
        displayName = "Departments";
        break;
      case "settings":
        displayName = "Settings";
        break;
      default:
        // Handle dynamic segments (e.g., employee ID, department ID)
        if (!isNaN(Number(segment))) {
          displayName = "Details";
        } else {
          displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
        break;
    }

    return {
      href,
      displayName,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <nav aria-label="breadcrumb" className="bg-gray-100 p-4 rounded-md shadow-sm mb-1 sticky top-0 z-10">
      <ol className="flex items-center">
        <li className="flex items-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            <div className="flex items-center">
                <FaHome className="mr-2" />
                Home
            </div>
          </Link>
          {breadcrumbs.length > 0 && <FaChevronRight className="mx-2 text-gray-400" />}
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="flex items-center">
            {breadcrumb.isLast ? (
              <span className="text-gray-700">{breadcrumb.displayName}</span>
            ) : (
              <Link href={breadcrumb.href} className="text-blue-600 hover:text-blue-800">
                {breadcrumb.displayName}
              </Link>
            )}
            {!breadcrumb.isLast && <FaChevronRight className="mx-2 text-gray-400" />}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
