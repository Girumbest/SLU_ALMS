import AttendanceDetailTable from "@/components/AttendanceDetailTable";
import { getDepartments } from "@/lib/db-ops";
// import { getDepartments } from "@/features/hr-admin/actions";

const AttendanceDetailPage = async ({params}: {params:{employeeId:string}}) => {
  const employeeId = (await params).employeeId;
  const departments = await getDepartments();
  return (
    <div className="p-4">
      <AttendanceDetailTable empId={employeeId} departments={departments} />
    </div>
  );
};

export default AttendanceDetailPage;
