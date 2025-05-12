"use client";
import { useEffect, useRef, useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { FaUser, FaPhone, FaEnvelope, FaLock, FaBriefcase, FaUniversity, FaUpload, FaDollarSign, FaCalendarAlt, FaAddressBook, FaWallet, FaEye, FaEyeSlash, FaFilePdf } from "react-icons/fa";

import { createUser, editUser } from "../../actions";
import { UserFormState } from "../../types";
import "../../styles/EmployeeForm.css";
import toast from "react-hot-toast";

import SearchableDropdown from "@/components/SearchableDropdown";
import { generatePassword, generateUsername } from "@/utils/generate";
import { getDepartments } from "@/lib/db-ops";

import { getEmployees } from "@/lib/db-ops";
// import { Employee } from "../../types";
interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
    dateOfBirth: Date | null;
    gender: string;
    maritalStatus?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    address: string | null;
    hireDate: Date | null;
    jobTitle: string | null;
    positionLevel: string | null;
    salary: number | null;
    department: {name: string, id: string};
    role: string;
    educationalLevel?: string | null;
    directDepositInfo?: string | null;
    cv?: string | null;
    photograph: string;
  }

const initialState: UserFormState = {}

interface EmployeeEditFormProps {
  employee: Employee;
  departments: { name: string; id: string }[];
}

export function EmployeeEditForm({ employee, departments }: EmployeeEditFormProps) {
  const [state, formAction] = useActionState(editUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // use isPending instead of `useFormStatus().pending`
  const [isPending, startTransition] = useTransition();

  //Used for setting generated username(from fname & lname)
  const fnameRef = useRef<HTMLInputElement>(null);
  const lnameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  //for eye icon
  const [isHiddenPassword, setIsHiddenPassword] = useState(true);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
//   employee.photograph && setPhotoPreview(URL.createObjectURL(employee.photograph));


  useEffect(() => {
    console.log(state.errors);
    if (state.successMsg) {
      toast.success(state.successMsg);
      // Request the form to reset once the action has completed
      // formRef.current?.reset();
    } else if (state.errorMsg) {
      toast.error(state.errorMsg);
    }
  }, [state]);

  useEffect(() => {
    if (employee) {
      fnameRef.current!.value = employee.firstName;
      lnameRef.current!.value = employee.lastName;
      usernameRef.current!.value = employee.username;
    }
  }, [employee]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form reset

    const formData = new FormData(e.currentTarget)
    //If not selected set the file type to "" for zod validation
    if(!(formData.get("photograph") as File).size) formData.set("photograph","")
    if(!(formData.get("cv") as File).size) formData.set("cv","")

    startTransition(async () => {
      // await action(new FormData(form)
      await formAction(formData); // Manually trigger form action
    });
  }; 


  return (
    
    <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Edit</h2>

{/* TODO: replace input value with defaultValue for all inputs */}
      <form onSubmit={handleSubmit} ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info Section */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Personal Information</h3>
        </div>
        <input type="hidden" name="id" defaultValue={employee.id} />
        <div className="input-group">
          <label htmlFor="firstName" className="input-label">
              First Name
          </label>
          <FaUser className="input-icon" />
          <input ref={fnameRef} name="firstName" defaultValue={employee.firstName} placeholder="First Name" className="input" required pattern="[a-zA-Z]+" title="Enter a valid name" onChange={(e: { target: { value: string | undefined; }; }) =>{ 
            // set username with the genarated one. 
            usernameRef.current!.value = generateUsername(e.target.value, lnameRef.current?.value)}}/>
          {state.errors?.firstName && <p className="text-red-500 text-sm error-message">{state.errors.firstName[0]}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="lastName" className="input-label">
              Last Name
          </label>

          <FaUser className="input-icon" />
          <input ref={lnameRef} name="lastName" defaultValue={employee.lastName} placeholder="Last Name" className="input" pattern="[a-zA-Z]+" title="Enter a valid name" required onChange={e =>{
            // set username with the genarated one. 
            usernameRef.current!.value = generateUsername(fnameRef.current?.value, e.target.value)}}/>
          {state.errors?.lastName && <p className="text-red-500 text-sm error-message">{state.errors.lastName [0]}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="username" className="input-label">
              Username
          </label>

          <FaEnvelope className="input-icon" />
          <input ref={usernameRef} name="username" defaultValue={employee.username} placeholder="Username" className="input" pattern="[a-zA-Z0-9_]+" title="Enter valid username" required />
          {state.errors?.username && <p className="text-red-500 text-sm error-message">{state.errors.username [0]}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
              Password
          </label>


          <FaLock className="input-icon" />
          <input type={isHiddenPassword ? "password" : "text"} name="password" placeholder="Password" className="input" required onFocus={ e => e.target.value = generatePassword()}/>
          {isHiddenPassword ? <FaEye className="absolute right-3 text-gray-500 cursor-pointer" onClick={()=>setIsHiddenPassword(false)}/> : <FaEyeSlash className="absolute right-3 text-gray-500 cursor-pointer" onClick={()=>setIsHiddenPassword(true)}/>}
          {state.errors?.password && <p className="text-red-500 text-sm error-message">{state.errors.password [0]}</p>}
        </div>

        <div className="input-group">
           <label htmlFor="phoneNumber" className="input-label">
              Phone Number
          </label>


          <FaPhone className="input-icon" />
          <input type="tel" name="phoneNumber" defaultValue={employee.phoneNumber} placeholder="Phone Number" className="input" />
          {state.errors?.phoneNumber && <p className="text-red-500 text-sm error-message">{state.errors.phoneNumber [0]}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="dateOfBirth" className="input-label">
              Date of Birth
          </label>
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="dateOfBirth" defaultValue={formatDate(employee.dateOfBirth)} className="input" title="Date of Birth" required />
          {state.errors?.dateOfBirth && <p className="text-red-500 text-sm error-message">{state.errors.dateOfBirth [0]}</p>}
        </div>

        {/*----------------*/}

        <div className="input-group">
          <label htmlFor="address" className="input-label">
              Address
          </label>

          <FaAddressBook className="input-icon" />
          <input name="address" defaultValue={employee.address as string} placeholder="Address" className="input" required />
          {state.errors?.address && <p className="text-red-500 text-sm error-message">{state.errors.address [0]}</p>}
        </div>
        
        <div className="input-group">
          <label htmlFor="emergencyContactPhone" className="input-label">
              Emergency Contact No.
          </label>

          <FaPhone className="input-icon" />
          <input name="emergencyContactPhone" defaultValue={employee.emergencyContactPhone as string} placeholder="Emergency Contact Number" className="input" required />
          {state.errors?.emergencyContactPhone && <p className="text-red-500 text-sm error-message">{state.errors.emergencyContactPhone [0]}</p>}
        </div>
        {/*----------------*/}
        <div className="input-group">
          <label htmlFor="gender" className="input-label">
              Gender
          </label>

        <select name="gender" defaultValue={employee.gender} className="input bg-white" required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {state.errors?.gender && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.gender [0]}</p>}
        </div>

        <div className="input-group">
        <label htmlFor="maritalStatus" className="input-label">
              Marital Status
          </label>
        <select name="maritalStatus" defaultValue={employee.maritalStatus as string} className="input bg-white">
          <option value="">Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
        {state.errors?.maritalStatus && <p className="text-red-500 text-sm !-bottom-14 error-message">{state.errors.maritalStatus [0]}</p>}
        </div>

        {/* Employment Info Section */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Employment Information</h3>
        </div>

        <div className="input-group">
          <label htmlFor="jobTitle" className="input-label">
              Job Title
          </label>

          <FaBriefcase className="input-icon" />
          <input name="jobTitle" defaultValue={employee.jobTitle as string} placeholder="Job Title" className="input" />
          {state.errors?.jobTitle && <p className="text-red-500 text-sm error-message">{state.errors.jobTitle [0]}</p>}
        </div>
        {/* ----------------- */}
        <div className="input-group">
          <label htmlFor="hireDate" className="input-label">
              Hire Date
          </label>
          <FaCalendarAlt className="input-icon" />
          <input type="date" name="hireDate" defaultValue={formatDate(employee.hireDate)} className="input" required title="Hire Date"/>
          {state.errors?.hireDate && <p className="text-red-500 text-sm error-message">{state.errors.hireDate [0]}</p>}
        </div>
        <div className="input-group">
          <label htmlFor="salary" className="input-label">
              Salary
          </label>

          <FaDollarSign className="input-icon" />
          <input type="number" name="salary" defaultValue={Number(employee.salary)} placeholder="Salary" className="input" required />
          {state.errors?.salary && <p className="text-red-500 text-sm error-message">{state.errors.salary [0]}</p>}
        </div>
        
        {/* ----------------- */}
        <div className="input-group">
        <label htmlFor="positionLevel" className="input-label">
              Position Level
          </label>
        <select name="positionLevel" defaultValue={employee.positionLevel as string} className="input bg-white">
          <option value="">Select Position Level</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>
        {state.errors?.positionLevel && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.positionLevel [0]}</p>}
        </div>
        <div className="input-group">
          <label htmlFor="directDepositInfo" className="input-label">
              Direct Deposit Info
          </label>


          <FaWallet className="input-icon" />
          <input name="directDepositInfo" defaultValue={employee.directDepositInfo as string} placeholder="Direct Deposit Info" className="input" />
          {state.errors?.directDepositInfo && <p className="text-red-500 text-sm error-message">{state.errors.directDepositInfo [0]}</p>}
        </div>
        {/* <div className="input-group">
        <select name="department" className="input bg-white">
          <option value="">Select Department</option>
          <option value="HR">HR</option>
          <option value="Engineering">Engineering</option>
        </select>
        {state.errors?.department && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.department [0]}</p>}
        </div> */}
        <div className="relative">
        <label htmlFor="department" className="input-label">
              Department
          </label>
        <SearchableDropdown options={departments} inputElementName={"department"} title={"Select Department"} default={employee.department} />
        {state.errors?.department && <p className="text-red-500 text-sm absolute top-100p left-2.5">{state.errors.department [0]}</p>}
        </div>

      <div className="input-group">
        <label htmlFor="role" className="input-label">
              Role
          </label>

        <select name="role" defaultValue={employee.role} className="input bg-white">
          <option value="">Select Role</option>
          <option value="Employee">Employee</option>
          <option value="Supervisor">Supervisor</option>
        </select>
        {state.errors?.role && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.role [0]}</p>}
      </div>
        {/* <div className="input-group">
          <FaUniversity className="input-icon" />
          <input name="educationalLevel" placeholder="Education Level" className="input" />
        </div> */}
        <div className="input-group">
          <label htmlFor="educationalLevel" className="input-label">
              Education Level
          </label>

        <select name="educationalLevel" defaultValue={employee.educationalLevel as string} className="input bg-white">
          <option value="">Education Level</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="PhD">PhD</option>
        </select>
        {state.errors?.educationalLevel && <p className="text-red-500 text-sm !-bottom-10 error-message">{state.errors.educationalLevel [0]}</p>}
        </div>


        {/* Photograph Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            <FaUpload className="mr-2 text-blue-600" /> Upload Photograph:
          </label>
          <input type="file" accept="image/*" name="photograph" onChange={handlePhotoChange} className="input mt-2 bg-white" />
          {<img src={photoPreview || `/api/photos/${employee.photograph}`} alt="Preview" className="w-24 h-24 rounded-full object-cover mt-2" />}
          {state.errors?.photograph && <p className="text-red-500 text-sm error-message">{state.errors.photograph [0]}</p>}
        </div>

        {/* Certificate Upload */}
        <div className="col-span-1 md:col-span-2">
          <label className="font-semibold text-gray-700 flex items-center">
            <FaUpload className="mr-2 text-blue-600" /> Upload CV (PDF):
          </label>
          <input type="file" accept="application/pdf" name="cv" className="input mt-2 bg-white" />
          {employee?.cv &&(<Link href={`/api/cv/${employee.cv}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-2">
                  <FaFilePdf className="text-red-500" /> View CV
            </Link>)}
        </div>
        
        <div className="col-span-2 flex gap-4">
            <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition flex-1 text-center"
                disabled={isPending}
            >
                {isPending ? "Updating..." : "Update Employee"}
            </button>
            <Link
                href={"/admin/employees"}
                className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-700 transition flex-1 text-center"
            > Cancel
            </Link>
        </div>


         {/* Success Message */}
         {/* {state.success && <p className="text-green-600 text-center col-span-2">{state.success}</p>} */}
      </form>
    </div>
  );
}
