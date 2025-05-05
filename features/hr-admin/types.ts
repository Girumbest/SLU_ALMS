import { EventType, RecurringType } from "@prisma/client";

export type UserFormState = {
    errors?: Record<string, string[]>;
    errorMsg?: string;
    successMsg?: string;
    data?: any
}


export interface Event {
    id: number;
    eventName: string;
    eventDate: Date | null;
    isRecurring: boolean;
    recurringType?: string;
    eventEnd: Date | null;
    eventType: EventType;
    description: string | null;
  }

 export interface Setting{  
    key: string;    
    value: any;    
    type: string;     
    description: string;
}