import LeaveRequestDetailTable from "@/components/LeaveRequestDetail";
import { authOptions } from "@/lib/auth";
import { getDepartments } from "@/lib/db-ops";
import { getServerSession } from "next-auth";
// import { getDepartments } from "@/features/hr-admin/actions";

const LeaveRequestDetailPage = async () => {
  const session = await getServerSession(authOptions);
  const employeeId = session?.user?.id
  const departments = await getDepartments();
  return (
    <div className="p-4">
      <LeaveRequestDetailTable empId={employeeId} departments={departments} />
    </div>
  );
};

export default LeaveRequestDetailPage;
