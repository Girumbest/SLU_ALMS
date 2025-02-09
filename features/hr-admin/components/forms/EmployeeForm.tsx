"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaUniversity, FaUpload, FaDollarSign, FaCalendarAlt, FaAddressBook, FaWallet } from "react-icons/fa";

export default function EmployeeRegisterForm() {
  const [state, dispatch] = useFormState(() => {}, {});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Registration</h2>

      <form action={dispatch} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info Section */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Personal Information</h3>
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input name="firstName" placeholder="First Name" className="input" required />
          {state.errors?.firstName && <p className="text-red-500 text-sm">{state.errors.firstName._errors[0]}</p>}
        </div>

        <div className="input-group">
          <FaUser className="input-icon" />
          <input name="lastName" placeholder="Last Name" className="input" required />
          {state.errors?.lastName && <p className="text-red-500 text-sm">{state.errors.lastName._errors[0]}</p>}
        </div>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input name="username" placeholder="Username" className="input" required />
          {state.errors?.username && <p className="text-red-500 text-sm">{state.errors.username._errors[0]}</p>}
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input type="password" name="password" placeholder="Password" className="input" required />
          {state.errors?.password && <p className="text-red-500 text-sm">{state.errors.password._errors[0]}</p>}
        </div>

        <div className="input-group">
          <FaPhone className="input-icon" />
          <input type="tel" name="phoneNumber" placeholder="Phone Number" className="input" />
          {state.errors?.phoneNumber && <p className="text-red-500 text-sm">{state.errors.phoneNumber._errors[0]}</p>}
        </div>

        <div className="input-group">
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="dateOfBirth" className="input" required />
          {state.errors?.dateOfBirth && <p className="text-red-500 text-sm">{state.errors.dateOfBirth._errors[0]}</p>}
        </div>

        {/*----------------*/}

        <div className="input-group">
        <FaAddressBook className="input-icon" />
          <input name="adress" placeholder="Address" className="input" required />
        </div>
        
        <div className="input-group">
        <FaPhone className="input-icon" />
          <input name="emergencyContactNumber" placeholder="Emergency Contact Number" className="input" required />
        </div>
        {/*----------------*/}
        <div>
        <select name="gender" className="input bg-white" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {state.errors?.gender && <p className="text-red-500 text-sm">{state.errors.gender._errors[0]}</p>}
        </div>

        <select name="maritalStatus" className="input bg-white">
          <option value="">Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>

        {/* Employment Info Section */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Employment Information</h3>
        </div>

        <div className="input-group">
          <FaBriefcase className="input-icon" />
          <input name="jobTitle" placeholder="Job Title" className="input" />
        </div>
        {/* ----------------- */}
        <div className="input-group">
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="dateOfBirth" className="input" required />
        </div>
        <div className="input-group">
          <FaDollarSign className="input-icon" />
          <input type="number" name="salary" placeholder="Salary" className="input" required />
          {state.errors?.salary && <p className="text-red-500 text-sm">{state.errors.salary._errors[0]}</p>}
        </div>
        
        {/* ----------------- */}
        <select name="positionLevel" className="input bg-white">
          <option value="">Select Position Level</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
        <div className="input-group">
          <FaWallet className="input-icon" />
          <input name="directDepositInfo" placeholder="Direct Deposit Info" className="input" />
        </div>

        <select name="department" className="input bg-white">
          <option value="">Select Department</option>
          <option value="HR">HR</option>
          <option value="Engineering">Engineering</option>
        </select>

        <select name="role" className="input bg-white">
          <option value="">Select Role</option>
          <option value="Manager">Manager</option>
          <option value="Developer">Developer</option>
        </select>

        {/* <div className="input-group">
          <FaUniversity className="input-icon" />
          <input name="educationalLevel" placeholder="Education Level" className="input" />
        </div> */}
        <select name="educationalLevel" className="input bg-white">
          <option value="">Education Level</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
        </select>

        {/* Photograph Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            <FaUpload className="mr-2 text-blue-600" /> Upload Photograph:
          </label>
          <input type="file" accept="image/*" name="photograph" onChange={handlePhotoChange} className="input mt-2 bg-white" />
          {photoPreview && <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover mt-2" />}
          {state.errors?.photograph && <p className="text-red-500 text-sm">{state.errors.photograph._errors[0]}</p>}
        </div>

        {/* Certificate Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            <FaUpload className="mr-2 text-blue-600" /> Upload Certificates (PDF):
          </label>
          <input type="file" accept="application/pdf" name="certificates" multiple className="input mt-2 bg-white" />
        </div>

        <button type="submit" className="col-span-1 md:col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
          Submit
        </button>
         {/* Success Message */}
         {state.success && <p className="text-green-600 text-center col-span-2">{state.success}</p>}
      </form>
    </div>
  );
}
