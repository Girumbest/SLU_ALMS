"use server";

import { promises as fs } from "fs";
import path from "path";

import { prisma } from "@/lib/db";
import { departmentSchema, employeeEditSchema, employeeSchema } from "./schema";
import { UserFormState, Event, Setting } from "./types";
import { writeFile } from "fs/promises";
import { generateUniqueFileName } from "@/utils/generate";
import { revalidatePath } from "next/cache";
import { RecurringType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import * as faceapi from 'face-api.js';

import { loadFaceAPIModels } from '@/lib/face-api-init'; // Runs once on server start
interface DashboardSummary {
  totalEmployees: number;
  totalDepartments: number;
  pendingLeaveRequests: number;
  approvedLeaveRequests: number;
  rejectedLeaveRequests: number;
  totalLeaveTypes: number;
}
async function session() {
  //Logged-in User session
  return await getServerSession(authOptions);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const totalEmployees = await prisma.user.count(); /* query to get total employees */;
    const totalDepartments = await prisma.department.count(); /* query to get total departments */;
    const pendingLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "PENDING",
      },
    })
    //await /* query for pending leave requests */;
    const approvedLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
      },
    })
    //await
     /* query for approved leave requests */;
    const rejectedLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "REJECTED",
      },
    })
    //await
     /* query for rejected leave requests */;
      /* query for rejected leave requests */;
    const totalLeaveTypes = await prisma.leaveType.count()
    /* query to get total leave types */;

    return {
      totalEmployees,
      totalDepartments,
      pendingLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,
      totalLeaveTypes,
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
}
export async function getDepartmentDashboardSummary(): Promise<DashboardSummary> {
  try {
    const user = (await session())?.user
    const departmentId = Number(user?.department)
    const totalEmployees = await prisma.user.count({
      where: { departmentId }
    }); /* query to get total employees */;
    const totalDepartments = await prisma.department.count(); /* query to get total departments */;
    const pendingLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "PENDING",
        user: {
          departmentId
        }
      },
    })
    //await /* query for pending leave requests */;
    const approvedLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        user: {
          departmentId
        }
      },
    })
    //await
     /* query for approved leave requests */;
    const rejectedLeaveRequests = await prisma.leaveRequest.count({
      where: {
        status: "REJECTED",
        user: {
          departmentId
        }
      },
    })
    //await
     /* query for rejected leave requests */;
      /* query for rejected leave requests */;
    const totalLeaveTypes = await prisma.leaveType.count()
    /* query to get total leave types */;

    return {
      totalEmployees,
      totalDepartments,
      pendingLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,
      totalLeaveTypes,
    };
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw new Error("Failed to fetch dashboard summary");
  }
}

// export async function createUser(
//   prevState: UserFormState,
//   formData: FormData
// ): Promise<UserFormState> {
//   const rawData = Object.fromEntries(formData.entries());
//   const validatedData = employeeSchema.safeParse(rawData);

//   if (!validatedData.success) {
//     return {
//       errorMsg: "Validation failed",
//       errors: validatedData.error.flatten().fieldErrors,
//     };
//   }
//   let data = validatedData.data;
//   // console.log(data);
  
//   //Check for existence of a user with the same username
//   const existingUser = await prisma.user.findUnique({
//     where: {
//       username: data.username,
//     },
//     select: {
//       firstName: true,
//       lastName: true,
//     },
//   });

//   if (!!existingUser)
//     return {
//       errorMsg: `User ${existingUser.firstName} ${existingUser.lastName} has Username: ${data.username}`,
//     };

//   //There should be only one supervisor per department
//   if(data.role === "Supervisor"){
//     const supervisor = await prisma.user.findFirst({
//       where: {
//         departmentId: data.department,
//         role: "Supervisor",
//       },
//       select: {
//         id: true,
//       },
//     })
//     if(supervisor) return {errorMsg: "Department already has a supervisor."}
//   }

//   // Save to database
//   await prisma.user.create({
//     data: {
//       firstName: data.firstName,
//       lastName: data.lastName,
//       username: data.username,
//       password: data.password,
//       address: data.address,
//       dateOfBirth: new Date(data.dateOfBirth),
//       gender: data.gender,
//       phoneNumber: data.phoneNumber,
//       emergencyContactPhone: data.emergencyContactPhone,
//       hireDate: new Date(data.hireDate),
//       jobTitle: data.jobTitle,
//       salary: data.salary,
//       positionLevel: data.positionLevel,
//       educationalLevel: data.educationalLevel,
//       directDepositInfo: data.directDepositInfo,
//       maritalStatus: data.maritalStatus,
//       departmentId: data.department,
//       role: data.role,

//       photograph: await savePhoto(data.photograph), //returns photos filename
//       cv: (data.cv || undefined) && (await saveCV(data.cv as File)),
//     },
//   });

//   return { successMsg: "Form submitted successfully!" };
// }

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  // await loadFaceAPIModels(); // Returns instantly if already loaded

  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeSchema.safeParse(rawData);

  if (!validatedData.success) {
    console.log(rawData?.cv)
    return {
      errorMsg: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  
  let data = validatedData.data;
  
  // Check for existence of a user with the same username
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  if (!!existingUser)
    return {
      errorMsg: `User ${existingUser.firstName} ${existingUser.lastName} has Username: ${data.username}`,
    };

  // There should be only one supervisor per department
  if(data.role === "Supervisor"){
    const supervisor = await prisma.user.findFirst({
      where: {
        departmentId: data.department,
        role: "Supervisor",
      },
      select: {
        id: true,
      },
    })
    if(supervisor) return {errorMsg: "Department already has a supervisor."}
  }

  // Save to database
  await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      password: data.password,
      address: data.address,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      phoneNumber: data.phoneNumber,
      emergencyContactPhone: data.emergencyContactPhone,
      hireDate: new Date(data.hireDate),
      jobTitle: data.jobTitle,
      salary: data.salary,
      positionLevel: data.positionLevel,
      educationalLevel: data.educationalLevel,
      directDepositInfo: data.directDepositInfo,
      maritalStatus: data.maritalStatus,
      departmentId: data.department,
      role: data.role,
      faceDescriptor: JSON.parse(data.faceDescriptor) as number[],
      photograph: await savePhoto(data.photograph), //returns photos filename
      cv: (data.cv || undefined) && (await saveCV(data.cv as File)),
    },
  });

  return { successMsg: "User created successfully with facial recognition data!" };
}

export async function editUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeEditSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      errorMsg: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  // Check for existence of a user with the same username
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photograph: true,
      cv: true,
    },
  });

  if (existingUser?.id != data.id)
    return {
      errorMsg: `User ${existingUser?.firstName} ${existingUser?.lastName} has Username: ${data.username}`,
    };

  // There should be only one supervisor per department
  if(data.role === "Supervisor"){
    const supervisor = await prisma.user.findFirst({
      where: {
        departmentId: data.department,
        role: "Supervisor",
      },
      select: {
        id: true,
      },
    })
    if(supervisor?.id && supervisor.id != data.id) return {errorMsg: "Department already has a supervisor."}
  }

  const updateData: any = {};
  let deletOldPhoto = false;
  let deletOldCv = false;

  // Process photograph if provided
  if (data.photograph && data.faceDescriptor) {
    try {
      // Update both the photograph and face descriptor
      updateData.photograph = await savePhoto(data.photograph as File);
      updateData.faceDescriptor = JSON.parse(data.faceDescriptor) as number[];
      deletOldPhoto = true;
    } catch (error) {
      return { errorMsg: "Error saving the new photo. Please try again." };
    }
  }

  // Handle other fields
  for (let [field, value] of Object.entries(data)) {
    if (field == "id" || field == "photograph" || field == "faceDescriptor") continue;

    if (field == "dateOfBirth") {
      updateData.dateOfBirth = new Date(value as string);
      continue;
    }
    if (field == "hireDate") {
      updateData.hireDate = new Date(value as string);
      continue;
    }
    if (field == "department") {
      updateData.departmentId = value;
      continue;
    }
    if (field == "cv") {
      value && (updateData.cv = await saveCV(value as File));
      deletOldCv = true;
      continue;
    }

    updateData[field] = value;
  }

  // Save to database
  await prisma.user.update({
    where: {
      id: data.id,
    },
    data: updateData,
  });
  if(deletOldPhoto){
    try {
      deleteFileIfExists("photos", existingUser?.photograph!);
      // console.log(wasDeleted ? "File was deleted" : "File didn't exist");
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
  }
  if(deletOldCv){
    try {
      existingUser?.cv && deleteFileIfExists("cv", existingUser?.cv!);
      // console.log(wasDeleted ? "File was deleted" : "File didn't exist");
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
  }
  return { 
    successMsg: data.photograph 
      ? "User updated successfully with new facial recognition data!" 
      : "User updated successfully!" 
  };
}

// export async function editUser(
//   prevState: UserFormState,
//   formData: FormData
// ): Promise<UserFormState> {
//   const rawData = Object.fromEntries(formData.entries());
//   const validatedData = employeeEditSchema.safeParse(rawData);

//   if (!validatedData.success) {
//     return {
//       errorMsg: "Validation failed",
//       errors: validatedData.error.flatten().fieldErrors,
//     };
//   }
//   let data = validatedData.data;

//   //Check for existence of a user with the same username
//   const existingUser = await prisma.user.findUnique({
//     where: {
//       username: data.username,
//     },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//     },
//   });

//   if (existingUser?.id != data.id)
//     return {
//       errorMsg: `User ${existingUser?.firstName} ${existingUser?.lastName} has Username: ${data.username}`,
//     };

//   //There should be only one supervisor per department
//   if(data.role === "Supervisor"){
//     const supervisor = await prisma.user.findFirst({
//       where: {
//         departmentId: data.department,
//         role: "Supervisor",
//       },
//       select: {
//         id: true,
//       },
//     })
//     if(supervisor?.id && supervisor.id != data.id) return {errorMsg: "Department already has a supervisor."}
//   }

//   const updateData: any = {};
//   //If the photo or cv have not been edited skip(photo or file update)
//   for (let [field, value] of Object.entries(data)) {
//     if (field == "id") continue;

//     if (field == "dateOfBirth") {
//       updateData.dateOfBirth = new Date(value as string);
//       continue;
//     }
//     if (field == "hireDate") {
//       updateData.hireDate = new Date(value as string);
//       continue;
//     }
//     if (field == "department") {
//       updateData.departmentId = value;
//       continue;
//     }

//     if (field == "photograph") {
//       value && (updateData.photograph = await savePhoto(value as File));
//       continue;
//     }
//     if (field == "cv") {
//       value && (updateData.cv = await saveCV(value as File));
//       continue;
//     }

//     updateData[field] = value;
//   }
//   // console.log("UPDATE DATA: ", updateData);
//   // return {successMsg: "RECEIVED AT TEST POINT"}
//   // Save to database
//   await prisma.user.update({
//     where: {
//       id: data.id,
//     },
//     data: updateData,
//   });
//   return { successMsg: "User updated successfully!" };
// }

export async function createDepartment(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = departmentSchema.safeParse(rawData);
  console.log(rawData);
  if (!validatedData.success) {
    return {
      errorMsg: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  const existingDepartment = await prisma.department.findUnique({
    where: { name: data.name },
  });

  if (existingDepartment) {
    return { errorMsg: "A department with the same name already exists." };
  }

  await prisma.department.create({
    data: {
      name: data.name,
      nameAmharic: data.nameAmharic || undefined,
      description: data.description || undefined,
      // supervisor: data.supervisor
    },
  });
  revalidatePath("/admin/departments");
  return { successMsg: "Department created successfully!" };
}

export async function updateDepartment(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = departmentSchema.safeParse(rawData);
  console.log(rawData);
  if (!validatedData.success) {
    return {
      errorMsg: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  const existingDepartment = await prisma.department.findUnique({
    where: { name: data.name },
  });

  if (existingDepartment) {
    return { errorMsg: "A department with the same name already exists." };
  }

  await prisma.department.update({
    where: {
      id: data.id,
    },
    data: {
      name: data.name,
      nameAmharic: data.nameAmharic,
      description: data.description,
      // supervisor: data.supervisor
    },
  });
  revalidatePath("/admin/departments");
  // revalidatePath(`/admin/departments/${data.id}`)
  return { successMsg: "Department created successfully!" };
}

export async function deleteDepartment(departmentId: number) {
  const depEmployees = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    select: {
      _count: {
        select: { users: true },
      },
    },
  });
  if (depEmployees && depEmployees._count.users > 0) {
    return { errorMsg: "Department has employees." };
  }

  await prisma.department.delete({
    where: {
      id: departmentId,
    },
  });
  revalidatePath("/admin/departments");
  return { successMsg: "Department deleted successfully!" };
}

export async function getEmployees(
  query = "",
  searchBy: string,
  employeesPerPage = 10,
  page = 1
) {
  if (query == "") {
    const employees = await prisma.user.findMany({
      skip: (page - 1) * employeesPerPage,
      take: employeesPerPage,
      
      orderBy: {
        createdAt: "desc",
      },
      select: {
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
        department: {
          select: {
            name: true,
          },
        },
      },
    });
    const total = await prisma.user.count();
    (employees as any).total = total;

    return { employees, total };
  }

  const filter = () => {
    if (searchBy == "phone") return "phoneNumber";
    if (searchBy == "jobtitle") return "jobTitle";

    return searchBy;
  };

  const filterValue = filter();

  const whereClause: any = (() => {
    switch (filterValue) {
      case "name":
        return {
          OR: [
            { firstName: { contains: query, mode: "insensitive" as any } },
            { lastName: { contains: query, mode: "insensitive" as any } },
          ],
        };
      case "department":
        return {
          department: {
            name: { contains: query, mode: "insensitive" as any },
          },
        };
      case "role":
        return {
          role: query[0].toUpperCase() + query.slice(1),
        };
      case "hireDate":
        return {
          hireDate: {
            gte: new Date(query.split(":")[0]),
            lte:
              (query.split(":")[1] && new Date(query.split(":")[1])) ||
              new Date(),
          },
        };
      default:
        return {
          [filterValue]: { contains: query, mode: "insensitive" as any },
        };
    }
  })();

  const employees = await prisma.user.findMany({
    skip: (page - 1) * employeesPerPage,
    take: employeesPerPage,
    where: whereClause,
    select: {
      ...{
        department: {
          select: {
            name: true,
          },
        },
      },
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
    },
  });
  const total = await prisma.user.count({ where: whereClause });
  (employees as any).total = total;

  return { employees, total };
}

export async function getEmployeeById(id:number){
  try{
  const employees = await prisma.user.findUnique({
    where:{
      id
    },
    select:{
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      phoneNumber: true,
      jobTitle: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      role: true,
      salary: true,
      hireDate: true,
      photograph: true,
    },
    
  })
  return employees
}catch(error){
  console.log(error)

}
}

export async function getDepartmentEmployees(
  departmentId: number,
  query = "",
  searchBy: string,
  employeesPerPage = 10,
  page = 1
) {
  console.log(departmentId, "Query: ", query, searchBy);
  if (query == "") {
    const departmentEmployees = await prisma.department.findUnique({
      where: {
        id: departmentId,
      },
      select: {
        users: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
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
          },
        },
        _count: {
          select: {
            users: true, // Count all users in the department
          },
          //
        },
      },
    });
    return {
      employees: departmentEmployees?.users,
      total: departmentEmployees?._count.users,
    };
  }

  const filter = () => {
    if (searchBy == "phone") return "phoneNumber";
    if (searchBy == "jobtitle") return "jobTitle";

    return searchBy;
  };

  const filterValue = filter();

  const whereClause: any = (() => {
    switch (filterValue) {
      case "name":
        return {
          OR: [
            { firstName: { contains: query, mode: "insensitive" as any } },
            { lastName: { contains: query, mode: "insensitive" as any } },
          ],
        };
      case "department":
        return {
          department: {
            name: { contains: query, mode: "insensitive" as any },
          },
        };
      case "role":
        return {
          role: query[0].toUpperCase() + query.slice(1),
        };
      case "hireDate":
        return {
          hireDate: {
            gte: new Date(query.split(":")[0]),
            lte:
              (query.split(":")[1] && new Date(query.split(":")[1])) ||
              new Date(),
          },
        };
      default:
        return {
          [filterValue]: { contains: query, mode: "insensitive" as any },
        };
    }
  })();

  const departmentEmployees = await prisma.department.findUnique({
    where: {
      id: departmentId,
    },
    select: {
      users: {
        skip: (page - 1) * employeesPerPage,
        take: employeesPerPage,
        where: whereClause,
        select: {
          ...{
            department: {
              select: {
                name: true,
              },
            },
          },
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
        },
      },
      _count: {
        select: {
          users: true, // Count all users in the department
        },
        //
      },
    },
  });
  return {
    employees: departmentEmployees?.users,
    total: departmentEmployees?._count.users,
  };
}


//Get all employees attendance of selected date
export async function getEmployeesAttendance(
  query = "",
  searchBy: string,
  employeesPerPage?: number,
  page = 1,
  date = new Date(),
  supId?: number
) {
  console.log("DATE IN GET ATTENDANCE: ", date)
  if(!(await isWorkingDay(date))){
    console.log("NOT A WORKING DAY")
    return {errorMsg: "Not a working day", isWorkingDay: false}
  }
  
  const supervisor = supId && await prisma.user.findUnique({
      where: {
        id: supId,
      },
      select: {
        department: {
          select: {
            id: true,
          },
        },
      },
  })
  supervisor && console.log("SUPER",supervisor.department?.id)

  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["check_out_enabled", "attendance_time"],
      },
    },
    select: {
      key: true,
      value: true,
      type: true,
    },
  });

  //--------------------------------------
    const parts = new Date(date); // Parses as local
    const selectedDateAsUTC = new Date(Date.UTC(parts.getFullYear(), parts.getMonth(), parts.getDate()));
    date = selectedDateAsUTC
    console.log("normalized date: ",date)
    // console.log("compare: ",new Date("2025-05-23T10:40:06.911Z") < date)
  //--------------------------------------
  const employees = await prisma.user.findMany({
    skip: employeesPerPage ? (page - 1) * employeesPerPage : undefined,
    take: employeesPerPage || undefined,
    where: {
      departmentId: supervisor ? supervisor?.department?.id : undefined,
      
      createdAt: {
        lte: (await formatDate(date)).endOfDay,
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      photograph: true,
      department: {
        select: {
          name: true,
        },
      },
      attendances: {
        where: {
          date: {
            lte: (await formatDate(date)).endOfDay,
            gte: (await formatDate(date)).startOfDay,
          },
        },
        
        select: {
          id: true,
          morningCheckInTime: true,
          morningCheckOutTime: true,
          afternoonCheckInTime: true,
          afternoonCheckOutTime: true,

          isLateMorningCheckIn: true,
          isLateAfternoonCheckIn: true,
          isEarlyMorningCheckOut: true,
          isEarlyAfternoonCheckOut: true,
          checkOutEnabled: true,
          status: true,
          date: true,
        },
      },
  //check if employee is on-leave
      leaveRequests:{
        where: {
          status: "APPROVED",
          startDate: {
            lte: date,
          },
          endDate: {
            gte: date
          }
        },
        select:{
          startDate: true,
          endDate: true,
        }
      }
    },
  });
  const total = await prisma.user.count();
  (employees as any).total = total;
  // console.log(employees)
  // console.log(employees[0].username, employees[0].attendances);
  return { employees, total, settings };
}

//get all the attendances of an employee(by emp id)
export async function getAllAttendance(
  empId: number,

  query = "",
  searchBy: string,
  attendancesPerPage = 10,
  page = 1
) {
  const filterValue = searchBy;

  const getWhereClause = async (filterValue: string, query: string) => {
    if (!filterValue || !query) {
      return {}; // Return an empty object if no filter is needed
    }

    switch (filterValue) {
      case "morningCheckInTime":
      case "morningCheckOutTime":
      case "afternoonCheckInTime":
      case "afternoonCheckOutTime":
        return {};
      case "date":
        return {
          date: {
            gte: new Date(query.split(":")[0]),
            lte:
              (query.split(":")[1] && new Date(query.split(":")[1])) ||
              new Date(),
          },
        };
      case "status":
        return {
          status: query.toUpperCase(),
        };
      default:
        return {
          [filterValue]: { contains: query, mode: "insensitive" as any },
        };
    }
  };

  const whereClause = await getWhereClause(filterValue, query);
  //not sure if leave requests of an employee is needed here
  const leaveWhereClause = ((filterValue: string, query: string) => {
    if(filterValue === "date"){
      if(!query)return
      return {
        startDate: {
          lte: new Date(query.split(":")[0]),
        },
        endDate: {
          gte: new Date(query.split(":")[0]),
          lte:
          (query.split(":")[1] && new Date(query.split(":")[1])) ||
          new Date(),
        }
      };
    }
  })(filterValue, query)

  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["check_out_enabled", "attendance_time"],
      },
    },
    select: {
      key: true,
      value: true,
      type: true,
    },
  });

  const employee = await prisma.user.findUnique({
    where: {
      id: empId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      photograph: true,
      department: {
        select: {
          name: true,
        },
      },
      attendances: {

        skip: (page - 1) * attendancesPerPage,
        take: attendancesPerPage,
        where: whereClause,
        select: {
          id: true,
          morningCheckInTime: true,
          morningCheckOutTime: true,
          afternoonCheckInTime: true,
          afternoonCheckOutTime: true,

          isLateMorningCheckIn: true,
          isLateAfternoonCheckIn: true,
          isEarlyMorningCheckOut: true,
          isEarlyAfternoonCheckOut: true,
          checkOutEnabled: true,
          status: true,
          date: true,
        },
      },
      leaveRequests:{
        where: {
          status: "APPROVED",
          ...leaveWhereClause
        },
        select:{
          startDate: true,
          endDate: true,
        }
      }
    },
  });
  console.log("EMPLOYEE WITH LEAVE: ",employee);
  const total = await prisma.attendance.count({ where: { userId: empId } });
  (employee as any).total = total;

  //filter and return attendances by time
  function filterEmployeeAttendancesByTime(
    employee: any,
    query: string,
    filterKey: string
  ) {
    // Check if the query is in "HH" or "HH:MM" format
    const isHourOnly = !query.includes(":");

    // Parse the query
    const [queryHours, queryMinutes = "00"] = query.split(":");
    const queryHour = parseInt(queryHours);

    // Filter the attendances
    const filteredAttendances = employee.attendances.filter((attendance) => {
      const checkTime = attendance[filterKey];
      if (!checkTime) return false; // Skip if no time is recorded

      const checkDate = new Date(checkTime);
      const checkHour = checkDate.getHours();

      // If query is "HH" (hour-only), match only the hour
      if (isHourOnly) {
        return checkHour === queryHour;
      }
      // If query is "HH:MM", match both hour and minute
      else {
        const checkMinutes = checkDate.getMinutes();
        return (
          checkHour === queryHour && checkMinutes === parseInt(queryMinutes)
        );
      }
    });

    // Return a new employee object with filtered attendances
    return {
      ...employee,
      attendances: filteredAttendances,
      total: filteredAttendances.length,
    };
  }

  if (filterValue && query) {
    switch (filterValue) {
      case "morningCheckInTime":
      case "morningCheckOutTime":
      case "afternoonCheckInTime":
      case "afternoonCheckOutTime":
        const filteredEmployee = filterEmployeeAttendancesByTime(
          employee,
          query,
          filterValue
        );

        return {
          employee: filteredEmployee,
          total: filteredEmployee.attendances.length,
          settings,
        };
    }
  }

  return { employee, total, settings };
}


//------------LEAVES-------------------------------
export async function getLeaveRequests(empId?: number, depId?: number) {
  const leaveRequests = await prisma.leaveRequest.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    where: empId
      ? {
          userId: empId,
        }
      : depId ? {user: { departmentId: depId } } : undefined,
    select: {
      id: true,
      startDate: true,
      endDate: true,
      reason: true,
      days: true,
      status: true,
      createdAt: true,
      leaveType: {
        select: {
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          photograph: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
  const leaveTypes = await prisma.leaveType.findMany({
    select: {
      id: true,
      name: true,
    },
  });
  return { leaveRequests, leaveTypes };
}

export async function getLeaveTypes() {
  const leaveTypes = await prisma.leaveType.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      maxDays: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return { leaveTypes };
}
export async function addLeaveType(data:{
  name: string,
  description: string,
  maxDays: number,
  accrued?: boolean,
}){
  try{
    console.log("NEW TYPE: ", data)
    await prisma.leaveType.create({
      data: data,
    });
    
  }catch(error){
    console.error("Error creating leave type:", error);
    return {
      errorMsg: "Failed to create leave type.",
    };
  }
  revalidatePath("/admin/leave/leave-types");
  return { successMsg: "Leave type created successfully!" };
}
export async function editLeaveType(data:{
  id: number,
  name: string,
  description: string,
  maxDays: number,
  // accrued: boolean,
}){
  console.log("UPDATE TYPE DATA: ",data)
  try{
    const leaveType = await prisma.leaveType.findUnique({
      where: {
        id: data.id,
      },
    });
    if(!leaveType) return {errorMsg: "Leave type not found."}
    if(leaveType.name === "Annual Leave"){
      return {errorMsg: "Annual Leave cannot be edited."}
    }
    if(leaveType.name === "Maternity Leave" && data.name !== "Maternity Leave"){
      return {errorMsg: "Maternity Leave type name cannot be edited."}
    }
    if(leaveType.name === "Paternity Leave" && data.name !== "Paternity Leave"){
      return {errorMsg: "Paternity Leave type name cannot be edited."}
    }

    await prisma.leaveType.update({
      where: {
        id: data.id,
      },
      data: data,
    });
    revalidatePath("/admin/leave/leave-types");
    return {successMsg: "Leave type updated successfully!"}
  }catch(error){
    console.error("Error updating leave type:", error);
    return {
      errorMsg: "Failed to update leave type.",
    };
  }
}

export async function getLeaveBalance(empId: number, leaveTypeId: number) {

  const leaveType = await prisma.leaveType.findUnique({
    where: {
      id: Number(leaveTypeId),
    },
    select: {
      maxDays: true,
      name: true
    },
  });

  if(!leaveType) return {errorMsg: "Leave type not found."}

  if(leaveType.name === "Annual Leave"){
    const calculatedAnnualLeaveDays = await calculateSluAnnualLeaveBalance(Number(empId))
    if(calculatedAnnualLeaveDays < 0) return {leaveBalance: {balance: 0}}
    return {leaveBalance: {balance: calculatedAnnualLeaveDays}}
  }

  if(leaveType?.name === "Maternity Leave"){
    const lastApprovedMatternityLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId: Number(empId),
        leaveTypeId: Number(leaveTypeId),
        status: "APPROVED"
      },
      orderBy: {
        id: "desc"
      },
      select: {
        updatedAt: true
      }
    })
    if(lastApprovedMatternityLeave && (new Date().getFullYear() - new Date(lastApprovedMatternityLeave.updatedAt as Date).getFullYear()) < 1){
      return {leaveBalance: {balance: 0}}
    }else{
      return{leaveBalance: {balance: leaveType.maxDays}}
    }
  }

  if(leaveType?.name === "Paternity Leave"){
    const lastApprovedPaternityLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId: Number(empId),
        leaveTypeId: Number(leaveTypeId),
        status: "APPROVED"
      },
      orderBy: {
        id: "desc"
      },
      select: {
        updatedAt: true
      }
    })
    if(lastApprovedPaternityLeave && (new Date().getFullYear() - new Date(lastApprovedPaternityLeave.updatedAt as Date).getFullYear()) < 1){
      return {leaveBalance: {balance: 0}}
    }else{
      return{leaveBalance: {balance: leaveType.maxDays}}
    }
  }

  //--------------------
  const leaveBalance = await prisma.leaveBalance.findFirst({
    where: {
      userId: empId,
      leaveTypeId: leaveTypeId,
    },
    select: {
      id: true,
      balance: true,
    },
  });
  return { leaveBalance };
}


export async function createLeaveRequest(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    const leaveTypeId = formData.get("leaveTypeId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;
    const empId = formData.get("empId") as string;

    const user = (await session())?.user;

    if(user?.role !== "Employee" && empId != user?.id){
      return {
        errorMsg: "Validation failed.",
      };
    }
    if((await isOnLeave(Number(user?.id)))){
      return {
        errorMsg: "You can't request another leave while you'r on a leave!",
      };
    }
    //Check for pending request
    const hasLeaveRequest = await prisma.leaveRequest.findFirst({
      where: {
        userId: Number(user?.id),
        status: "PENDING"
      }
    })
    if(hasLeaveRequest){
      return {
        errorMsg: "You already have a pending leave request.",
      };
    }

    // Validate the data (add more validation as needed)
    if (!empId || !leaveTypeId || !startDate || !endDate || !reason) {
      return {
        errorMsg: "Please fill in all fields.",
      };
    }

    //startDate and endDate
    const start = new Date(startDate)
    const end = new Date(endDate)

    const leaveDays = await calculateLeaveDays(start, end);
    //-----------------------------------

    const days = leaveDays//new Date(endDate).getDate() - new Date(startDate).getDate();
  
    if (days < 1) return { errorMsg: "End date must be after start date." };
    let leaveBalance = (
      await getLeaveBalance(Number(empId), Number(leaveTypeId))
    ).leaveBalance;

    const leaveType = await prisma.leaveType.findUnique({
      where: {
        id: Number(leaveTypeId),
      },
      select: {
        maxDays: true,
        name: true
      },
    });

    if(!leaveType) return {errorMsg: "Leave type not found."}
    //====================Annual Leave================================
    if(leaveType.name === "Annual Leave"){
      const calculatedAnnualLeaveDays = leaveBalance?.balance

      if(!calculatedAnnualLeaveDays) return {errorMsg: "You aren't elligible for Annual Leave"}
      if(calculatedAnnualLeaveDays <= 0) return {errorMsg: "You aren't elligible for Annual Leave"}
      if(days > calculatedAnnualLeaveDays) return {errorMsg: "Insufficient leave balance"}
      const newAnnualLeaveBalance = calculatedAnnualLeaveDays - days

      const existingLeaveBalance = await prisma.leaveBalance.findUnique({
        where: {
          userId_leaveTypeId:{
            userId: Number(empId),
            leaveTypeId: Number(leaveTypeId),
          }
        }
      })
      await prisma.leaveRequest.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days,
          reason: reason,
          status: "PENDING",
        },
      });
      //update balance
      if(!existingLeaveBalance){
        await prisma.leaveBalance.create({
          data: {
            userId: Number(empId),
            leaveTypeId: Number(leaveTypeId),
            balance: newAnnualLeaveBalance,
          },
        });
      }else{
        await prisma.leaveBalance.update({
          where: {
            id: existingLeaveBalance.id,
          },
          data: {
            balance: newAnnualLeaveBalance,
          },
        });
      }

      return {
        successMsg: "Leave request submitted successfully!",
      };
    }
    //==================================================================
    //==========================Maternity Leave=========================
    if(leaveType?.name === "Maternity Leave"){
      const femaleUser = await prisma.user.findUnique({where:{id: Number(user.id)}, select:{gender:true}})
      if(femaleUser?.gender !== "Female") return {errorMsg: "You are a Man"}

      const lastApprovedMatternityLeave = await prisma.leaveRequest.findFirst({
        where: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          status: "APPROVED"
        },
        orderBy: {
          id: "desc"
        },
        select: {
          updatedAt: true
        }
      })

      // if(leaveType.maxDays !== days){
      //   return {errorMsg: `Maternity leave request days must be ${leaveType.maxDays} days.`}
      // }

      if(lastApprovedMatternityLeave && (new Date().getFullYear() - new Date(lastApprovedMatternityLeave.updatedAt as Date).getFullYear()) < 1){
        return {errorMsg: "Wait atleast a year before requesting another maternity leave"}
      }
      const startingDate = new Date(start)
      const endDate = new Date(startingDate)
      endDate.setDate(startingDate.getDate() + leaveType.maxDays)

      await prisma.leaveRequest.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          startDate: startingDate,
          endDate: endDate,
          reason: reason,
          days: leaveType.maxDays,
          status: "PENDING",
        },
      });
      return {
        successMsg: "Leave request submitted successfully!",
      };
    }
    //==================================================================
    //==========================Paternity Leave=========================
    if(leaveType?.name === "Paternity Leave"){
      const maleUser = await prisma.user.findUnique({where:{id: Number(user.id)}, select:{gender:true}})
      if(maleUser?.gender !== "Male") return {errorMsg: "You are not a Man"}

      const lastApprovedPaternityLeave = await prisma.leaveRequest.findFirst({
        where: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          status: "APPROVED"
        },
        orderBy: {
          id: "desc"
        },
        select: {
          updatedAt: true
        }
      })

      // if(leaveType.maxDays !== days){
      //   return {errorMsg: `Paternity leave request days must be ${leaveType.maxDays} days.`}
      // }

      if(lastApprovedPaternityLeave && (new Date().getFullYear() - new Date(lastApprovedPaternityLeave.updatedAt as Date).getFullYear()) < 1){
        return {errorMsg: "Wait atleast a year before requesting another maternity leave"}
      }
      const startingDate = new Date(start)
      const endDate = new Date(startingDate)
      endDate.setDate(startingDate.getDate() + leaveType.maxDays)

      await prisma.leaveRequest.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          startDate: startingDate,
          endDate: endDate,
          reason: reason,
          days: leaveType.maxDays,
          status: "PENDING",
        },
      });
      return {
        successMsg: "Leave request submitted successfully!",
      };
    }
    //==================================================================
    

    if (!leaveBalance?.id) {
      if (leaveType.maxDays < days) {
        return {
          errorMsg: "Insufficient leave balance.",
        };
      }
      await prisma.leaveRequest.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days,
          reason: reason,
          status: "PENDING",
        },
      });
      await prisma.leaveBalance.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          balance: leaveType.maxDays - days,
        },
      });
    } else {
      if (leaveType.maxDays < days) {
        return {
          errorMsg: "Insufficient leave balance.",
        };
      }
      await prisma.leaveRequest.create({
        data: {
          userId: Number(empId),
          leaveTypeId: Number(leaveTypeId),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          days,
          reason: reason,
          status: "PENDING",
        },
      });
      await prisma.leaveBalance.update({
        where: {
          id: leaveBalance.id,
        },
        data: {
          balance: leaveType.maxDays - days,
        },
      });
    }

    revalidatePath("/leave/history");
    return {
      successMsg: "Leave request submitted successfully!",
    };
  } catch (error) {
    console.error("Error creating leave request:", error);
    return {
      errorMsg: "Failed to submit leave request.",
    };
  }
}

export async function approveLeave(leaveId: number) {
  try{
    const user = (await session())?.user;
    if(user?.role === "Employee"){
      return {
        errorMsg: "Validation failed.",
      };
    }
    const isSupApprovalRequired = (await prisma.settings.findUnique({
      where: {
        key: "supervisor_approval_required"
      },
      select: {
        value: true,
        type: true,
      }
    }))?.value === "true";
    const leave = await prisma.leaveRequest.findUnique({
      where: {
        id: leaveId,
      },
      select: {
        isApprovedByAdmin: true,
        isApprovedBySupervisor: true,
        userId: true,
      }
    });

    if(!leave) return {errorMsg: "Leave request not found."}

    
    if(user?.role === "Supervisor" && isSupApprovalRequired){
      !leave.isApprovedBySupervisor &&
      await prisma.leaveRequest.update({
        where: {
          id: leaveId,
        },
        data: {
          status: "APPROVED",
          isApprovedBySupervisor: true,
        },
      });
    revalidatePath("/supervisor/leave");
    return { successMsg: "Leave request approved successfully!" };
    }

    if(user?.role === "HRAdmin"){
      if(isSupApprovalRequired && !leave.isApprovedBySupervisor){
        return {
          errorMsg: "Validation failed.",
        };
      }
      !leave.isApprovedByAdmin &&
      await prisma.leaveRequest.update({
        where: {
          id: leaveId,
        },
        data: {
          status: "APPROVED",
          isApprovedByAdmin: true,
        },
      });
    revalidatePath("/admin/leave");
    return { successMsg: "Leave request approved successfully!" };
    }

    return { errorMsg: "Validation failed."};
  }catch(error){
    console.error("Error approving leave request:", error);
    return {
      errorMsg: "Failed to approve leave request.",
    };
  }
}

export async function rejectLeave(leaveId: number){
  try{

    const user = (await session())?.user;
    if(user?.role === "Employee"){
      return {
        errorMsg: "Validation failed.",
      };
    }
    const isSupApprovalRequired = (await prisma.settings.findUnique({
      where: {
        key: "supervisor_approval_required"
      },
      select: {
        value: true,
        type: true,
      }
    }))?.value === "true";

    if(user?.role === "Supervisor" && !isSupApprovalRequired){
      return {errorMsg: "Validation failed."}
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: {
        id: leaveId,
      },
      select: {
        userId: true,
        leaveTypeId: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
      },
    });
    if(!leave) return {errorMsg: "Leave request not found."}
    //-------------------------------------------------
    if(leave.status !== "PENDING") return {errorMsg: "Can't reject approved leave request."}
    if(leave.leaveType.name === "Maternity Leave" || leave.leaveType.name === "Paternity Leave"){
       await prisma.leaveRequest.update({
        where: {
          id: leaveId,
        },
        data: {
          status: "REJECTED",
        },
      });
      revalidatePath("/admin/leave");
      revalidatePath("/supervisor/leave");
      return { successMsg: "Leave request rejected successfully!" };
    }
    //-------------------------------------------------
    const leaveDays = await calculateLeaveDays(leave?.startDate as Date, leave?.endDate as Date);
    await prisma.leaveBalance.update({
      where: {
        userId_leaveTypeId: {
          userId: leave?.userId,
          leaveTypeId: leave?.leaveTypeId,
        },
        },
      data: {
        balance: {
          increment: leaveDays,
        },
      },
    });
    await prisma.leaveRequest.update({
      where: {
        id: leaveId,
      },
      data: {
        status: "REJECTED",
      },
    });
    revalidatePath("/admin/leave");
    revalidatePath("/supervisor/leave");
    return { successMsg: "Leave request rejected successfully!" };
  }catch(error){
    console.error("Error rejecting leave request:", error);
    return {
      errorMsg: "Failed to reject leave request.",
    };
  }
}
export async function cancelLeave(leaveId: number){
  try{

    const user = (await session())?.user;
    if(user?.role !== "Employee"){
      return {
        errorMsg: "Validation failed.",
      };
    }
    const leave = await prisma.leaveRequest.findUnique({
      where: {
        id: leaveId,
      },
      select: {
        userId: true,
        leaveTypeId: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
      },
    });
    if(!leave) return {errorMsg: "Leave request not found."}
    if(leave.status !== "PENDING") return {errorMsg: "Can't cancel approved leave request."}
    if(leave.leaveType.name === "Maternity Leave" || leave.leaveType.name === "Paternity Leave"){
       await prisma.leaveRequest.delete({
        where: {
          id: leaveId,
        },
      });
      revalidatePath("/leave/history");
      return { successMsg: "Leave request canceled successfully!" };
    }
    
    const leaveDays = await calculateLeaveDays(leave?.startDate as Date, leave?.endDate as Date);
    await prisma.leaveBalance.update({
      where: {
        userId_leaveTypeId: {
          userId: leave?.userId,
          leaveTypeId: leave?.leaveTypeId,
        },
        },
      data: {
        balance: {
          increment: leaveDays,
        },
      },
    });
    await prisma.leaveRequest.delete({
      where: {
        id: leaveId,
      },
    });
    revalidatePath("/leave/history");
    return { successMsg: "Leave request canceled successfully!" };
  }catch(error){
    console.error("Error canceling leave request:", error);
    return {
      errorMsg: "Failed to cancel leave request.",
    };
  }
}

async function isOnLeave(empId:number){
  const leaveRequests = await prisma.leaveRequest.findMany({
    orderBy:{
      updatedAt: "desc",
    },
    where: {
      userId: Number(empId),
      status: "APPROVED",
    },
  });
  if(leaveRequests && leaveRequests[0]?.endDate > new Date()){
    return true
  }
  return false
}
//----------------------------LEAVES END-------------------------------
//Not sure if i'm using this function somewhere(forgot why it's created!)x
async function getEmployeeAttendance(empId: number, date: Date) {
  if (!(await isWorkingDay(date))) {
    console.log("NOT A WORKING DAY");
    return { errorMsg: "Not a working day", isWorkingDay: false };
  }
  //-----------------------------------------//
  const atten = await prisma.attendance.findFirst({
    where: {
      AND: [
        {
          userId: empId,
        },
        {
          date: {
            lte: (await formatDate(date)).endOfDay,
            gte: (await formatDate(date)).startOfDay,
          },
        },
      ],
    },

    select: {
      id: true,
      morningCheckInTime: true,
      morningCheckOutTime: true,
      afternoonCheckInTime: true,
      afternoonCheckOutTime: true,

      isLateMorningCheckIn: true,
      isLateAfternoonCheckIn: true,
      isEarlyMorningCheckOut: true,
      isEarlyAfternoonCheckOut: true,
      checkOutEnabled: true,
      status: true,
      date: true,
    },
  });
  return atten;
}

//employee page
export async function registerAttendanceByEmployee(id: number, status = false) {
  if (!(await isWorkingDay())) {
    console.log("NOT A WORKING DAY");
    return { errorMsg: "Not a working day", isWorkingDay: false };
  }
  if (await isOnLeave(id)) {
    return { errorMsg: "Employee is on leave", onLeave: true };
  }

  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["check_out_enabled", "attendance_time", "late_check_in_allowed"],
      },
    },
    select: {
      key: true,
      value: true,
      type: true,
    },
  });
  const attendanceTimeSetting = JSON.parse(
    settings.find((item) => item.key === "attendance_time")!?.value as string
  ) as any;
  // Attendance Time Settings
  const morningCheckInTime = timeStringToMinutes(
    attendanceTimeSetting.check_in.morning
  );
  const morningCheckOutTime = timeStringToMinutes(
    attendanceTimeSetting.check_out.morning
  );
  const afternoonCheckInTime = timeStringToMinutes(
    attendanceTimeSetting.check_in.afternoon
  );
  const afternoonCheckOutTime = timeStringToMinutes(
    attendanceTimeSetting.check_out.afternoon
  );
  const checkInThreshold = Number(attendanceTimeSetting.check_in.threshold); //In Mins
  const checkOutThreshold = Number(attendanceTimeSetting.check_out.threshold); //In Mins
  const checkOutEnabled =
    settings.find((item) => item.key === "check_out_enabled")?.value === "true";
  const now = new Date().getHours() * 60 + new Date().getMinutes();

  // console.log('Now: ',now,(morningCheckInTime + checkInThreshold) < now )
  const timeOfTheDay =
    morningCheckInTime < now && now < morningCheckOutTime
      ? "morning"
      : afternoonCheckInTime < now && now < afternoonCheckOutTime
      ? "afternoon"
      : "";
  if (timeOfTheDay === "") {
    console.log("Not within attendance time");
    return {
      errorMsg: "Not within attendance time",
      isWorkingDay: true,
      attendanceTime: {
        morningCheckIn: attendanceTimeSetting.check_in.morning,
        morningCheckOut: attendanceTimeSetting.check_out.morning,
        afternoonCheckIn: attendanceTimeSetting.check_in.afternoon,
        afternoonCheckOut: attendanceTimeSetting.check_out.afternoon,
      },
    };
  }
  const { startOfDay: todayStartOfDay, endOfDay: todayEndOfDay } = await formatDate(new Date());
  const attendance = await prisma.attendance.findFirst({
    where: {
      AND: [
        {
          userId: Number(id),
        },
        {
          date: {
            lte: todayEndOfDay,
            gte: todayStartOfDay,
          },
        },
      ],
    },
    select: {
      id: true,
      morningCheckInTime: true,
      morningCheckOutTime: true,
      afternoonCheckInTime: true,
      afternoonCheckOutTime: true,
      checkOutEnabled: true,
      status: true,
      date: true,
    },
  });
  // console.log("ATTENDANCE: ",timeOfTheDay)
  if (status) {
    return {
      timeOfTheDay,
      attendance,
      checkOutEnabled,
      lateClockInEnabled:
        settings.find((item) => item.key === "late_check_in_allowed")!
          ?.value === "true",
      isLateForClockIn:
        (timeOfTheDay &&
          timeOfTheDay === "morning" &&
          morningCheckInTime + checkInThreshold < now) ||
        (timeOfTheDay &&
          timeOfTheDay === "afternoon" &&
          afternoonCheckInTime + checkInThreshold < now),
      isEarlyForClockOut:
        (timeOfTheDay &&
          timeOfTheDay === "afternoon" &&
          afternoonCheckOutTime - checkOutThreshold > now) ||
        (timeOfTheDay &&
          timeOfTheDay === "morning" &&
          morningCheckOutTime - checkOutThreshold > now),
    };
  }

  const determineClockAction = () => {
    if (
      (timeOfTheDay === "morning" &&
        attendance?.morningCheckInTime &&
        checkOutEnabled) ||
      (timeOfTheDay === "afternoon" &&
        attendance?.afternoonCheckInTime &&
        checkOutEnabled)
    ) {
      return "clock_out";
    }
    return "clock_in";
  };
  // const timeOfTheDayTest = "morning"
  const type = determineClockAction();
  try{
    if (type === "clock_in") {
      if (timeOfTheDay === "morning") {
        if (attendance?.morningCheckInTime) {
          return { errorMsg: "Already checked in for morning" };
        }
        //check for lateness
        if (
          !(
            settings.find((item) => item.key === "late_check_in_allowed")!
              ?.value === "true"
          ) &&
          morningCheckInTime + checkInThreshold < now
        ) {
          return { errorMsg: "Not within attendance time" };
        }
        //------------------
        if (attendance) {
          await prisma.attendance.update({
            where: {
              id: attendance.id,
            },
            data: {
              morningCheckInTime: new Date(),
              isLateMorningCheckIn: morningCheckInTime + checkInThreshold < now,
            },
          });
        } else {
          console.log("CREATING ATTENDANCE...");
          await prisma.attendance.create({
            data: {
              userId: Number(id),
              // date: new Date(),
              date: todayStartOfDay,
              morningCheckInTime: new Date(),
              isLateMorningCheckIn: morningCheckInTime + checkInThreshold < now,
              status: "PRESENT",
              checkOutEnabled,
              manuallyCheckedIn: false,
            },
          });
        }
      }
      else if (timeOfTheDay === "afternoon") { // Changed to else if for clarity and correctness
        // if(!attendance?.morningCheckInTime || !attendance?.morningCheckOutTime){
        //   return {errorMsg: "Check in for morning first"}
        // }
        if (attendance?.afternoonCheckInTime) {
          return { errorMsg: "Already checked in for afternoon" };
        }
        //check for lateness
        if (
          !(
            settings.find((item) => item.key === "late_check_in_allowed")!
              ?.value === "true"
          ) &&
          afternoonCheckInTime + checkInThreshold < now
        ) {
          return { errorMsg: "Not within attendance time" };
        }
        //------------------
        if (attendance) {
          await prisma.attendance.update({
            where: {
              id: attendance.id,
            },
            data: {
              afternoonCheckInTime: new Date(),
              isLateAfternoonCheckIn:
                afternoonCheckInTime + checkInThreshold < now,
            },
          });
        } else {
          await prisma.attendance.create({
            data: {
              userId: Number(id),
              // date: new Date(),
              date: todayStartOfDay,
              afternoonCheckInTime: new Date(),
              isLateAfternoonCheckIn:
                afternoonCheckInTime + checkInThreshold < now,
              checkOutEnabled,
              status: "PRESENT",
              manuallyCheckedIn: false,
            },
          });
        }
      }
      // If clock_in logic completed successfully without returning an error,
      // return success now to prevent falling through to clock_out logic.
      revalidatePath("/");
      return { successMsg: "Attendance registered successfully!" };
    }

    // The code below will only be reached if type === "clock_out"
    if (type === "clock_out") {
      if (checkOutEnabled) {
      if (timeOfTheDay === "morning") {
        if (!attendance?.morningCheckInTime) {
          return { errorMsg: "Check in for morning first" };
        }
        if (!attendance?.morningCheckOutTime) {
          //wait atleast 30mins before checkout
          const morningCheckInTime = new Date(attendance.morningCheckInTime); // Assuming morningCheckInTime is guaranteed by prior checks
          const currentTime = new Date();

          const checkInMinutes =
            morningCheckInTime.getHours() * 60 + morningCheckInTime.getMinutes();
          const currentMinutes =
            currentTime.getHours() * 60 + currentTime.getMinutes();

          if (currentMinutes - checkInMinutes < 30) {
            return {
              errorMsg:
                "Wait at least 30 minutes after clock-in before clocking out.",
            };
          }
          //--------------------------------------
          await prisma.attendance.update({
            where: {
              id: attendance.id,
            },
            data: {
              morningCheckOutTime: new Date(),
              isEarlyMorningCheckOut:
                morningCheckOutTime - checkOutThreshold > now,
              checkOutEnabled: true,
            },
          });
        } else {
          return { errorMsg: "Already checked out for morning" };
        }
      } else if (timeOfTheDay === "afternoon") { // Changed to else if for clarity
        if (!attendance?.afternoonCheckInTime) {
          return { errorMsg: "Check in for afternoon first" };
        }

        if (!attendance?.afternoonCheckOutTime) {
          //wait atleast 30mins before checkout
          const afternoonCheckInTime = new Date(attendance.afternoonCheckInTime); // Assuming afternoonCheckInTime is guaranteed by prior checks
          const currentTime = new Date();
          console.log("Afternoon Checkin Time: ", afternoonCheckInTime);
          const checkInMinutes =
            afternoonCheckInTime.getHours() * 60 +
            afternoonCheckInTime.getMinutes();
          const currentMinutes =
            currentTime.getHours() * 60 + currentTime.getMinutes();

          if (currentMinutes - checkInMinutes < 30) {
            return {
              errorMsg:
                "Wait at least 30 minutes after clock-in before clocking out.",
            };
          }
          //--------------------------------------

          await prisma.attendance.update({
            where: {
              id: attendance.id,
            },
            data: {
              afternoonCheckOutTime: new Date(),
              isEarlyAfternoonCheckOut:
                afternoonCheckOutTime - checkOutThreshold > now,
            },
          });
        } else {
          return { errorMsg: "Already checked out for afternoon" };
        }
      }
      // If clock_out was successful and didn't return an error,
      // it will fall through to the common success return at the end of the try block.
    } else { // This 'else' now correctly means: type is "clock_out" AND checkOutEnabled is false
        return { errorMsg: "Clock-out cannot be recorded because the check-out feature is currently disabled by an administrator." };
    }
    }
    // If a clock_out operation was successful and didn't return early, it reaches here.
  }catch (error) {
    console.error("Error registering attendance:", error);
    return {
      errorMsg: "Failed to register attendance, possible attendance duplication",
    };
  }
  revalidatePath("/");
  return { successMsg: "Attendance registered successfully!" };


}

export async function getEmployeeAttendanceHistory(id: number){
  
  const attendance = await prisma.attendance.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      userId: Number(id),
    },
    select: {
      id: true,
      morningCheckInTime: true,
      morningCheckOutTime: true,
      afternoonCheckInTime: true,
      afternoonCheckOutTime: true,
      checkOutEnabled:true,
      manuallyCheckedIn: true,
      date: true,
      status: true,
    },
  });
  return attendance
}
//------------


export async function registerAttendance(
  prevState: UserFormState,
  formData: FormData
) {
  if (!(await isWorkingDay())) {
    console.log("NOT A WORKING DAY");
    return { errorMsg: "Not a working day", isWorkingDay: false };
  }

  const rawData = Object.fromEntries(formData.entries());
  // const validatedData = employeeEditSchema.safeParse(rawData);
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["check_out_enabled", "attendance_time"],
      },
    },
    select: {
      key: true,
      value: true,
      type: true,
    },
  });
  const attendanceTimeSetting = JSON.parse(
    settings.find((item) => item.key === "attendance_time")!.value as string
  ) as any;

  // Attendance Time Settings
  const morningCheckInTime = timeStringToMinutes(
    attendanceTimeSetting.check_in.morning
  );
  const morningCheckOutTime = timeStringToMinutes(
    attendanceTimeSetting.check_out.morning
  );
  const afternoonCheckInTime = timeStringToMinutes(
    attendanceTimeSetting.check_in.afternoon
  );
  const afternoonCheckOutTime = timeStringToMinutes(
    attendanceTimeSetting.check_out.afternoon
  );
  const checkInThreshold = Number(attendanceTimeSetting.check_in.threshold); //In Mins
  const checkOutThreshold = Number(attendanceTimeSetting.check_out.threshold); //In Mins
  const checkOutEnabled =
    settings.find((item) => item.key === "check_out_enabled")?.value === "true";

  // console.log(morningCheckInTime, morningCheckOutTime, afternoonCheckInTime, afternoonCheckOutTime, checkInThreshold, checkOutThreshold)
  const empId = rawData.employeeId;
  const attendanceId = rawData.attendanceId;
  const date = rawData.date && new Date(rawData.date as string);
  // const selectedDate = rawData.selectedDate && new Date(rawData.selectedDate as string);
  const parts = new Date(rawData.selectedDate as string); // Parses as local
const selectedDateAsUTC = new Date(Date.UTC(parts.getFullYear(), parts.getMonth(), parts.getDate()));
// console.log("UTC: ",selectedDateAsUTC?.toISOString()); // This would output 2025-05-19T00:00:00.000Z
const selectedDate = selectedDateAsUTC  
//-----------------------------------------------------
    //   const dateString = "2025-05-19"; // Using YYYY-MM-DD format is more reliable for UTC parsing
    // const selectedDateAsUTC = new Date(dateString + "T00:00:00Z");
    // or for your specific format, you might need to construct it carefully:
    // const parts = new Date(rawData.selectedDate as string); // Parses as local
    // const selectedDateAsUTC = new Date(Date.UTC(parts.getFullYear(), parts.getMonth(), parts.getDate()));
    // console.log(selectedDateAsUTC.toISOString()); // This would output 2025-05-19T00:00:00.000Z
  //-----------------------------------------------------


  //Time as Hr:Min  (add saved as DateTime in db)
  let morningCheckIn = rawData.morningCheckInTime as string;
  let morningCheckOut = rawData.morningCheckOutTime as string;
  let afternoonCheckIn = rawData.afternoonCheckInTime as string;
  let afternoonCheckOut = rawData.afternoonCheckOutTime as string;
  const status = rawData.status as string;
  console.log("Emp Id: ",empId,
    "M-I, M-O, A-I, A-O",
    morningCheckIn,
    ", ",
    morningCheckOut,
    ", ",
    afternoonCheckIn,
    ", ",
    afternoonCheckOut
  );
  const supId = rawData.supId as string;
  //Supervisor updating checkout
  if (supId) {
    const supervisor = await prisma.user.findUnique({
      where: {
        id: Number(supId),
      },
      select: {
        departmentId: true,
      },
    });
    const user = await prisma.user.findUnique({
      where: {
        id: Number(empId),
      },
      select: {
        departmentId: true,
      },
    });
    if (
      supervisor?.departmentId !== user?.departmentId &&
      settings?.find((item) => item.key === "check_out_enabled")?.value! !==
        "true"
    ) {
      return {
        errorMsg: "Validation failed",
        errors: { morningCheckIn: [""] },
      };
    }
  }

  if (!empId && (!date || !selectedDate)) {
    return {
      errorMsg: "Validation failed",
      errors: { morningCheckIn: [""] },
    };
  }

  if (status && status == "Absent") {
    morningCheckIn =
      morningCheckOut =
      afternoonCheckIn =
      afternoonCheckOut =
        "";
  }

  //Attendance Updation or Creation Data
  const data: any = (outEnabled: Boolean) => {
    const currentDate = date || selectedDate;

    if (!outEnabled) {
      return {
        morningCheckInTime:
          (morningCheckIn &&
            new Date(
              new Date(currentDate).setHours(
                Number(morningCheckIn.split(":")[0]),
                Number(morningCheckIn.split(":")[1])
              )
            )) ||
          undefined,
        afternoonCheckInTime:
          (afternoonCheckIn &&
            new Date(
              new Date(currentDate).setHours(
                Number(afternoonCheckIn.split(":")[0]),
                Number(afternoonCheckIn.split(":")[1])
              )
            )) ||
          undefined,

        isLateMorningCheckIn:
          (morningCheckIn || undefined) &&
          morningCheckInTime + checkInThreshold <
            timeStringToMinutes(morningCheckIn),
        isLateAfternoonCheckIn:
          (afternoonCheckIn || undefined) &&
          afternoonCheckInTime + checkInThreshold <
            timeStringToMinutes(afternoonCheckIn),

        status: morningCheckIn || afternoonCheckIn ? "PRESENT" : "ABSENT",
        checkOutEnabled: false,
      };
    } else if (supId && outEnabled) {
      //supervisor edit checkout
      return {
        morningCheckInTime: undefined,
        afternoonCheckInTime: undefined,
        morningCheckOutTime:
          (morningCheckOut &&
            new Date(
              new Date(currentDate).setHours(
                Number(morningCheckOut.split(":")[0]),
                Number(morningCheckOut.split(":")[1])
              )
            )) ||
          undefined,
        afternoonCheckOutTime:
          (afternoonCheckOut &&
            new Date(
              new Date(currentDate).setHours(
                Number(afternoonCheckOut.split(":")[0]),
                Number(afternoonCheckOut.split(":")[1])
              )
            )) ||
          undefined,
        isLateMorningCheckIn: undefined,
        isLateAfternoonCheckIn: undefined,

        isEarlyMorningCheckOut:
          (morningCheckOut || undefined) &&
          morningCheckOutTime - checkOutThreshold >
            timeStringToMinutes(morningCheckOut),
        isEarlyAfternoonCheckOut:
          (afternoonCheckOut || undefined) &&
          afternoonCheckOutTime - checkOutThreshold >
            timeStringToMinutes(afternoonCheckOut),

        status: morningCheckIn || afternoonCheckIn ? "PRESENT" : "ABSENT",
        checkOutEnabled: true,
      };
    } else if (outEnabled) {
      console.log("Morning check in: ", morningCheckIn);
      console.log("Afternoon check in: ", afternoonCheckIn);
      //          prisma.$executeRaw`
      //   INSERT INTO public.'Attendance' (morningCheckInTime, date, userId)
      //   VALUES (NOW() AT TIME ZONE 'America/New_York', NOW() AT TIME ZONE 'America/New_York', 1)
      // `;
      console.log(
        "MORRNING: ",
        morningCheckIn &&
          morningCheckInTime + checkInThreshold <
            timeStringToMinutes(morningCheckIn)
      );
      console.log(
        "IS_LATE: ",
        (morningCheckIn || undefined) &&
          morningCheckInTime + checkInThreshold <
            timeStringToMinutes(morningCheckIn)
      );
      return {
        morningCheckInTime:
          (morningCheckIn &&
            new Date(
              new Date(currentDate).setHours(
                Number(morningCheckIn.split(":")[0]),
                Number(morningCheckIn.split(":")[1])
              )
            )) ||
          undefined,
        afternoonCheckInTime:
          (afternoonCheckIn &&
            new Date(
              new Date(currentDate).setHours(
                Number(afternoonCheckIn.split(":")[0]),
                Number(afternoonCheckIn.split(":")[1])
              )
            )) ||
          undefined,
        morningCheckOutTime:
          (morningCheckOut &&
            new Date(
              new Date(currentDate).setHours(
                Number(morningCheckOut.split(":")[0]),
                Number(morningCheckOut.split(":")[1])
              )
            )) ||
          undefined,
        afternoonCheckOutTime:
          (afternoonCheckOut &&
            new Date(
              new Date(currentDate).setHours(
                Number(afternoonCheckOut.split(":")[0]),
                Number(afternoonCheckOut.split(":")[1])
              )
            )) ||
          undefined,

        isLateMorningCheckIn:
          (morningCheckIn || undefined) &&
          morningCheckInTime + checkInThreshold <
            timeStringToMinutes(morningCheckIn),
        isLateAfternoonCheckIn:
          (afternoonCheckIn || undefined) &&
          afternoonCheckInTime + checkInThreshold <
            timeStringToMinutes(afternoonCheckIn),
        isEarlyMorningCheckOut:
          (morningCheckOut || undefined) &&
          morningCheckOutTime - checkOutThreshold >
            timeStringToMinutes(morningCheckOut),
        isEarlyAfternoonCheckOut:
          (afternoonCheckOut || undefined) &&
          afternoonCheckOutTime - checkOutThreshold >
            timeStringToMinutes(afternoonCheckOut),

        status: morningCheckIn || afternoonCheckIn ? "PRESENT" : "ABSENT",
        checkOutEnabled: true,
      };
    }
  };
  console.log("ATTENANCE ID: ", attendanceId, " selected date: ", selectedDate)
  if (selectedDate) { 
    //if attendance exists update
    if (attendanceId) {
      const existingAttendance = await prisma.attendance.findUnique({
        where:{
          id: Number(attendanceId)
        }
      })
      console.log("Existing Atten for empId: ",empId, " is ",existingAttendance)
      console.log("New Attend DATA: ", data(existingAttendance?.checkOutEnabled));

      if(!existingAttendance){return {errorMsg: "Invalid Input"}}

      const res = await prisma.attendance.update({
        where: {
          id: Number(attendanceId),
        },
        data: data(existingAttendance.checkOutEnabled),
      });
      console.log("UPDATE RESULT: ", res);
    }else{
      console.log("SELECTED DATE: ", selectedDate)
      await prisma.attendance.create({
      data: {
        userId: Number(empId),
        date: selectedDate,
        manuallyCheckedIn: true,
        ...data(checkOutEnabled),
      },
    });
    }
  } else {
    console.error("No Date Selected; in register function")
    return{errorMsg: "No Date Selected"}
    // await prisma.attendance.create({
    //   data: {
    //     userId: Number(empId),
    //     date: selectedDate,
    //     manuallyCheckedIn: true,
    //     ...data(checkOutEnabled),
    //   },
    // });
  }

  revalidatePath("/admin/attendance");
  revalidatePath(`/admin/attendance/${empId}`);

  return { successMsg: "Attendance registered successfully!" };
}


//Calendar
export async function fetchEvents() {
  try {
    const events = await prisma.calendar.findMany();
    console.log("EVENTS: ", events);
    return { events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { errorMsg: "Error fetching events" };
  }
}

//create or update event
export async function saveEvent(eventData: Event, eventId?: number) {
  try {
    const { eventName, eventDate, isRecurring, eventType, description} =
      eventData;
    let recurringType:string;
    let eventEnd:Date | undefined;
    if(isRecurring){
      recurringType = eventData.recurringType
      eventEnd = new Date(eventData.eventEnd!)
    }
    console.log("RECURRING TYPE: ", recurringType!, "EVENT END: ", eventEnd)
    if (!eventId) {
      const newEvent = await prisma.calendar.create({
        data: {
          eventName,
          eventDate: new Date(eventDate!),
          isRecurring,
          eventType,
          description,
          recurringType,
          eventEnd: eventEnd || undefined
        },
      });
      revalidatePath("/admin/calendar");
      return { newEvent };
    }
    const updatedEvent = await prisma.calendar.update({
      where: { id: eventId },
      data: {
        eventName,
        eventDate: new Date(eventDate),
        isRecurring,
        eventType,
        description,
        recurringType,
        eventEnd
      },
    });
    revalidatePath("/admin/calendar");
    return { updatedEvent };
  } catch (error) {
    console.error("Error saving event:", error);
    return { errorMsg: "Error saving event" };
  }
}

export async function deleteEvent(eventId: number) {
  try {
    await prisma.calendar.delete({
      where: { id: eventId },
    });
    revalidatePath("/admin/calendar");
    return { successMsg: "Event deleted successfully" };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { errorMsg: "Error deleting event" };
  }
}

export async function getSettings(key?: string) {
  try {
    if(!key){
      const settings = await prisma.settings.findMany({
        select: {
          key: true,
          value: true,
          type: true,
          description: true
        },
      });
      return { settings };
    }
    const setting = await prisma.settings.findUnique({
      where: {
        key: key,
      },
      select: {
        key: true,
        value: true,
        type: true,
      },
    });
    return { setting };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { errorMsg: "Error fetching settings" };
  }
}
export async function saveSettings(newSettings: Setting[]) {
  try {
    const oldSettings = (await getSettings()).settings;
    const updates: { key: string; value: string }[] = [];

    newSettings.forEach((newSetting) => {
      const oldSetting = oldSettings?.find(
        (setting) => setting.key === newSetting.key
      );

      if (oldSetting) {
        // Handle JSON values specially
        if (newSetting.type === "JSON" && oldSetting.type === "JSON") {
          try {
            const newValue = JSON.parse(newSetting.value);
            const oldValue = JSON.parse(oldSetting.value);
            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
              updates.push({
                key: newSetting.key,
                value: newSetting.value,
              });
            }
          } catch (e) {
            // If JSON parsing fails, fall back to string comparison
            if (newSetting.value !== oldSetting.value) {
              updates.push({
                key: newSetting.key,
                value: newSetting.value,
              });
            }
          }
        }
        // Regular string comparison for non-JSON values
        else if (newSetting.value !== oldSetting.value) {
          updates.push({
            key: newSetting.key,
            value: newSetting.value,
          });
        }
      }
    });
    console.log(updates);
    await prisma.$transaction(
      updates.map(update => 
        prisma.settings.update({
          where: { key: update.key },
          data: {
            value: update.value
          }
        })
      )
    );
    revalidatePath("/admin/settings");
    return {successMsg: "Settings saved successfully"}
  } catch (error) {
    console.error("Error saving settings:", error);
    return { errorMsg: "Error saving settings" };
  }
}
//----------------------------------------------------------------//

const savePhoto = async (file: File): Promise<string> => {
  try {
    // Convert the photo to a buffer
    const photoBytes = await file.arrayBuffer();
    const photoBuffer = Buffer.from(photoBytes);

    // Define the directory and file path
    const fileName = generateUniqueFileName(file.name);
    const uploadDir = path.join(process.cwd(), "uploads", "photos");
    const filePath = path.join(uploadDir, fileName);

    // Create the directory if it doesn't exist
    // await fs.mkdir(uploadDir, { recursive: true });

    // Write the file
    await writeFile(filePath, photoBuffer);

    console.log("Photo saved successfully:", filePath);
    return fileName;
  } catch (error) {
    console.error("Error saving photo:", error);
    throw error;
  }
};
//pdf file
const saveCV = async (file: File): Promise<string> => {
  try {
    // Convert the photo to a buffer
    const photoBytes = await file.arrayBuffer();
    const photoBuffer = Buffer.from(photoBytes);

    // Define the directory and file path
    const fileName = generateUniqueFileName(file.name);
    const uploadDir = path.join(process.cwd(), "uploads", "cv");
    const filePath = path.join(uploadDir, fileName);

    // Create the directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Write the file
    await writeFile(filePath, photoBuffer);

    console.log("CV saved successfully:", filePath);
    return fileName;
  } catch (error) {
    console.error("Error saving cv file:", error);
    throw error;
  }
};
async function deleteFileIfExists(folder: string, fileName: string): Promise<boolean> {
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  const filePath = path.join(uploadDir, fileName);
  const fullPath = path.resolve(filePath);

  try {
      // Check if file exists
      try {
          await fs.access(fullPath);
      } catch {
          return false; // File doesn't exist
      }

      // Get file stats to make sure it's not a directory
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
          throw new Error(`Path ${fullPath} is a directory, not a file`);
      }

      await fs.unlink(fullPath);
      return true;
  } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
  }
}

const formatDate = async (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0); // Set to the beginning of the day in UTC

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999); // Set to the end of the day in UTC
  return { startOfDay, endOfDay };
};

// const formatDate = async (date: Date) => {
//   const startOfDay = new Date(date);
//   startOfDay.setHours(0, 0, 0, 0); // Set to the beginning of the day

//   const endOfDay = new Date(date);
//   endOfDay.setDate(endOfDay.getDate() + 1); // Add one day
//   endOfDay.setHours(0, 0, 0, 0); // Set to the beginning of the next day
//   return { startOfDay, endOfDay };
// };

function timeStringToMinutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function isRecurringDate(
  startDate: Date,
  endDate: Date,
  recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly',
  date: Date
): boolean {
  // Normalize all dates by removing time components
  const normStart = new Date(startDate);
  normStart.setHours(0, 0, 0, 0);
  
  const normEnd = new Date(endDate);
  normEnd.setHours(0, 0, 0, 0);
  
  const normDate = new Date(date);
  normDate.setHours(0, 0, 0, 0);

  // Check if date is within range
  if (normDate < normStart || normDate > normEnd) {
    return false;
  }

  // Check recurrence pattern
  switch (recurrence) {
    case 'daily':
      return true;
    case 'weekly':
      return normDate.getDay() === normStart.getDay();
    case 'monthly':
      return normDate.getDate() === normStart.getDate();
    case 'yearly':
      return (
        normDate.getMonth() === normStart.getMonth() &&
        normDate.getDate() === normStart.getDate()
      );
    default:
      throw new Error(`Invalid recurrence pattern: ${recurrence}`);
  }
}

function isSameDate(date1: Date, date2: Date): boolean {
  return date1.setHours(0, 0, 0, 0) === date2.setHours(0, 0, 0, 0);
}

//returns true if the date is not weekend and event date
async function isWorkingDay(date?:Date) {
   //Weekend
   const testDate = date ? date : new Date()
  if(testDate.getDay() === 0 || testDate.getDay() === 6){
    //---------------------------------------------------
    const settings = await prisma.settings.findUnique({
      where: {
        key: "saturday"
      },
      select: {
        key: true,
        value: true,
        type: true,
      },
    });
    const isSaturdayWorkDay = settings?.value === "true"
    if(testDate.getDay() === 6 && isSaturdayWorkDay){
      return true
    }
    //----------------------------------------------------
    return false 
  }
  //Check if there are any events //
  //None recurring event
  const event = await prisma.calendar.findMany({
    where: {
      isRecurring: false
    }
  })
  if(event.some(event => isSameDate(new Date(event?.eventDate), testDate))){
    return false
  }
  //Recurring event
  const recurringEvents = await prisma.calendar.findMany({
    where: {
      isRecurring: true
    }
  })
  const hasRecurringEvent = recurringEvents.some((event) => {
    return event?.eventDate && event?.eventEnd && event?.recurringType && 
           isRecurringDate(event.eventDate, event.eventEnd, event.recurringType, testDate);
  });
  if (hasRecurringEvent) {
    return false;
  }
  //Work Day
  return true
}

export async function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  // events: Event[]
) {

  const events = (await fetchEvents()).events;

  // Make copies to avoid modifying original dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate dates
  if (start > end) return 0;

  // Normalize dates by setting time to 00:00:00 to compare whole days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  // Generate all event days (including recurring ones)
  const allEventDays = generateAllEventDays(events, start, end);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    
    // Check if current date is an event day (compare date strings)
    const dateString = current.toISOString().split('T')[0];
    const isEventDay = allEventDays.has(dateString);
    
    if (!isWeekend && !isEventDay) {
      count++;
    }
    
    current.setDate(current.getDate() + 1); // Move to next day
  }

  return count;
}

//helper function for calculateLeaveDays
function generateAllEventDays(events: Event[], rangeStart: Date, rangeEnd: Date): Set<string> {
  const eventDays = new Set<string>();

  events.forEach(event => {
    if (!event.isRecurring) {
      // Add single non-recurring event
      const date = new Date(event.eventDate);
      date.setHours(0, 0, 0, 0);
      if (date >= rangeStart && date <= rangeEnd) {
        eventDays.add(date.toISOString().split('T')[0]);
      }
    } else if (event.recurringType && event.eventEnd) {
      // Handle recurring events
      const eventStart = new Date(event.eventDate);
      eventStart.setHours(0, 0, 0, 0);
      
      const eventEnd = new Date(event.eventEnd);
      eventEnd.setHours(0, 0, 0, 0);
      
      // Adjust to be within our calculation range
      const start = eventStart < rangeStart ? rangeStart : eventStart;
      const end = eventEnd > rangeEnd ? rangeEnd : eventEnd;

      if (start > end) return;

      const current = new Date(start);
      const originalEventDate = new Date(event.eventDate);
      originalEventDate.setHours(0, 0, 0, 0);

      while (current <= end) {
        if (isRecurringMatch(current, originalEventDate, event.recurringType)) {
          eventDays.add(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
      }
    }
  });

  return eventDays;
}
//helper function for generateAllEventDays
function isRecurringMatch(currentDate: Date, originalDate: Date, type: string): boolean {
  switch (type) {
    case 'daily':
      return true;
    case 'weekly':
      return currentDate.getDay() === originalDate.getDay();
    case 'monthly':
      return currentDate.getDate() === originalDate.getDate();
    case 'yearly':
      return (
        currentDate.getMonth() === originalDate.getMonth() &&
        currentDate.getDate() === originalDate.getDate()
      );
    default:
      return false;
  }
}

//=====================================REPORT=====================================
export async function calculateSluAnnualLeaveBalance(empId:number){
  const annualLeaveType = await prisma.leaveType.findUnique({
    where: {
      id:4, //Should'nt be hardcoded
      name: "Annual Leave"
    }
  })
  if(!annualLeaveType){throw new Error("Annual leave type not found")}
  const annualLeaveBalance = await prisma.leaveBalance.findUnique({
    where: {
      userId_leaveTypeId:{
        userId: Number(empId),
        leaveTypeId: annualLeaveType.id,
      }
    }
  })
  const hireDate:Date | null | undefined = (await prisma.user.findUnique({
    where: {
      id: Number(empId)
    },
    select: {
      hireDate: true
    }
  }))?.hireDate
  if(!hireDate){ throw new Error("User hire date not found") }
  const lastApprovedAnnualLeave = await prisma.leaveRequest.findFirst({
    where: {
      userId: Number(empId),
      leaveTypeId: annualLeaveType.id,
      status: "APPROVED"
    },
    orderBy: {
      id: "desc"
    },
    select: {
      updatedAt: true
    }
  })

  const currentYear = new Date().getFullYear();
  const firstYearServiceEntitlement = 19 //days 20 (subtructed one so that it will be 20 on the first year)
  const yearlyAddedNumberOfDays = 1
  const maxYearlyLeaveEntitlementDays = 30 //days
  const numberOfServiceYears = currentYear - hireDate.getFullYear()
  console.log(numberOfServiceYears)
  const numberOfYearlyEntitledDays = Math.min(firstYearServiceEntitlement + yearlyAddedNumberOfDays * numberOfServiceYears, maxYearlyLeaveEntitlementDays)

  if(numberOfServiceYears < 1 || lastApprovedAnnualLeave && (currentYear - new Date(lastApprovedAnnualLeave.updatedAt as Date).getFullYear()) < 1){
    return -1
  }
  if(numberOfServiceYears % 2 !== 0){
    return numberOfYearlyEntitledDays
  }else{
    const newBalance = annualLeaveBalance?.balance && (new Date(annualLeaveBalance.updatedAt).getFullYear() - currentYear) >= 1 || !annualLeaveBalance ? Math.min(numberOfYearlyEntitledDays-1, maxYearlyLeaveEntitlementDays) + numberOfYearlyEntitledDays
    : annualLeaveBalance?.balance as number + numberOfYearlyEntitledDays
    return newBalance
  }
 
}
