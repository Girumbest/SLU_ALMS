import { z } from "zod";

export const employeeSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().regex(/^\+?\d{10,14}$/, "Invalid phone number"),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  gender: z.enum(["Male", "Female"]),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone:  z.string().regex(/^\+?\d{10,14}$/, "Invalid phone number").optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hireDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters"),
  positionLevel: z.enum(["Junior", "Mid", "Senior"]),
  salary: z.coerce.number().min(1000, "Salary must be greater than 1000"),
  department: z.string().min(2, "Select department"),
  role: z.enum(["Employee", "Supervisor", "HRAdmin"]),
  educationalLevel: z.string().optional(),
  directDepositInfo: z.string().optional(),
  // certificates: z.array(z.instanceof(File)).optional(),
  photograph: z.instanceof(File, { message: "Invalid photograph format" }).optional(),
});

// import { z } from 'zod';

// // Personal Info Schema
// const personalInfoSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   username: z.string().min(1, 'Username is required'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
//   dateOfBirth: z.string().min(1, 'Date of birth is required'),
//   gender: z.enum(['male', 'female', 'other']),
//   maritalStatus: z.enum(['single', 'married', 'divorced']),
//   emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
//   emergencyContactPhone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
//   address: z.string().min(1, 'Address is required'),
//   photograph: z.instanceof(File).optional(),
// });

// // Employment Info Schema
// const employmentInfoSchema = z.object({
//   hireDate: z.string().min(1, 'Hire date is required'),
//   jobTitle: z.string().min(1, 'Job title is required'),
//   positionLevel: z.string().min(1, 'Position level is required'),
//   salary: z.number().min(0, 'Salary must be a positive number'),
//   department: z.enum(['HR', 'Engineering', 'Finance', 'Marketing', 'Sales']),
//   role: z.enum(['Manager', 'Developer', 'Analyst', 'Designer', 'Intern']),
//   educationalLevel: z.enum(['High School', 'Bachelor', 'Master', 'PhD']),
//   directDepositInfo: z.string().min(1, 'Direct deposit info is required'),
//   certificates: z.instanceof(File).optional(),
// });

// // Combined Schema
// export const employeeSchema = personalInfoSchema.merge(employmentInfoSchema);

// export type EmployeeFormData = z.infer<typeof employeeSchema>;