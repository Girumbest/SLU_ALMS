import LeaveRequestDetailTable from "@/components/LeaveRequestDetail";
import { getDepartments } from "@/lib/db-ops";
// import { getDepartments } from "@/features/hr-admin/actions";

const LeaveRequestDetailPage = async ({params}: {params:{empId:string}}) => {
  const employeeId = (await params).empId;
  const departments = await getDepartments();
  return (
    <div className="p-4">
      <LeaveRequestDetailTable empId={employeeId} departments={departments} />
    </div>
  );
};

export default LeaveRequestDetailPage;
