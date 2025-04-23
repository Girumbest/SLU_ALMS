"use server";

import { promises as fs } from "fs";
import path from "path";

import { prisma } from "@/lib/db";
import { departmentSchema, employeeEditSchema, employeeSchema } from "./schema";
import { UserFormState } from "./types";
import { writeFile } from "fs/promises";
import { generateUniqueFileName } from "@/utils/generate";
import { revalidatePath } from "next/cache";

export async function createUser(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      errorMsg: "Validation failed",
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  //Check for existence of a user with the same username
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
      maritalStatus: data.maritalStatus,
      departmentId: data.department,
      role: data.role,

      photograph: await savePhoto(data.photograph),
    },
  });

  return { successMsg: "Form submitted successfully!" };
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

  //Check for existence of a user with the same username
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (existingUser?.id != data.id)
    return {
      errorMsg: `User ${existingUser?.firstName} ${existingUser?.lastName} has Username: ${data.username}`,
    };

  const updateData: any = {};
  //If the photo or cv have not been edited skip(photo or file update)
  for (let [field, value] of Object.entries(data)) {
    if (field == "id") continue;

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

    if (field == "photograph") {
      value && (updateData.photograph = await savePhoto(value as File));
      continue;
    }
    if (field == "cv") {
      value && (updateData.cv = await saveCV(value as File));
      continue;
    }

    updateData[field] = value;
  }
  console.log("UPDATE DATA: ", updateData);
  // return {successMsg: "RECEIVED AT TEST POINT"}
  // Save to database
  await prisma.user.update({
    where: {
      id: data.id,
    },
    data: updateData,
  });
  return { successMsg: "User updated successfully!" };
}

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
      //_count
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

export async function getEmployeesAttendance(
  query = "",
  searchBy: string,
  employeesPerPage = 10,
  page = 1,
  date = new Date()
) {
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
  if (true) {
    const employees = await prisma.user.findMany({
      skip: (page - 1) * employeesPerPage,
      take: employeesPerPage,
      //_count
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
      },
    });
    const total = await prisma.user.count();
    (employees as any).total = total;

    console.log(employees[0].username, employees[0].attendances);
    console.log("date: ", date);
    return { employees, total, settings };
  }

  // const filter = () => {
  //   if (searchBy == "phone") return "phoneNumber";
  //   if (searchBy == "jobtitle") return "jobTitle";

  //   return searchBy;
  // };

  // const filterValue = filter();

  // const whereClause: any = (() => {
  //   switch (filterValue) {
  //     case "name":
  //       return {
  //         OR: [
  //           { firstName: { contains: query, mode: "insensitive" as any } },
  //           { lastName: { contains: query, mode: "insensitive" as any } },
  //         ],
  //       };
  //     case "department":
  //       return {
  //         department: {
  //           name: { contains: query, mode: "insensitive" as any },
  //         },
  //       };
  //     case "role":
  //       return {
  //         role: query[0].toUpperCase() + query.slice(1),
  //       };
  //     case "hireDate":
  //       return {
  //         hireDate: {
  //           gte: new Date(query.split(":")[0]),
  //           lte:
  //             (query.split(":")[1] && new Date(query.split(":")[1])) ||
  //             new Date(),
  //         },
  //       };
  //     default:
  //       return {
  //         [filterValue]: { contains: query, mode: "insensitive" as any },
  //       };
  //   }
  // })();

  // const employees = await prisma.user.findMany({
  //   skip: (page - 1) * employeesPerPage,
  //   take: employeesPerPage,
  //   where: whereClause,
  //   select: {
  //     ...{
  //       department: {
  //         select: {
  //           name: true,
  //         },
  //       },
  //       attendances: {
  //         select: {
  //           id: true,
  //           morningCheckInTime: true,
  //           morningCheckOutTime: checkOutEnabled,
  //           afternoonCheckInTime: true,
  //           afternoonCheckOutTime: checkOutEnabled,
  //       }
  //     }
  //     },
  //     id: true,
  //     firstName: true,
  //     lastName: true,
  //     username: true,
  //     // phoneNumber: true,
  //     // jobTitle: true,
  //     // role: true,
  //     // salary: true,
  //     // hireDate: true,
  //     photograph: true,
  //   },
  // });
  // const total = await prisma.user.count({ where: whereClause });
  // (employees as any).total = total;

  // return { employees, total };
}

//get all the attendances of an employee with id
export async function getAllAttendance(
  empId: number,

  query = "",
  searchBy: string,
  attendancesPerPage = 10,
  page = 1,
) {
  const filterValue = searchBy;

  const getWhereClause = async (
    filterValue: string,
    query: string,
  ) => {
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
  console.log("WHERE CLAUSE:", whereClause);

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
    },
  });

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

async function getEmployeeAttendance(empId: number, date: Date) {
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

export async function registerAttendance(
  prevState: UserFormState,
  formData: FormData
) {
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
  const date = rawData.date && new Date(rawData.date as string);
  const selectedDate =
    rawData.selectedDate && new Date(rawData.selectedDate as string);

  //Time as Hr:Min  (add saved as DateTime in db)
  let morningCheckIn = rawData.morningCheckInTime as string;
  let morningCheckOut = rawData.morningCheckOutTime as string;
  let afternoonCheckIn = rawData.afternoonCheckInTime as string;
  let afternoonCheckOut = rawData.afternoonCheckOutTime as string;
  const status = rawData.status as string;

  if (!empId && (!date || !selectedDate)) {
    return { errorMsg: "Validation failed", errors: { morningCheckIn: [""] } };
  }

  if (status && status == "Absent") {
    morningCheckIn =
      morningCheckOut =
      afternoonCheckIn =
      afternoonCheckOut =
        "";
  }

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
    } else if (outEnabled) {
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

  if (date) {
    const employeeAttendance = await getEmployeeAttendance(Number(empId), date);
    console.log("DATA: ", data(employeeAttendance?.checkOutEnabled));
    if (employeeAttendance?.id) {
      const test = await prisma.attendance.update({
        where: {
          id: employeeAttendance.id,
        },
        data: data(employeeAttendance.checkOutEnabled),
      });
      console.log("UPDATE RES: ", test);
    }
  } else {
    console.log("DATE: ", selectedDate);

    await prisma.attendance.create({
      data: {
        userId: Number(empId),
        date: selectedDate,
        manuallyCheckedIn: true,
        ...data(checkOutEnabled),
      },
    });
  }

  revalidatePath("/admin/attendance");
  revalidatePath(`/admin/attendance/${empId}`);

  return { successMsg: "Attendance registered successfully!" };
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
