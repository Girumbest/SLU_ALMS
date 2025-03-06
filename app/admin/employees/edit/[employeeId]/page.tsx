import {EmployeeEditForm} from "@/features/hr-admin/components/forms/EmployeeEditForm";
import { getDepartments, getEmployeeByUsername } from "@/lib/db-ops";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  gender: "Male" | "Female";
  maritalStatus?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address: string | null;
  hireDate: Date | null;
  jobTitle: string | null;
  positionLevel: string | null;
  salary: number | null;
  department: { name: string, id: string};
  role: string;
  educationalLevel?: string | null;
  directDepositInfo?: string | null;
  cv?: string | null;
  photograph: string;
}

export default async function EmployeeEditPage({params}: {params:{employeeId:string}}) {
  const username = (await params).employeeId;
  const departments = await getDepartments();
  const departmentsFormatted = departments.map((dep) => ({
    id: dep.id.toString(),
    name: dep.name
  }))
  const employee: Employee | null = await getEmployeeByUsername(username) as Employee | null;
  if (!employee) return <div>Employee not found</div>;
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <EmployeeEditForm employee={employee} departments={departmentsFormatted}/>
    </div>
  );
}
