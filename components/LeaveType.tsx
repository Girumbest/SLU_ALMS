"use client"
import React, { useState, useEffect } from 'react';
import { LeaveType } from '@prisma/client';
import { getLeaveTypes } from '@/features/hr-admin/actions';

const LeaveTypeManagement: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [newLeaveType, setNewLeaveType] = useState<Omit<LeaveType, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    maxDays: 0,
    accrued: false,
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    const data = (await getLeaveTypes()).leaveTypes;
    setLeaveTypes(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setNewLeaveType((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleAddLeaveType = async () => {
    try {
      await prisma.leaveType.create({
        data: newLeaveType,
      });
      setNewLeaveType({
        name: '',
        description: '',
        maxDays: 0,
        accrued: false,
      });
      fetchLeaveTypes();
    } catch (error) {
      console.error('Error creating leave type:', error);
      // Handle error (e.g., display error message to the user)
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leave Type Management</h1>

      {/* Display Existing Leave Types */}
      <h2 className="text-2xl font-semibold mb-4">Existing Leave Types</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 border-b border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-2 border-b border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                Max Days
              </th>
              <th className="px-4 py-2 border-b border-gray-200 text-left text-sm leading-4 font-medium text-gray-700 uppercase tracking-wider">
                Accrued
              </th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((type, index) => (
              <tr key={type.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2 border-b border-gray-200 text-sm leading-5 text-gray-700">{type.name}</td>
                <td className="px-4 py-2 border-b border-gray-200 text-sm leading-5 text-gray-700">{type.description}</td>
                <td className="px-4 py-2 border-b border-gray-200 text-sm leading-5 text-gray-700">{type.maxDays}</td>
                <td className="px-4 py-2 border-b border-gray-200 text-sm leading-5 text-gray-700">{type.accrued ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Leave Type Form */}
      <h2 className="text-2xl font-semibold mt-8 mb-4">Add New Leave Type</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newLeaveType.name}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={newLeaveType.description}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="maxDays" className="block text-gray-700 text-sm font-bold mb-2">
            Max Days:
          </label>
          <input
            type="number"
            id="maxDays"
            name="maxDays"
            value={newLeaveType.maxDays}
            onChange={handleInputChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="accrued" className="flex items-center">
            <input
              type="checkbox"
              id="accrued"
              name="accrued"
              checked={newLeaveType.accrued}
              onChange={handleInputChange}
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700 text-sm font-bold">Accrued</span>
          </label>
        </div>
        <button
          onClick={handleAddLeaveType}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add Leave Type
        </button>
      </div>
    </div>
  );
};

export default LeaveTypeManagement;
