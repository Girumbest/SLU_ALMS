import EmployeeRegisterForm from '@/features/hr-admin/components/forms/EmployeeForm';
import { getDepartments } from '@/lib/db-ops';

// import EmployeeRegisterForm from "@/components/EmployeeRegisterForm";

export default async function RegisterPage() {
  const departments = await getDepartments()
  const departmentsFormatted = departments.map((dep) => ({
    id: dep.id.toString(),
    name: dep.name
  }))
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <EmployeeRegisterForm departments={departmentsFormatted}/>
    </div>
  );
}
