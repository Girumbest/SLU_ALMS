import EmployeeInfoCard from "@/components/EmployeeInfoCard";

const employeeData = {
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  phoneNumber: "+1234567890",
  dateOfBirth: "1990-05-15",
  gender: "Male",
  maritalStatus: "Married",
  emergencyContactName: "Jane Doe",
  emergencyContactPhone: "+9876543210",
  address: "1234 Main St, Springfield, USA",
  hireDate: "2022-06-01",
  jobTitle: "Software Engineer",
  positionLevel: "Senior",
  salary: 80000,
  department: "Engineering",
  role: "Backend Developer",
  educationalLevel: "Bachelor's Degree",
  certificates: ["/certificates/cert1.pdf", "/certificates/cert2.pdf"],
  photograph: "/images/johndoe.jpg",
};

export default function EmployeePage() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <EmployeeInfoCard employee={employeeData} />
    </div>
  );
}
