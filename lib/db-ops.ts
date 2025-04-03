import { prisma } from "./db";

export async function getEmployeeByUsername(username:string){
  const employees = await prisma.user.findUnique({
    where:{
      username
    },
    include: {
      department:{
        select:{
          name: true,
          id: true
        }
      }
    }
  })
  return employees
}



export async function getEmployees(employeesPerPage=2, page=1) {
  const employees = await prisma.user.findMany({
    skip: (page - 1) * employeesPerPage,
    take: employeesPerPage,
    //_count
    select:{
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      phoneNumber: true,
      jobTitle: true,
      role: true,
      salary: true,
      hireDate: true,
      photograph: true,
      department:{
        select:{
           name: true
        }
      }
    },
    
    
  })
  const total = await prisma.user.count();
  (employees as any).total = total;
  
return employees
}

export async function getDepartment(id: number) {
  const departments = await prisma.department.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select:{
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          phoneNumber: true,
          jobTitle: true,
          role: true,
          salary: true,
          hireDate: true,
          photograph: true,
      }
    }}
  });

  return departments;
}

export async function getDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        where: {
          role: 'Supervisor', // Filter users to only include supervisors
        },
        select: {
          id: true,
          firstName: true,
          role: true,
          // Include other fields you need from the supervisor
        },
        take: 1, // Limit to one supervisor (if there can be only one)
      },
      _count: {
        select: {
          users: true, // Count all users in the department
        },
      },
    },
  });

  return departments;
}
