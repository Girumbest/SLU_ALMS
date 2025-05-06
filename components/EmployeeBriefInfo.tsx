import { getEmployeeById } from "@/features/hr-admin/actions";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";

interface EmployeeInfo {
  firstName: string;
  lastName: string;
  username: string;
  jobTitle: string;
  department: { name: string };
  photograph: string;
}

const EmployeeSummary = ({ empId }: { empId: number }) => {
  const [employee, setEmployee] = useState<EmployeeInfo>();
  const [loading, setLoading] = useState<boolean>(true);
  const {data:session, status} = useSession();
  const user = session?.user

  useEffect(() => {
    getEmployeeById(empId).then((data) => {
      setEmployee(data);
      setLoading(false);
    });
  }, [empId]);
  //<div className="bg-gray-100 p-4 rounded-md shadow-sm mb-4">
  return (
    <div className="bg-gray-100 p-4 rounded-md shadow-sm mb-4">
      {/* <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6"> */}
      {/* Employee Info Card */}
      {employee ? (
        <div className="flex flex-col items-center mb-4">
          <img
            src={"/api/photos/" + employee.photograph || "/default-profile.png"}
            alt={`${employee.firstName} ${employee.lastName}`}
            className="w-32 h-32 object-cover rounded-full border-2 border-gray-300 mb-2"
          />
          <h2 className="text-xl font-bold text-gray-800">
            {employee.firstName} {employee.lastName}
          </h2>
          <Link
            href={user?.role==="HRAdmin" ? `/admin/employees/${employee.username}`: `/supervisor/employees/${employee.username}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <p className="text-gray-600">@{employee.username}</p>
          </Link>
          <p className="text-blue-500">
            {employee.jobTitle} - {employee.department.name}
          </p>
        </div>
      ):
      !loading && <span>Couldn't Fetch Employee Info.</span>}
      <PuffLoader
        loading={loading}
        color="#2563eb"
        cssOverride={{
          display: "block",
          margin: "0 auto",
        }}
        size={40}
      />
    </div>
  );
};
export default EmployeeSummary;
