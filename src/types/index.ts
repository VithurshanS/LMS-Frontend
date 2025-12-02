// types/index.ts

export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  departmentId?: string; // Nullable for Admins
  isActive: boolean;     // Crucial for Lecturer approval flow
}

export interface Module {
  id: string;
  code: string;         // e.g., "CS101"
  name: string;
  limit: number;        // Max student capacity
  enrolledCount: number; // Current number of enrolled students
  departmentId: string;
  lecturerId?: string | null; // Module might not have a lecturer assigned yet
}

export interface Enrollment {
  id: string;
  studentId: string;
  moduleId: string;
  enrolledAt: string;
}
