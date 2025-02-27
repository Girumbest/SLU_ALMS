import { prisma } from "./db";

export async function getEmployeeByUsername(username:string){
  const employees = await prisma.user.findUnique({
    where:{
      username
    },
    include: {
      department:{
        select:{
          name: true
        }
      }
    }
  })
  return employees
}
export async function getEmployees(){
  const employees = await prisma.user.findMany({
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
return employees
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
