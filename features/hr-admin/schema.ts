import { z } from "zod";



//EMPLOYEE FORM SCHEMA
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const photoSchema = z.instanceof(File).refine(
  (file) => file.size <= MAX_FILE_SIZE,
  {
    message: 'File size must be less than 5MB',
  }
).refine(
  (file) => ACCEPTED_PHOTO_TYPES.includes(file.type),
  {
    message: 'Only .jpg, .png, and .webp files are accepted',
  }
);
const fileSchema = z.instanceof(File).refine(
  (file) => file.size <= MAX_FILE_SIZE,
  {
    message: 'File size must be less than 5MB',
  }
).refine(
  (file) => ACCEPTED_FILE_TYPES.includes(file.type),
  {
    message: 'Only .pdf files are accepted',
  }
);

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
  department: z.coerce.number(),//z.string().min(2, "Select department"),
  role: z.enum(["Employee", "Supervisor", "HRAdmin"]).optional(),
  educationalLevel: z.string().optional(),
  directDepositInfo: z.string().optional(),
  // certificates: z.array(z.instanceof(File)).optional(),
  photograph: photoSchema,//z.instanceof(File, { message: "Invalid photograph format" }),
  // cv: fileSchema.optional()
});
export const employeeEditSchema = z.object({
  id: z.coerce.number().optional(),
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
  department: z.coerce.number(),//z.string().min(2, "Select department"),
  role: z.enum(["Employee", "Supervisor", "HRAdmin"]).optional(),
  educationalLevel: z.string().optional(),
  directDepositInfo: z.string().optional(),
  // certificates: z.array(z.instanceof(File)).optional(),
  photograph: z.preprocess(
    (val) => (val === "" ? undefined : val), // Transform empty string to undefined
    photoSchema.optional()
  ),//z.instanceof(File, { message: "Invalid photograph format" }),
  cv: z.preprocess(
    (val) => (val === "" ? undefined : val), // Transform empty string to undefined
    fileSchema.optional()
  ),
});

export const departmentSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(2, "Department Name must be at least 2 characters"),
  nameAmharic: z.preprocess(
    (val) => (val === "" ? undefined : val), // Transform empty string to undefined
    z.string().min(2, "Department Name must be at least 2 characters").optional()
  ),
  description: z.preprocess(
      (val) => (val === "" ? undefined : val), // Transform empty string to undefined
      z.string().min(5, "Description must be at least 5 characters").optional()
    ),
  supervisor: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number().min(10, "Invalid supervisor id").optional()
  ),
});