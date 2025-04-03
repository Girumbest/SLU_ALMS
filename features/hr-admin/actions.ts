'use server';

import { promises as fs } from 'fs';
import path from 'path';

import {prisma} from "@/lib/db"
import { departmentSchema, employeeEditSchema, employeeSchema } from './schema';
import { UserFormState } from "./types";
import { writeFile } from "fs/promises";
import { generateUniqueFileName } from '@/utils/generate';
import { revalidatePath } from 'next/cache';

export async function createUser(prevState: UserFormState, formData: FormData):Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeSchema.safeParse(rawData);

  if (!validatedData.success) {
    
    return {
      errorMsg: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  //Check for existence of a user with the same username
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username
    },
    select:{
      firstName: true,
      lastName: true
    },
  })

  if(!!existingUser)
    return {errorMsg: `User ${existingUser.firstName} ${existingUser.lastName} has Username: ${data.username}`}
  
  // Save to database 
  await prisma.user.create({
    data:{
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
    }
  })

  return { successMsg: 'Form submitted successfully!' };
}

export async function editUser(prevState: UserFormState, formData: FormData):Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeEditSchema.safeParse(rawData);


  if (!validatedData.success) {
    
    return {
      errorMsg: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;

  //Check for existence of a user with the same username
  const existingUser = await prisma.user.findUnique({
    where: {
      username: data.username
    },
    select:{
      id: true,
      firstName: true,
      lastName: true
    },
  })

  if(existingUser?.id != data.id)
    return {errorMsg: `User ${existingUser?.firstName} ${existingUser?.lastName} has Username: ${data.username}`}
  
  const updateData:any = {};
  //If the photo or cv have not been edited skip(photo or file update)
  for(let [field, value] of Object.entries(data)){
    if(field == "id") continue
    
    if(field == "dateOfBirth") {updateData.dateOfBirth  = new Date(value as string);continue}
    if(field == "hireDate") {updateData.hireDate  = new Date(value as string);continue}
    if(field == "department") {updateData.departmentId  = value;continue}
    
    if(field == "photograph") {value && (updateData.photograph  = await savePhoto(value as File));continue}
    if(field == "cv") {value && (updateData.cv  = await saveCV(value as File));continue}

    updateData[field] = value;
  }
  console.log("UPDATE DATA: ", updateData)
  // return {successMsg: "RECEIVED AT TEST POINT"}
  // Save to database 
  await prisma.user.update({
    where:{
      id: data.id
    },
    data: updateData
    
  })
  return {successMsg: 'User updated successfully!'}
}


export async function createDepartment(prevState: UserFormState, formData: FormData):Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = departmentSchema.safeParse(rawData);
  console.log(rawData)
  if (!validatedData.success) {
    
    return {
      errorMsg: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;


  const existingDepartment = await prisma.department.findUnique({
    where: { name: data.name },
  });

  if (existingDepartment) {
    return {errorMsg: "A department with the same name already exists."};
  }

  await prisma.department.create({
    data: {
      name: data.name,
      nameAmharic: data.nameAmharic || undefined,
      description: data.description || undefined,
      // supervisor: data.supervisor
    }
  })
  revalidatePath("/admin/departments")
  return {successMsg: 'Department created successfully!'}
}

export async function updateDepartment(prevState: UserFormState, formData: FormData):Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = departmentSchema.safeParse(rawData);
  console.log(rawData)
  if (!validatedData.success) {
    
    return {
      errorMsg: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;


  const existingDepartment = await prisma.department.findUnique({
    where: { name: data.name },
  });

  if (existingDepartment) {
    return {errorMsg: "A department with the same name already exists."};
  }

  await prisma.department.update({
    where: {
      id: data.id
    },
    data: {
      name: data.name,
      nameAmharic: data.nameAmharic,
      description: data.description,
      // supervisor: data.supervisor

    }
  })
  revalidatePath("/admin/departments")
  // revalidatePath(`/admin/departments/${data.id}`)
  return {successMsg: 'Department created successfully!'}
}

export async function deleteDepartment(departmentId: number) {
  const depEmployees = await prisma.department.findUnique({
    where: {
      id: departmentId
    },
    select: {
      _count: {
        select: { users: true },
      },
    },
  })
  if(depEmployees && depEmployees._count.users > 0){
    return {errorMsg: "Department has employees."}
  }

  await prisma.department.delete({
    where: {
      id: departmentId
    }
  })
  revalidatePath("/admin/departments")
  return {successMsg: 'Department deleted successfully!'}
}


export async function getEmployees(query='',searchBy: string, employeesPerPage=10, page=1) {
  if(query == ""){
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
    
  return {employees, total}
  }
    
  const filter = ()=>{
    if(searchBy == "phone")
      return "phoneNumber"
    if(searchBy == "jobtitle")
      return "jobTitle"
   
    return searchBy
  }

  const filterValue = filter();
  
  const whereClause: any = (() => {
    switch (filterValue) {
      case "name":
        return {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' as any } },
            { lastName: { contains: query, mode: 'insensitive' as any } },
          ],
        };
      case "department":
        return {
          department: {
            name: { contains: query, mode: 'insensitive' as any },
          },
        };
      case "role":
        return {
          role: query[0].toUpperCase() + query.slice(1),
        };
      case "hireDate":
        
        return {
          hireDate: {
            gte: new Date(query.split(':')[0]),
            lte: (query.split(':')[1] && new Date(query.split(':')[1])) || new Date(),
          },
        };
      default:
        return {
          [filterValue]: { contains: query, mode: 'insensitive' as any },
        };
    }
  })();
  
  
  const employees = await prisma.user.findMany({
    skip: (page - 1) * employeesPerPage,
    take: employeesPerPage,
    where: whereClause,  
    select:{
      ...{department: {
      select: {
        name: true,
      },
    }}, id: true, firstName: true, lastName: true, username: true, phoneNumber: true, jobTitle: true, role: true, salary: true, hireDate: true, photograph: true}
    
  })
  const total = await prisma.user.count({where: whereClause});
  (employees as any).total = total;
  
  return {employees, total}
}

export async function getDepartmentEmployees(departmentId: number, query='',searchBy: string, employeesPerPage=10, page=1) {
  console.log(departmentId,"Query: ", query, searchBy)
  if(query == ""){
  const departmentEmployees = await prisma.department.findUnique({
    where: {
      id:departmentId,
    },
    select: {
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
      
    },
    _count: {
      select: {
        users: true, // Count all users in the department
      },
      //
    }
  }
  });
  return {employees: departmentEmployees?.users, total: departmentEmployees?._count.users}
  }
  
const filter = ()=>{
  if(searchBy == "phone")
    return "phoneNumber"
  if(searchBy == "jobtitle")
    return "jobTitle"
 
  return searchBy
}

const filterValue = filter();

const whereClause: any = (() => {
  switch (filterValue) {
    case "name":
      return {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' as any } },
          { lastName: { contains: query, mode: 'insensitive' as any } },
        ],
      };
    case "department":
      return {
        department: {
          name: { contains: query, mode: 'insensitive' as any },
        },
      };
    case "role":
      return {
        role: query[0].toUpperCase() + query.slice(1),
      };
    case "hireDate":
      
      return {
        hireDate: {
          gte: new Date(query.split(':')[0]),
          lte: (query.split(':')[1] && new Date(query.split(':')[1])) || new Date(),
        },
      };
    default:
      return {
        [filterValue]: { contains: query, mode: 'insensitive' as any },
      };
  }
})();

const departmentEmployees = await prisma.department.findUnique({
  where: {
    id:departmentId,
  },
  select: {
    users: {
      skip: (page - 1) * employeesPerPage,
      take: employeesPerPage,
      where: whereClause, 
      select:{
        ...{department: {
        select: {
          name: true,
        },}}, id: true, firstName: true, lastName: true, username: true, phoneNumber: true, jobTitle: true, role: true, salary: true, hireDate: true, photograph: true
      }
    },
    _count: {
      select: {
        users: true, // Count all users in the department
      },
      //
    }

    }
})
return {employees: departmentEmployees?.users, total: departmentEmployees?._count.users}
}



const savePhoto = async ( file:File ):Promise<string> => {
  try {
    // Convert the photo to a buffer
    const photoBytes = await file.arrayBuffer();
    const photoBuffer = Buffer.from(photoBytes);

    // Define the directory and file path
    const fileName = generateUniqueFileName(file.name)
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    const filePath = path.join(uploadDir, fileName);

    // Create the directory if it doesn't exist
    // await fs.mkdir(uploadDir, { recursive: true });

    // Write the file
    await writeFile(filePath, photoBuffer);

    console.log('Photo saved successfully:', filePath);
    return fileName
  } catch (error) {
    console.error('Error saving photo:', error);
    throw error;
  }
  
}

//pdf file
const saveCV = async ( file:File ):Promise<string> => {
  try {
    // Convert the photo to a buffer
    const photoBytes = await file.arrayBuffer();
    const photoBuffer = Buffer.from(photoBytes);

    // Define the directory and file path
    const fileName = generateUniqueFileName(file.name)
    const uploadDir = path.join(process.cwd(), 'uploads', 'cv');
    const filePath = path.join(uploadDir, fileName);

    // Create the directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });

    // Write the file
    await writeFile(filePath, photoBuffer);

    console.log('CV saved successfully:', filePath);
    return fileName
  } catch (error) {
    console.error('Error saving cv file:', error);
    throw error;
  }
  
}
