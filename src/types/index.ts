

export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface Department {
  id: string;
  name: string;
}



export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  departmentId?: string; 
  isActive: boolean;     
}

export interface Module {
  id: string;
  code: string;       
  name: string;
  limit: number;       
  enrolledCount: number; 
  departmentId: string;
  lecturerId?: string | null; 
}

export interface Enrollment {
  id: string;
  studentId: string;
  moduleId: string;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departmentId:string;
}

export interface AssignmentRequest {
  moduleId: string;
  lecturerId: string;
}

export interface ModuleCreationRequest {
  code: string;
  name: string;
  limit: number;
  departmentId: string;
  adminId: string;
}


export interface EnrollmentRequest {
  studentId: string;
  moduleId: string;
}

export interface ControllUserRequest {
  id: string;
  control: "BAN"|"UNBAN";
  role:"student"|"lecturer";
}