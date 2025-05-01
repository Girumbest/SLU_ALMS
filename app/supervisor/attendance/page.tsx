import AttendanceTable from "@/components/AttendanceTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Breadcrumb from "@/components/Breadcrumb";
import { getDepartments } from "@/lib/db-ops";
// import { getDepartments } from "@/features/hr-admin/actions";

const AttendancePage = async () => {
  //   const departments = await getDepartments();
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  const userId = role === "Supervisor" ? Number(session?.user?.id) : undefined;
  return userId ? (
    <div className="p-4">
      <AttendanceTable supId={userId} />
    </div>
  ) : (
    <div>
      <div className="p-4 text-center text-danger flex-col justify-center items-center h-screen">
        Unauthorized
      </div>
    </div>
  );
};

export default AttendancePage;
