import LeaveRequestTable from "@/components/LeaveRequestTable";
import { authOptions } from "@/lib/auth";
import { getDepartments, getEmployees } from "@/lib/db-ops";
import { getServerSession } from "next-auth";

export default async function AdminPage() {
// const employees = await getEmployees()
const res = await getDepartments();
const departments = res.map((department) => {
  return {
    id: department.id,
    name: department.name,
  }
})
const session = await getServerSession(authOptions)

  return session?.user?.role === "Supervisor" ? (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* <EmployeeTable employees={employees} /> */}
      <LeaveRequestTable departments={departments}  />
    </div>
  ):(
    <div>
      <div className="p-4 text-center text-danger flex-col justify-center items-center h-screen">
        Unauthorized
      </div>
    </div>
  );
}