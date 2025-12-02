import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'lecturer' | 'student';
  is_approved: boolean;
  created_at: string;
};

export type Department = {
  id: string;
  name: string;
  code: string;
  description: string;
  created_at: string;
  created_by: string;
};

export type Module = {
  id: string;
  department_id: string;
  code: string;
  name: string;
  description: string;
  max_students: number;
  current_students: number;
  lecturer_id: string | null;
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  module_id: string;
  enrolled_at: string;
};

export type UserDepartment = {
  id: string;
  user_id: string;
  department_id: string;
  created_at: string;
};
