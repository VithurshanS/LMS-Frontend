import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Module, Department, Enrollment, Role } from '../types';
import { 
  departments as initialDepartments, 
  users as initialUsers, 
  modules as initialModules, 
  enrollments as initialEnrollments 
} from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  modules: Module[];
  enrollments: Enrollment[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'isActive'>) => void;
  approveLecturer: (userId: string) => void;
  enrollInModule: (studentId: string, moduleId: string) => boolean;
  getDepartmentModules: (departmentId: string) => Module[];
  getDepartmentLecturers: (departmentId: string) => User[];
  getStudentEnrollments: (studentId: string) => Enrollment[];
  getLecturerModules: (lecturerId: string) => Module[];
  isStudentEnrolled: (studentId: string, moduleId: string) => boolean;
  createDepartment: (name: string) => Department;
  createModule: (moduleData: { code: string; name: string; departmentId: string; lecturerId: string; limit: number }) => Module;
  assignLecturer: (moduleId: string, lecturerId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);  // no need bcz it will be handled by backend
  const [departments, setDepartments] = useState<Department[]>(initialDepartments); // need to fetch from backend
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);

  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      alert('Invalid username or password');
      return false;
    }

    if (user.role === 'LECTURER' && !user.isActive) {
      alert('Account pending approval.');
      return false;
    }

    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData: Omit<User, 'id' | 'isActive'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`,
      isActive: userData.role !== 'LECTURER',
    };

    setUsers(prev => [...prev, newUser]);
    
    if (newUser.isActive) {
      setCurrentUser(newUser);
    } else {
      alert('Registration successful! Your account is pending approval.');
    }
  };

  const approveLecturer = (userId: string) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isActive: true } : user
      )
    );
  };

  const enrollInModule = (studentId: string, moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    
    if (!module) {
      alert('Module not found');
      return false;
    }

    if (module.enrolledCount >= module.limit) {
      alert('Module is full');
      return false;
    }

    if (isStudentEnrolled(studentId, moduleId)) {
      alert('Already enrolled in this module');
      return false;
    }


    const newEnrollment: Enrollment = {
      id: `e${Date.now()}`,
      studentId,
      moduleId,
      // enrolledAt: new Date().toISOString(),
    };

    setEnrollments(prev => [...prev, newEnrollment]);
    

    setModules(prev =>
      prev.map(m =>
        m.id === moduleId ? { ...m, enrolledCount: m.enrolledCount + 1 } : m
      )
    );

    return true;
  };

  const getDepartmentModules = (departmentId: string): Module[] => {
    return modules.filter(m => m.departmentId === departmentId);
  };

  const getDepartmentLecturers = (departmentId: string): User[] => {
    return users.filter(u => u.role === 'LECTURER' && u.departmentId === departmentId);
  };

  const createDepartment = (name: string): Department => {
    const newDepartment: Department = {
      id: `dept_${Date.now()}`,
      name
    };
    setDepartments([...departments, newDepartment]);
    return newDepartment;
  };

  const createModule = (moduleData: { code: string; name: string; departmentId: string; lecturerId: string; limit: number }): Module => {
    const newModule: Module = {
      id: `m_${Date.now()}`,
      code: moduleData.code,
      name: moduleData.name,
      departmentId: moduleData.departmentId,
      lecturerId: moduleData.lecturerId,
      limit: moduleData.limit,
      enrolledCount: 0
    };
    setModules([...modules, newModule]);
    return newModule;
  };

  const assignLecturer = (moduleId: string, lecturerId: string): boolean => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return false;

    const updatedModules = [...modules];
    updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], lecturerId };
    setModules(updatedModules);
    return true;
  };

  const getStudentEnrollments = (studentId: string): Enrollment[] => {
    return enrollments.filter(e => e.studentId === studentId);
  };

  const getLecturerModules = (lecturerId: string): Module[] => {
    return modules.filter(m => m.lecturerId === lecturerId);
  };

  const isStudentEnrolled = (studentId: string, moduleId: string): boolean => {
    return enrollments.some(e => e.studentId === studentId && e.moduleId === moduleId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        departments,
        modules,
        enrollments,
        login,
        logout,
        register,
        approveLecturer,
        enrollInModule,
        getDepartmentModules,
        getDepartmentLecturers,
        getStudentEnrollments,
        getLecturerModules,
        isStudentEnrolled,
        createDepartment,
        createModule,
        assignLecturer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
