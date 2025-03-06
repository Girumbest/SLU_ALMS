'use server';

import { promises as fs } from 'fs';
import path from 'path';

import {prisma} from "@/lib/db"
import { departmentSchema, employeeSchema } from './schema';
import { UserFormState } from "./types";
import { writeFile } from "fs/promises";
import { generateUniqueFileName } from '@/utils/generate';

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
  return {successMsg: 'Form submitted successfully!'}
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
    }
  })
  return {successMsg: 'Department created successfully!'}
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