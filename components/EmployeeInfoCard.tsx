import React from "react";
import { FaUser, FaPhone, FaEnvelope, FaBirthdayCake, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaBuilding, FaGraduationCap, FaFilePdf } from "react-icons/fa";

interface Employee {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address: string;
  hireDate: string;
  jobTitle: string;
  positionLevel: string;
  salary: number;
  department: string;
  role: string;
  educationalLevel?: string;
  directDepositInfo?: string;
  certificates?: string[];
  photograph?: string;
}

const EmployeeInfoCard: React.FC<{ employee: Employee }> = ({ employee }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Profile Photo */}
        <img
          src={employee.photograph || "/default-profile.png"} // Fallback image
          alt={`${employee.firstName} ${employee.lastName}`}
          className="w-32 h-40 object-cover rounded-lg border-2 border-gray-300"
        />

        {/* Employee Name & Job Info */}
        <div className="ml-6 mt-4 md:mt-0">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUser className="text-blue-600" /> {employee.firstName} {employee.lastName}
          </h2>
          <p className="text-gray-500">@{employee.username}</p>
          <p className="text-blue-600 font-semibold text-lg flex items-center gap-2">
            <FaBriefcase /> {employee.jobTitle}
          </p>
          <p className="text-gray-600 text-sm flex items-center gap-2">
            <FaBuilding /> {employee.department}
          </p>
        </div>
      </div>

      {/* Personal & Employment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Personal Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Personal Information</h3>
          <div className="space-y-2">
            <p className="text-gray-600 flex items-center gap-2">
              <FaPhone className="text-blue-500" /> {employee.phoneNumber}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaBirthdayCake className="text-red-500" /> {employee.dateOfBirth}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaUser className="text-green-500" /> {employee.gender} - {employee.maritalStatus || "N/A"}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaMapMarkerAlt className="text-yellow-500" /> {employee.address}
            </p>
          </div>
        </div>

        {/* Employment Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Employment Details</h3>
          <div className="space-y-2">
            <p className="text-gray-600 flex items-center gap-2">
              <FaBriefcase className="text-purple-500" /> Position: {employee.positionLevel}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-500" /> Salary: ${employee.salary.toLocaleString()}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaBuilding className="text-indigo-500" /> Role: {employee.role}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <FaGraduationCap className="text-blue-500" /> Education: {employee.educationalLevel || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Emergency Contact</h3>
        <p className="text-gray-600 flex items-center gap-2">
          <FaUser className="text-red-500" /> {employee.emergencyContactName || "N/A"}
        </p>
        <p className="text-gray-600 flex items-center gap-2">
          <FaPhone className="text-blue-500" /> {employee.emergencyContactPhone || "N/A"}
        </p>
      </div>

      {/* Certificates */}
      {employee.certificates && employee.certificates.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Certificates</h3>
          <ul className="list-disc list-inside text-gray-600">
            {employee.certificates.map((cert, index) => (
              <li key={index}>
                <a href={cert} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-2">
                  <FaFilePdf className="text-red-500" /> Certificate {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmployeeInfoCard;
