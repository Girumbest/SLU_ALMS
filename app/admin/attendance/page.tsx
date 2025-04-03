import AttendanceTable from "@/components/AttendanceTable";
import Breadcrumb from "@/components/Breadcrumb";
import { getDepartments } from "@/lib/db-ops";
// import { getDepartments } from "@/features/hr-admin/actions";

const AttendancePage = async () => {
  const departments = await getDepartments();
  return (
    <div className="p-4">
      <AttendanceTable departments={departments} />
    </div>
  );
};

export default AttendancePage;
