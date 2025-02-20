"use client"
import React, { useState } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";

export interface TableColumn {
  key: string;
  label: string;
  filterType?: "search" | "dropdown"; // Defines search or dropdown filter
}

interface TableProps<T> {
  columns: TableColumn[];
  data: T[];
  uniqueId: keyof T;
  onRowSelect?: (selectedIds: Set<T[keyof T]>) => void;
}

const Table = <T extends Record<string, any>>({ columns, data, uniqueId, onRowSelect }: TableProps<T>) => {
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [selectedRows, setSelectedRows] = useState<Set<T[keyof T]>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // Adjust page size here

  // Generate unique options for dropdown filters
  const getDropdownOptions = (columnKey: string) => {
    return [...new Set(data.map(item => item[columnKey]?.toString()))].filter(Boolean);
  };

  // Handle filter changes
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value.toLowerCase() }));
  };

  // Filtered data
  const filteredData = data.filter((item) =>
    Object.keys(filters).every((key) =>
      !filters[key] ? true : item[key]?.toString().toLowerCase().includes(filters[key])
    )
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Checkbox handling
  const toggleRowSelection = (id: T[keyof T]) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
    onRowSelect?.(newSelectedRows);
  };

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Employee List</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Headers */}
          <thead>
            <tr className="bg-blue-600 text-white text-left">
              <th className="p-3">
                <input type="checkbox" className="w-5 h-5" onChange={() => setSelectedRows(new Set())} />
              </th>
              {columns.map((column) => (
                <th key={column.key} className="p-3">{column.label}</th>
              ))}
            </tr>

            {/* Filter Row */}
            <tr className="bg-gray-200">
              <th className="p-2"></th> {/* For checkboxes */}
              {columns.map((column) => (
                <th key={column.key} className="p-2">
                  {/* Search Input */}
                  {column.filterType === "search" && (
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={`Search ${column.label}`}
                        className="w-full p-2 text-gray-800 rounded bg-white border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      />
                      <FaSearch className="text-gray-500 ml-2" />
                    </div>
                  )}

                  {/* Dropdown Filter */}
                  {column.filterType === "dropdown" && (
                    <select
                      onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded focus:outline-none"
                    >
                      <option value="">All</option>
                      {getDropdownOptions(column.key).map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item[uniqueId]} className="border-b bg-gray-100 hover:bg-gray-200">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={selectedRows.has(item[uniqueId])}
                      onChange={() => toggleRowSelection(item[uniqueId])}
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="p-3 text-gray-600 truncate max-w-[150px]" title={item[column.key]?.toString()}>
                      {item[column.key]?.toString()}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-5 text-center text-gray-500">
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Table;
