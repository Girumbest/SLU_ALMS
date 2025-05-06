"use client"
import { addLeaveType,editLeaveType, getLeaveTypes } from "@/features/hr-admin/actions";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaChevronDown, FaPen } from "react-icons/fa";
import { ClipLoader, PropagateLoader } from "react-spinners";


interface LeaveType{
    id?: number,
    name: string,
    description: string,
    maxDays: number,
//   accrued: boolean,
}
const LeaveTypeManagementTable = () => {

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  const [selectedRow, setSelectedRow] = useState();
  const [openNewLeaveForm, setOpenNewLeaveForm] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [newLeaveType, setNewLeaveType] = useState<LeaveType>({
    name: '',
    description: '',
    maxDays: 0,
  });
  const [updateLeaveType, setUpdateLeaveType] = useState({
    id: 0,
    name: '',
    description: '',
    maxDays: 0,
  });
  useEffect(() => {
    getLeaveTypes().then((data) => {
        setLeaveTypes(data?.leaveTypes);
        setDataLoading(false);
    });
  }, [reload]);

  const handleLeaveTypeAdd = async () => {
    setSaveLoading(true);
    if(!newLeaveType.name){
      toast.error("Leave type name is required");
      setSaveLoading(false);
      return
    }
    const res = await addLeaveType(newLeaveType);
    setSaveLoading(false);
    if(res.errorMsg){
      toast.error(res.errorMsg)
      return
    }
    if(res.successMsg){
      toast.success(res.successMsg)
      setReload(!reload)
    }

    setOpenNewLeaveForm(false);
    setNewLeaveType({
      name: '',
      description: '',
      maxDays: 0,
    });
  }
  const handleLeaveTypeUpdate = async () => {
    setUpdateLoading(true);
    if(!updateLeaveType.name){
      toast.error("Leave type name is required");
      setUpdateLoading(false);
      return
    }

    const res = await editLeaveType(updateLeaveType);
    setUpdateLoading(false);
    if(res.errorMsg){
      toast.error(res.errorMsg)
      return
    }
    if(res.successMsg){
      toast.success(res.successMsg)
      setReload(!reload)
    }
    setSelectedRow(undefined);
    setUpdateLeaveType({
      id: 0,
      name: '',
      description: '',
      maxDays: 0,
    })
  }

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Leave Types</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Headers */}
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              {["Type Name", "Description", "Max Days", "Created At", "Updated At", "Action"].map((column) => (
                <th key={column} className="p-3">{column}</th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {leaveTypes.length > 0 ? (
              leaveTypes.map((type) => (
                <tr key={type.id} className={ selectedRow === type.id ? "border-b bg-blue-200 hover:bg-blue-300" :
                 "border-b bg-gray-100 hover:bg-gray-200"}>
                  <td className="p-3">
                    <input
                      type="text"
                      value={selectedRow === type.id ? updateLeaveType.name : type.name || ""}
                      disabled={selectedRow !== type.id}
                      className={selectedRow === type.id ? "w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400":"w-full p-2 text-gray-800 rounded  focus:outline-none focus:ring focus:ring-blue-400"}
                      onChange={(e) => setUpdateLeaveType({ ...updateLeaveType, name: e.target.value })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={selectedRow === type.id ? updateLeaveType.description || "" : type.description || ""}
                      disabled={selectedRow !== type.id}
                      className={selectedRow === type.id ? "w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400":"w-full p-2 text-gray-800 rounded  focus:outline-none focus:ring focus:ring-blue-400"}
                      onChange={(e) => setUpdateLeaveType({ ...updateLeaveType, description: e.target.value })}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={selectedRow === type.id ? updateLeaveType.maxDays || 0: type.maxDays || 0}
                      disabled={selectedRow !== type.id}
                      className={selectedRow === type.id ? "w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400":"w-full p-2 text-gray-800 rounded  focus:outline-none focus:ring focus:ring-blue-400"}
                      onChange={(e) => setUpdateLeaveType({ ...updateLeaveType, maxDays: Number(e.target.value) })}
                    />
                  </td>

                  <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {new Date(type.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3 text-gray-600 truncate max-w-[150px]">
                    {new Date(type.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <button
                      disabled={updateLoading}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => {
                        //Handle update
                        (selectedRow === type.id && handleLeaveTypeUpdate())
                      }}
                    >
                        {!updateLoading && (selectedRow === type.id ? "Update" 
                        : <FaPen 
                        size={18} 
                        onClick={() => {
                          setSelectedRow(type.id);
                          setUpdateLeaveType({
                            id: type.id,
                            name: type.name,
                            description: type.description,
                            maxDays: type.maxDays,
                          });

                            
                        }}/>)}
                        <ClipLoader 
                          loading={updateLoading && selectedRow === type.id}
                          color="#fff"
                          cssOverride={{
                              display: 'block',
                              margin: '0 auto',
                          }}
                          size={15}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-5 text-center text-gray-500">
                {!dataLoading && <span>No leave types found.</span>}
                  <PropagateLoader 
                    loading={dataLoading}
                    color="#2563eb"
                    cssOverride={{
                      display: 'block',
                      margin: '0 auto',
                    }}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
                </td>
              </tr>
            )}

            <tr >
              <td className="p-3">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      setOpenNewLeaveForm(!openNewLeaveForm)
                    }}
                  >
                    Add New
                  </button>
                </td>
              </tr>
              {openNewLeaveForm &&
              <tr className="border-b bg-gray-100 hover:bg-gray-200">
                <td className="p-3">
                  <input
                    type="text"
                    placeholder="Leave Type Name"
                    value={newLeaveType.name}
                    className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    placeholder="Description"
                    value={newLeaveType.description}
                    className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={newLeaveType.maxDays}
                    className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                    onChange={(e) => setNewLeaveType({ ...newLeaveType, maxDays: Number(e.target.value) })}
                  />
                </td>
                <td className="p-3 text-gray-600 truncate max-w-[150px]">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-3 text-gray-600 truncate max-w-[150px]">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                
                <td className="p-3">
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={saveLoading}
                    onClick={() => {
                      //Handle add new
                      handleLeaveTypeAdd()
                    }}
                  >
                    {!saveLoading && "Save"}
                    <ClipLoader 
                      loading={saveLoading}
                      color="#fff"
                      cssOverride={{
                          display: 'block',
                          margin: '0 auto',
                      }}
                      size={15}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  </button>
                </td>
                
              </tr>}
          </tbody>
        </table>
      </div>

     </div>
  );
};

export default LeaveTypeManagementTable;
