'use server';

import { employeeSchema } from './schema';

export async function submitForm(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = employeeSchema.safeParse(rawData);

  if (!validatedData.success) {
    return {
      message: 'Validation failed',
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  // Save to database or perform other actions
  console.log('Validated Data:', validatedData.data);

  return { message: 'Form submitted successfully!' };
}