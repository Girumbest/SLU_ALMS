import EmployeeInfoCard from "@/components/EmployeeInfoCard";
import { authOptions } from "@/lib/auth";
import { getEmployeeByUsername } from "@/lib/db-ops";
import { getServerSession } from "next-auth";


export default async function EmployeePage({params}: {params:{employeeId:string}}) {
  const employee = await getEmployeeByUsername(params.employeeId)
  const session = await getServerSession(authOptions)

  return session?.user?.department === employee?.department?.id.toString() ? (
    <div className="p-8 bg-gray-100 min-h-screen">
      <EmployeeInfoCard employee={employee} />
    </div>
  ):(
    <div>
      <div className="p-4 text-center text-danger flex-col justify-center items-center h-screen">
        Unauthorized
      </div>
    </div>
  );
}
