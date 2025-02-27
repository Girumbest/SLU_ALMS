"use client"
import React, { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { createDepartment } from '../../actions';
import { UserFormState } from '../../types';
import toast from 'react-hot-toast';
import "../../styles/EmployeeForm.css";
import SearchableDropdown from '@/components/SearchableDropdown';
import SearchInput from '@/components/SearchInput';

const initialState: UserFormState = {}


const DepartmentForm = ({supervisors}:{supervisors:{id:string, name:string}[]}) => {

  
  const [search, setSearch] = useState<string>("");
  const filteredOptions = supervisors.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const [state, formAction] = useActionState(createDepartment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

// use isPending instead of `useFormStatus().pending`
  const [isPending, startTransition] = useTransition();

  useEffect(()=>{
    console.log(state.errors)
    if(state.successMsg){
      toast.success(state.successMsg)
      // Request the form to reset once the action has completed
      // formRef.current?.reset();
    }else if(state.errorMsg){
      toast.error(state.errorMsg)
    }
  },[state]);

      
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form reset
    if(!confirm("Do you really want to do this?")) return false;
    startTransition(async () => {
        // await action(new FormData(form)
        await formAction(new FormData(e.currentTarget)); // Manually trigger form action
    });
}
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Department</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className='flex flex-col relative'>
          <input type="text" name="name" placeholder="Department Name" className="p-2 border rounded" required />
          {state.errors?.name && <p className="text-red-500 text-sm error-message -bottom-30">{state.errors.name [0]}</p>}
          </div>

          <div className='flex flex-col relative'>
          <input type="text" name="nameAmharic" placeholder="የመምሪያው ስም" className="p-2 border rounded" />
          {state.errors?.nameAmharic && <p className="text-red-500 text-sm error-message -bottom-30">{state.errors.nameAmharic [0]}</p>}
          </div>

          {/* <SearchInput options={supervisors} /> */}
          
          {/* <input type="number" name="employeeCount" placeholder="No. Employees" className="p-2 border rounded"  />
          <input type="date" name="dateCreated" className="p-2 border rounded"  /> */}
          <textarea name="description" placeholder="Department Description" className="col-span-2 p-2 border rounded" rows={3}></textarea>
          <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700" disabled={isPending}>
            { isPending ? "Processing..." :"Add Department"}
          </button>
        </form>
      </div>
  );
}

export default DepartmentForm