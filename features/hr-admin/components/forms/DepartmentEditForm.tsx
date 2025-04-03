"use client"
import React, { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { updateDepartment } from '../../actions';
import { UserFormState } from '../../types';
import toast from 'react-hot-toast';
import "../../styles/EmployeeForm.css";
import SearchableDropdown from '@/components/SearchableDropdown';
import SearchInput from '@/components/SearchInput';

const initialState: UserFormState = {}


const DepartmentEditForm = ({department}:{department:{id:string, name:string, nameAmharic?: string | "", description?:string | ""}}) => {

  
  const [search, setSearch] = useState<string>("");
  // const filteredOptions = supervisors?.filter(option =>
  //   option.name.toLowerCase().includes(search.toLowerCase())
  // );

  const [state, formAction] = useActionState(updateDepartment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

// use isPending instead of `useFormStatus().pending`
  const [isPending, startTransition] = useTransition();
  const [isModified, setIsModified] = useState(false)

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
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Edit Department</h3>
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className='flex flex-col relative'>
          <input type="text" name="name" defaultValue={department.name} placeholder="Department Name" className="p-2 border rounded" required onChange={e => setIsModified(true)}/>
          {state.errors?.name && <p className="text-red-500 text-sm error-message -bottom-30">{state.errors.name [0]}</p>}
          </div>
          <input type="hidden" name="id" defaultValue={department.id} />
          
          <div className='flex flex-col relative'>
          <input type="text" name="nameAmharic" defaultValue={department.nameAmharic} placeholder="የመምሪያው ስም" className="p-2 border rounded" onChange={e => setIsModified(true)}/>
          {state.errors?.nameAmharic && <p className="text-red-500 text-sm error-message -bottom-30">{state.errors.nameAmharic [0]}</p>}
          </div>

          {/* <SearchInput options={supervisors} /> */}
          
          {/* <input type="number" name="employeeCount" placeholder="No. Employees" className="p-2 border rounded"  />
          <input type="date" name="dateCreated" className="p-2 border rounded"  /> */}
          <textarea name="description" defaultValue={department.description} placeholder="Department Description" className="col-span-2 p-2 border rounded" rows={3} onChange={e => setIsModified(true)}></textarea>
          <button type="submit" className={isModified ? "col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700" : "col-span-2 bg-blue-400 text-white p-2 rounded"} disabled={isPending || !isModified}>
            { isPending ? "Saving..." :"Save"}
          </button>
        </form>
      </div>
  );
}

export default DepartmentEditForm