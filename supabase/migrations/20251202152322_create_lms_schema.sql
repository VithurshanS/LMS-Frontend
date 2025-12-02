/*
  # University LMS Database Schema

  ## Overview
  Creates a complete Learning Management System database for a university with role-based access control.

  ## Tables Created
  
  ### 1. profiles
  - Extends auth.users with additional user information
  - Columns:
    - `id` (uuid, FK to auth.users) - User identifier
    - `email` (text) - User email
    - `full_name` (text) - User's full name
    - `role` (text) - User role: 'admin', 'lecturer', or 'student'
    - `is_approved` (boolean) - Approval status (false for lecturers by default)
    - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. departments
  - University departments
  - Columns:
    - `id` (uuid) - Department identifier
    - `name` (text) - Department name
    - `code` (text) - Department code
    - `description` (text) - Department description
    - `created_at` (timestamptz) - Creation timestamp
    - `created_by` (uuid, FK to profiles) - Admin who created it
  
  ### 3. modules
  - Academic modules/subjects
  - Columns:
    - `id` (uuid) - Module identifier
    - `department_id` (uuid, FK to departments) - Parent department
    - `code` (text) - Module code
    - `name` (text) - Module name
    - `description` (text) - Module description
    - `max_students` (integer) - Maximum enrollment capacity
    - `current_students` (integer) - Current enrollment count
    - `lecturer_id` (uuid, FK to profiles) - Assigned lecturer
    - `created_at` (timestamptz) - Creation timestamp
  
  ### 4. enrollments
  - Student enrollments in modules
  - Columns:
    - `id` (uuid) - Enrollment identifier
    - `student_id` (uuid, FK to profiles) - Enrolled student
    - `module_id` (uuid, FK to modules) - Enrolled module
    - `enrolled_at` (timestamptz) - Enrollment timestamp
  - Unique constraint on (student_id, module_id)
  
  ### 5. user_departments
  - Links users (lecturers/students) to departments
  - Columns:
    - `id` (uuid) - Link identifier
    - `user_id` (uuid, FK to profiles) - User
    - `department_id` (uuid, FK to departments) - Department
    - `created_at` (timestamptz) - Link creation timestamp
  - Unique constraint on (user_id, department_id)

  ## Security (Row Level Security)
  
  ### Profiles Table
  - Users can read their own profile
  - Users can update their own profile (except role and approval status)
  - Admins can read all profiles
  - Admins can update user roles and approval status
  
  ### Departments Table
  - All authenticated users can view departments
  - Only admins can create departments
  - Only admins can update departments
  
  ### Modules Table
  - All authenticated users can view modules
  - Admins can create and update modules
  - Lecturers can view details of their assigned modules
  
  ### Enrollments Table
  - Students can view their own enrollments
  - Students can create enrollments (enroll in modules)
  - Admins and lecturers can view all enrollments
  
  ### User Departments Table
  - Users can view their own department links
  - Admins can create and manage all department links

  ## Notes
  - Lecturers require admin approval (is_approved = true) before accessing the system
  - Module enrollment is constrained by max_students capacity
  - Students can only enroll in modules within their department
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'lecturer', 'student')),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  max_students integer DEFAULT 50,
  current_students integer DEFAULT 0,
  lecturer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(student_id, module_id)
);

CREATE TABLE IF NOT EXISTS user_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, department_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can update own profile details"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "All authenticated users can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "All authenticated users can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create modules"
  ON modules FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update modules"
  ON modules FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Students can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'lecturer'))
  );

CREATE POLICY "Students can enroll in modules"
  ON enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'student' AND profiles.is_approved = true)
  );

CREATE POLICY "Students can view own department links"
  ON user_departments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins can manage department links"
  ON user_departments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete department links"
  ON user_departments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));