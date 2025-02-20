import React from "react";
import Table, { TableColumn } from "@/components/Table";

const employeeData = [
  { id: 1, firstName: "John", lastName: "Doe", username: "johndoe", phone: "1234567890", department: "HR", role: "Manager", hireDate: "2024-02-01" },
  { id: 2, firstName: "Jane", lastName: "Smith", username: "janesmith", phone: "0987654321", department: "IT", role: "Developer", hireDate: "2023-05-15" },
];

const columns:TableColumn[] = [
  { key: "firstName", label: "First Name", filterType: "search" },
  { key: "lastName", label: "Last Name", filterType: "search" },
  { key: "username", label: "Username", filterType: "search" },
  { key: "phone", label: "Phone", filterType: "search" },
  { key: "department", label: "Department", filterType: "dropdown" },
  { key: "role", label: "Role", filterType: "dropdown" },
  { key: "hireDate", label: "Hire Date", filterType: "dropdown" },
];

const AdminPage = () => {
  return <Table columns={columns} data={employeeData} uniqueId="id" />;
};

export default AdminPage;
