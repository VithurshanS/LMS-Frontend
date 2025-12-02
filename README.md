# University Learning Management System (LMS)

A complete University LMS frontend built with React, TypeScript, and Tailwind CSS. Features role-based dashboards, module enrollment, and lecturer approval workflows.

## Features

### Authentication
- **Login**: Username-based authentication with role selection
- **Registration**: Self-service registration with automatic approval for students/admins
- **Lecturer Approval**: Lecturers require admin approval before accessing the system

### Role-Based Dashboards

#### Admin Dashboard
- View all departments with detailed information
- Manage lecturers (approve pending registrations)
- View all students
- Department details showing modules and assigned lecturers
- Tab-based navigation for Departments, Lecturers, and Students

#### Student Dashboard
- View enrolled modules
- Browse available modules in their department
- Enroll in modules (with capacity validation)
- Real-time enrollment status updates
- Visual indicators for module availability (Open/Full)

#### Lecturer Dashboard
- View profile information
- See all assigned modules
- Monitor module enrollment statistics
- Visual progress bars for module capacity

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Layer**: In-memory mock data

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Shan
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Project Structure

```
src/
├── types/
│   └── index.ts              # TypeScript interfaces (Role, Department, User, Module, Enrollment)
├── data/
│   └── mockData.ts           # Mock data for testing
├── context/
│   └── AuthContext.tsx       # Global state management for auth and data operations
├── pages/
│   ├── LoginPage.tsx         # Public login page
│   ├── RegisterPage.tsx      # Public registration page
│   ├── AdminDashboard.tsx    # Admin dashboard with department/lecturer/student management
│   ├── StudentDashboard.tsx  # Student dashboard with module enrollment
│   └── LecturerDashboard.tsx # Lecturer dashboard with module overview
├── App.tsx                   # Main app with routing and protected routes
└── main.tsx                  # Entry point with AuthProvider wrapper
```

## Test Accounts

### Admin
- **Username**: admin
- **Role**: ADMIN

### Students
- **Username**: student1
- **Role**: STUDENT
- **Department**: Computer Science

- **Username**: student2
- **Role**: STUDENT
- **Department**: Mathematics

### Lecturers
- **Username**: lecturer1
- **Role**: LECTURER
- **Department**: Computer Science
- **Status**: Active ✓

- **Username**: lecturer_pending
- **Role**: LECTURER
- **Department**: Mathematics
- **Status**: Pending Approval (Cannot login until approved)

## Testing Scenarios

### 1. Student Enrollment Flow
1. Login as `student1` (role: STUDENT)
2. View available Computer Science modules
3. Try enrolling in a full module (Data Structures - 25/25) - should be disabled
4. Enroll in an available module (Web Development)
5. See immediate UI update with enrolled module

### 2. Lecturer Approval Flow
1. Try logging in as `lecturer_pending` (role: LECTURER) - should be blocked
2. Login as `admin` (role: ADMIN)
3. Navigate to "Lecturers" tab
4. Find `lecturer_pending` with "Pending" status
5. Click "Approve" button
6. Logout and login as `lecturer_pending` - should now succeed
7. View assigned modules in Lecturer Dashboard

### 3. Admin Department Management
1. Login as `admin`
2. Navigate to "Departments" tab
3. Click on "Computer Science" department
4. View all modules (Web Development, Data Structures, etc.)
5. View assigned lecturers with their status
6. Return to departments list

### 4. Registration Flow
1. Navigate to `/register`
2. Register as a new student:
   - Username: newstudent
   - First Name: Test
   - Last Name: Student
   - Email: test@example.com
   - Role: STUDENT
   - Department: Computer Science
3. Should be redirected to login with auto-approval
4. Try registering as a lecturer - should see approval notice

### 5. Module Capacity Validation
1. Login as `student1`
2. Check "Data Structures" module (25/25 enrolled)
3. Enroll button should be disabled with "Module Full" text
4. Try enrolling in an open module - should succeed
5. Check that the module moves to "My Enrolled Modules" section

## API Endpoints (Future Backend Integration)

The application is structured to easily integrate with a backend. The following endpoints would be needed:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/approve` - Approve lecturer (Admin only)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `GET /api/departments/:id/modules` - Get modules in department
- `GET /api/departments/:id/lecturers` - Get lecturers in department

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules/:id/enroll` - Enroll student in module

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/student/:studentId` - Get student's enrollments

## TypeScript Interfaces

The application uses strict TypeScript interfaces matching Java backend DTOs:

```typescript
type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  departmentId?: string;
  isActive: boolean;
}

interface Module {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  lecturerId: string;
  limit: number;
  enrolledCount: number;
}

interface Enrollment {
  studentId: string;
  moduleId: string;
}
```

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Type-check TypeScript files

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
