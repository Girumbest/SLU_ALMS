import EmployeeInfoCard from "@/components/EmployeeInfoCard";
import { getEmployeeByUsername } from "@/lib/db-ops";


export default async function EmployeePage({params}: {params:{employeeId:string}}) {
  const employee = await getEmployeeByUsername(params.employeeId)
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <EmployeeInfoCard employee={employee} />
    </div>
  );
}
