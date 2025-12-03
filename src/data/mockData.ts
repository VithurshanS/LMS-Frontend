import { Department, User, Module, Enrollment } from '../types';

export const departments: Department[] = [
  { id: 'd1', name: 'Computer Science' },
  { id: 'd2', name: 'Mathematics' },
  { id: 'd3', name: 'Physics' },
];

export const users: User[] = [
  // Admin
  {
    id: 'u1',
    username: 'admin',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@university.edu',
    role: 'ADMIN',
    isActive: true,
  },
  
  // Students
  {
    id: 'u2',
    username: 'student1',
    password: 'pass123',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@university.edu',
    role: 'STUDENT',
    departmentId: 'd1', // Computer Science
    isActive: true,
  },
  {
    id: 'u3',
    username: 'student2',
    password: 'pass123',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@university.edu',
    role: 'STUDENT',
    departmentId: 'd2', // Mathematics
    isActive: true,
  },
  
  // Lecturers
  {
    id: 'u4',
    username: 'lecturer1',
    password: 'pass123',
    firstName: 'Dr. Carol',
    lastName: 'Davis',
    email: 'carol.davis@university.edu',
    role: 'LECTURER',
    departmentId: 'd1', // Computer Science
    isActive: true,
  },
  {
    id: 'u5',
    username: 'lecturer_pending',
    password: 'pass123',
    firstName: 'Dr. David',
    lastName: 'Wilson',
    email: 'david.wilson@university.edu',
    role: 'LECTURER',
    departmentId: 'd2', // Mathematics
    isActive: false, // Pending approval
  },
];

export const modules: Module[] = [
  // Computer Science Modules
  {
    id: 'm1',
    code: 'CS101',
    name: 'Introduction to Programming',
    limit: 30,
    enrolledCount: 15,
    departmentId: 'd1',
    lecturerId: 'u4', // Dr. Carol Davis
  },
  {
    id: 'm2',
    code: 'CS201',
    name: 'Data Structures',
    limit: 25,
    enrolledCount: 25, // FULL - for testing
    departmentId: 'd1',
    lecturerId: 'u4',
  },
  
  // Mathematics Modules
  {
    id: 'm3',
    code: 'MATH101',
    name: 'Calculus I',
    limit: 40,
    enrolledCount: 20,
    departmentId: 'd2',
    lecturerId: null, // No lecturer assigned yet
  },
  {
    id: 'm4',
    code: 'MATH201',
    name: 'Linear Algebra',
    limit: 35,
    enrolledCount: 10,
    departmentId: 'd2',
    lecturerId: null,
  },
  
  // Physics Modules
  {
    id: 'm5',
    code: 'PHY101',
    name: 'Classical Mechanics',
    limit: 30,
    enrolledCount: 8,
    departmentId: 'd3',
    lecturerId: null,
  },
];

export const enrollments: Enrollment[] = [
  {
    id: 'e1',
    studentId: 'u2', // Alice Johnson
    moduleId: 'm1', // CS101
    enrolledAt: new Date().toISOString(),
  },
];
