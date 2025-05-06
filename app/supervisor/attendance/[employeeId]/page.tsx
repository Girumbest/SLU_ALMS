import AttendanceDetailTable from "@/components/AttendanceDetailTable";
import { getEmployeeById } from "@/features/hr-admin/actions";
import { authOptions } from "@/lib/auth";
import { getDepartments } from "@/lib/db-ops";
import { getServerSession } from "next-auth";
// import { getDepartments } from "@/features/hr-admin/actions";

const AttendanceDetailPage = async ({params}: {params:{employeeId:string}}) => {
  const employeeId = (await params).employeeId;
  const departments = await getDepartments();
  const employee = await getEmployeeById(Number(employeeId))
  const session = await getServerSession(authOptions)
  return session?.user?.role === "Supervisor" && session?.user?.department === employee?.department?.id.toString() ?(
    <div className="p-4">
      <AttendanceDetailTable empId={employeeId} departments={departments} />
    </div>
  ):(
    <div>
      <div className="p-4 text-center text-danger flex-col justify-center items-center h-screen">
        Unauthorized
      </div>
    </div>
  );
};

export default AttendanceDetailPage;
