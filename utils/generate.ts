import { randomBytes } from 'crypto';

export function generatePassword(len=8, upper=true, nums=false, special=false){
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numChars = "0123456789";
        const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
        let chars = lower;
    
        if (upper) chars += upperChars;
        if (nums) chars += numChars;
        if (special) chars += specialChars;
    
        let password = "";
        for (let i = 0; i < len; i++) {
            const randIdx = Math.floor(Math.random() * chars.length);
            password += chars[randIdx];
        }
    
        return password;
    
}

export function generateUsername(fname?:string, lname?:string){
    return (fname + "_" + lname?.substring(0,2)).toLowerCase().replace(/\s/g, "");
}


export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = randomBytes(8).toString('hex'); // Generates a random 16-character string
  const fileExtension = originalName.split('.').pop(); // Extracts the file extension
  return `${timestamp}-${randomString}.${fileExtension}`;
};