import LeaveRequestTable from "@/components/LeaveRequestTable";
import { getDepartments, getEmployees } from "@/lib/db-ops";

export default async function AdminPage() {
const employees = await getEmployees()
const res = await getDepartments();
const departments = res.map((department) => {
  return {
    id: department.id,
    name: department.name,
  }
})

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* <EmployeeTable employees={employees} /> */}
      <LeaveRequestTable departments={departments}  />
    </div>
  );
}