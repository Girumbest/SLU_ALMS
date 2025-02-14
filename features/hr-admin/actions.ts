'use server';

import {prisma} from "@/lib/db"
import { employeeSchema } from './schema';
import { UserFormState } from "./types";

export async function createUser(prevState: UserFormState, formData: FormData):Promise<UserFormState> {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeSchema.safeParse(rawData);

  if (!validatedData.success) {
    
    return {
      message: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }
  let data = validatedData.data;
  // Save to database or perform other actions
  // await prisma.user.create({
  //   data:{
  //     firstName: data.firstName,
  //     lastName: data.lastName,
  //     username: data.username,
  //     password: data.password,
  //     address: data.address,
  //     dateOfBirth: data.dateOfBirth,
  //     gender: data.gender,
  //     emergencyContactPhone: data.emergencyContactPhone,
  //     hireDate: data.hireDate,
  //     jobTitle: data.jobTitle,
  //     maritalStatus: data.maritalStatus,
  //     departmentId: Number(data.department), //fix this
  //   }
  // })
  // console.log('Validated Data:', validatedData.data);

  return { successMsg: 'Form submitted successfully!' };
}