// Lightweight in-memory mock of Supabase client for frontend development
// This file replaces the remote DB/auth integration with mocked data and
// a minimal API surface used by the app (auth + .from(...)).

export type User = {
  id: string;
  email: string;
};

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
  description?: string;
  created_at: string;
  created_by?: string;
};

export type Module = {
  id: string;
  department_id: string;
  code: string;
  name: string;
  description?: string;
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

// Seed data
const now = () => new Date().toISOString();

const departments: Department[] = [
  { id: 'd1', name: 'Computer Science', code: 'CS', description: 'Computer Science and Engineering Department', created_at: now(), created_by: 'admin-1' },
  { id: 'd2', name: 'Mathematics', code: 'MATH', description: 'Mathematics and Statistics Department', created_at: now(), created_by: 'admin-1' },
  { id: 'd3', name: 'Business Administration', code: 'BA', description: 'Business Administration Department', created_at: now(), created_by: 'admin-1' },
  { id: 'd4', name: 'Engineering', code: 'ENG', description: 'Mechanical and Civil Engineering Department', created_at: now(), created_by: 'admin-1' },
];

const profiles: Profile[] = [
  { id: 'admin-1', email: 'admin@uni.edu', full_name: 'John Admin', role: 'admin', is_approved: true, created_at: now() },
  { id: 'admin-2', email: 'admin2@uni.edu', full_name: 'Sarah Wilson', role: 'admin', is_approved: true, created_at: now() },
  
  { id: 'lect-1', email: 'alice.lect@uni.edu', full_name: 'Dr. Alice Johnson', role: 'lecturer', is_approved: true, created_at: now() },
  { id: 'lect-2', email: 'bob.pending@uni.edu', full_name: 'Prof. Bob Miller', role: 'lecturer', is_approved: false, created_at: now() },
  { id: 'lect-3', email: 'carol.cs@uni.edu', full_name: 'Dr. Carol Davis', role: 'lecturer', is_approved: true, created_at: now() },
  { id: 'lect-4', email: 'david.math@uni.edu', full_name: 'Prof. David Brown', role: 'lecturer', is_approved: true, created_at: now() },
  { id: 'lect-5', email: 'emma.business@uni.edu', full_name: 'Dr. Emma Taylor', role: 'lecturer', is_approved: true, created_at: now() },
  { id: 'lect-6', email: 'frank.eng@uni.edu', full_name: 'Prof. Frank Wilson', role: 'lecturer', is_approved: false, created_at: now() },
  
  { id: 'stud-1', email: 'charlie.student@uni.edu', full_name: 'Charlie Thompson', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-2', email: 'diana.cs@uni.edu', full_name: 'Diana Rodriguez', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-3', email: 'edward.math@uni.edu', full_name: 'Edward Chen', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-4', email: 'fiona.business@uni.edu', full_name: 'Fiona Martinez', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-5', email: 'george.eng@uni.edu', full_name: 'George Anderson', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-6', email: 'helen.cs@uni.edu', full_name: 'Helen Parker', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-7', email: 'ivan.math@uni.edu', full_name: 'Ivan Petrov', role: 'student', is_approved: true, created_at: now() },
  { id: 'stud-8', email: 'jane.business@uni.edu', full_name: 'Jane Williams', role: 'student', is_approved: true, created_at: now() },
];

const userDepartments: UserDepartment[] = [
  // CS Department
  { id: 'ud1', user_id: 'lect-1', department_id: 'd1', created_at: now() },
  { id: 'ud2', user_id: 'lect-2', department_id: 'd1', created_at: now() },
  { id: 'ud3', user_id: 'lect-3', department_id: 'd1', created_at: now() },
  { id: 'ud4', user_id: 'stud-1', department_id: 'd1', created_at: now() },
  { id: 'ud5', user_id: 'stud-2', department_id: 'd1', created_at: now() },
  { id: 'ud6', user_id: 'stud-6', department_id: 'd1', created_at: now() },
  
  // Math Department
  { id: 'ud7', user_id: 'lect-4', department_id: 'd2', created_at: now() },
  { id: 'ud8', user_id: 'stud-3', department_id: 'd2', created_at: now() },
  { id: 'ud9', user_id: 'stud-7', department_id: 'd2', created_at: now() },
  
  // Business Department
  { id: 'ud10', user_id: 'lect-5', department_id: 'd3', created_at: now() },
  { id: 'ud11', user_id: 'stud-4', department_id: 'd3', created_at: now() },
  { id: 'ud12', user_id: 'stud-8', department_id: 'd3', created_at: now() },
  
  // Engineering Department
  { id: 'ud13', user_id: 'lect-6', department_id: 'd4', created_at: now() },
  { id: 'ud14', user_id: 'stud-5', department_id: 'd4', created_at: now() },
];

const modules: Module[] = [
  // Computer Science Modules
  { id: 'm1', department_id: 'd1', code: 'CS101', name: 'Introduction to Programming', description: 'Fundamentals of programming using Python', max_students: 30, current_students: 3, lecturer_id: 'lect-1', created_at: now() },
  { id: 'm2', department_id: 'd1', code: 'CS201', name: 'Data Structures & Algorithms', description: 'Advanced data structures and algorithm analysis', max_students: 25, current_students: 2, lecturer_id: 'lect-3', created_at: now() },
  { id: 'm3', department_id: 'd1', code: 'CS301', name: 'Database Systems', description: 'Database design and SQL programming', max_students: 20, current_students: 1, lecturer_id: 'lect-1', created_at: now() },
  { id: 'm4', department_id: 'd1', code: 'CS401', name: 'Software Engineering', description: 'Software development methodologies', max_students: 22, current_students: 0, lecturer_id: null, created_at: now() },
  
  // Mathematics Modules
  { id: 'm5', department_id: 'd2', code: 'MATH101', name: 'Calculus I', description: 'Limits, derivatives, and applications', max_students: 40, current_students: 2, lecturer_id: 'lect-4', created_at: now() },
  { id: 'm6', department_id: 'd2', code: 'MATH201', name: 'Linear Algebra', description: 'Matrices, vector spaces, and linear transformations', max_students: 35, current_students: 1, lecturer_id: 'lect-4', created_at: now() },
  { id: 'm7', department_id: 'd2', code: 'MATH301', name: 'Statistics', description: 'Probability theory and statistical analysis', max_students: 30, current_students: 0, lecturer_id: null, created_at: now() },
  
  // Business Administration Modules
  { id: 'm8', department_id: 'd3', code: 'BA101', name: 'Principles of Management', description: 'Fundamentals of business management', max_students: 45, current_students: 2, lecturer_id: 'lect-5', created_at: now() },
  { id: 'm9', department_id: 'd3', code: 'BA201', name: 'Marketing Fundamentals', description: 'Introduction to marketing concepts', max_students: 40, current_students: 1, lecturer_id: 'lect-5', created_at: now() },
  { id: 'm10', department_id: 'd3', code: 'BA301', name: 'Financial Accounting', description: 'Basic accounting principles and practices', max_students: 35, current_students: 0, lecturer_id: null, created_at: now() },
  
  // Engineering Modules
  { id: 'm11', department_id: 'd4', code: 'ENG101', name: 'Engineering Mechanics', description: 'Statics and dynamics of engineering systems', max_students: 28, current_students: 1, lecturer_id: null, created_at: now() },
  { id: 'm12', department_id: 'd4', code: 'ENG201', name: 'Thermodynamics', description: 'Heat transfer and energy conversion', max_students: 25, current_students: 0, lecturer_id: null, created_at: now() },
];

const enrollments: Enrollment[] = [
  // CS Module Enrollments
  { id: 'e1', student_id: 'stud-1', module_id: 'm1', enrolled_at: now() },
  { id: 'e2', student_id: 'stud-2', module_id: 'm1', enrolled_at: now() },
  { id: 'e3', student_id: 'stud-6', module_id: 'm1', enrolled_at: now() },
  { id: 'e4', student_id: 'stud-1', module_id: 'm2', enrolled_at: now() },
  { id: 'e5', student_id: 'stud-2', module_id: 'm2', enrolled_at: now() },
  { id: 'e6', student_id: 'stud-6', module_id: 'm3', enrolled_at: now() },
  
  // Math Module Enrollments
  { id: 'e7', student_id: 'stud-3', module_id: 'm5', enrolled_at: now() },
  { id: 'e8', student_id: 'stud-7', module_id: 'm5', enrolled_at: now() },
  { id: 'e9', student_id: 'stud-3', module_id: 'm6', enrolled_at: now() },
  
  // Business Module Enrollments
  { id: 'e10', student_id: 'stud-4', module_id: 'm8', enrolled_at: now() },
  { id: 'e11', student_id: 'stud-8', module_id: 'm8', enrolled_at: now() },
  { id: 'e12', student_id: 'stud-4', module_id: 'm9', enrolled_at: now() },
  
  // Engineering Module Enrollments
  { id: 'e13', student_id: 'stud-5', module_id: 'm11', enrolled_at: now() },
];

// Simple auth/session emulation
let currentSessionUserId: string | null = null;
type Session = { user: User } | null;

const authListeners: Array<(event: string, session: Session) => void> = [];

function emitAuth(event: string, session: Session) {
  authListeners.forEach((cb) => cb(event, session));
}

const auth = {
  async getSession() {
    return { data: { session: currentSessionUserId ? { user: { id: currentSessionUserId, email: profiles.find(p => p.id === currentSessionUserId)?.email ?? '' } } : null } };
  },
  onAuthStateChange(callback: (event: string, session: Session) => void) {
    authListeners.push(callback);
    // return subscription
    return { data: { subscription: { unsubscribe: () => {
      const idx = authListeners.indexOf(callback);
      if (idx >= 0) authListeners.splice(idx, 1);
    } } } };
  },
  async signUp({ email, password }: { email: string; password: string }) {
    // password ignored in mock; create a profile id
    const id = 'u-' + Math.random().toString(36).slice(2, 9);
    // insert a minimal profile placeholder; real profile creation is handled by signUp flow in AuthContext
    profiles.push({ id, email, full_name: email.split('@')[0], role: 'student', is_approved: true, created_at: now() });
    currentSessionUserId = id;
    emitAuth('SIGNED_UP', { user: { id, email } });
    return { data: { user: { id, email } }, error: null };
  },
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    // Find by email
    const p = profiles.find((pr) => pr.email === email);
    if (!p) {
      return { error: new Error('Invalid credentials') };
    }
    if (p.role === 'lecturer' && !p.is_approved) {
      return { error: new Error('Lecturer not approved by admin yet') };
    }
    currentSessionUserId = p.id;
    emitAuth('SIGNED_IN', { user: { id: p.id, email: p.email } });
    return { data: { user: { id: p.id, email: p.email } }, error: null };
  },
  async signOut() {
    currentSessionUserId = null;
    emitAuth('SIGNED_OUT', null);
  }
};

// Minimal query builder for `.from(table)` patterns used in the app
class QueryBuilder {
  table: string;
  _select: string | null = null;
  _eqs: Record<string, any> = {};
  _order: string | null = null;
  _insertBody: any = null;
  _updateBody: any = null;
  _options: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(sel: string, options?: any) {
    this._select = sel;
    this._options = options;
    return this;
  }

  eq(field: string, value: any) {
    this._eqs[field] = value;
    return this;
  }

  order(field: string, opts?: any) {
    this._order = field;
    return this;
  }

  insert(body: any) {
    this._insertBody = body;
    return this.executeInsert();
  }

  update(body: any) {
    this._updateBody = body;
    return this.executeUpdate();
  }

  maybeSingle() {
    return this.execute().then(({ data, error }) => ({ data: data ? data[0] ?? null : null, error }));
  }

  async executeInsert() {
    const id = Math.random().toString(36).slice(2, 9);
    const created = { id, ...this._insertBody, created_at: now() };
    if (this.table === 'departments') {
      departments.push(created as Department);
      return { data: created, error: null };
    }
    if (this.table === 'profiles') {
      profiles.push(created as Profile);
      return { data: created, error: null };
    }
    if (this.table === 'user_departments') {
      userDepartments.push(created as UserDepartment);
      return { data: created, error: null };
    }
    if (this.table === 'modules') {
      modules.push(created as Module);
      return { data: created, error: null };
    }
    if (this.table === 'enrollments') {
      enrollments.push(created as Enrollment);
      // also bump the module current_students
      const mod = modules.find((m) => m.id === created.module_id);
      if (mod) mod.current_students = (mod.current_students || 0) + 1;
      return { data: created, error: null };
    }
    return { data: null, error: new Error('Insert not supported for table ' + this.table) };
  }

  async executeUpdate() {
    if (this.table === 'modules') {
      const m = modules.find((mm) => mm.id === this._eqs['id']);
      if (!m) return { data: null, error: new Error('Not found') };
      Object.assign(m, this._updateBody);
      return { data: m, error: null };
    }
    return { data: null, error: new Error('Update not supported for table ' + this.table) };
  }

  async execute() {
    // HEAD/count requests
    if (this._options && this._options.head) {
      const arr = this._executeSelectArray();
      return { count: arr.length } as any;
    }

    const data = this._executeSelectArray();

    // handle special join-like selections
    if (this.table === 'enrollments' && this._select && this._select.includes('profiles!')) {
      // attach profiles to each enrollment
      const enhanced = (data as any[]).map((e) => ({ ...e, profiles: profiles.find((p) => p.id === e.student_id) }));
      return { data: enhanced, error: null };
    }

    if (this.table === 'modules' && this._select && this._select.includes('department:departments')) {
      const enhanced = (data as any[]).map((m) => ({ ...m, department: departments.find((d) => d.id === m.department_id) }));
      return { data: enhanced, error: null };
    }

    return { data, error: null };
  }

  _executeSelectArray() {
    let arr: any[] = [];
    if (this.table === 'departments') arr = departments.slice();
    if (this.table === 'profiles') arr = profiles.slice();
    if (this.table === 'user_departments') arr = userDepartments.slice();
    if (this.table === 'modules') arr = modules.slice();
    if (this.table === 'enrollments') arr = enrollments.slice();

    // apply eq filters
    Object.keys(this._eqs).forEach((k) => {
      arr = arr.filter((item) => (item as any)[k] === this._eqs[k]);
    });

    // simple order
    if (this._order) {
      arr.sort((a, b) => {
        const va = (a as any)[this._order!];
        const vb = (b as any)[this._order!];
        if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb);
        return 0;
      });
    }

    return arr;
  }
}

export const supabase = {
  auth,
  from(table: string) {
    return new QueryBuilder(table);
  },
};

export default supabase;
