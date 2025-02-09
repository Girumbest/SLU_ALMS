import EmployeeTable from "@/components/EmployeeTable";

const employees = [
  {
    id: 1,
    firstName: "Alice",
    lastName: "Johnson",
    username: "alicej",
    phoneNumber: "+1234567890",
    jobTitle: "Software Engineer",
    department: "Engineering",
    role: "Frontend Developer",
    salary: 75000,
    hireDate: "2021-03-15",
    photograph: "/images/alice.jpg",
  },
  {
    id: 2,
    firstName: "Bob",
    lastName: "Smith",
    username: "bobsmith",
    phoneNumber: "+9876543210",
    jobTitle: "HR Manager",
    department: "Human Resources",
    role: "Manager",
    salary: 65000,
    hireDate: "2019-07-22",
    photograph: "/images/bob.jpg",
  },
];

export default function AdminPage() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <EmployeeTable employees={employees} />
    </div>
  );
}