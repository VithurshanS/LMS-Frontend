import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UserManager } from 'oidc-client-ts';
import { User, Module, Department, Enrollment, RegistrationRequest } from '../types';
import { 
  departments as initialDepartments, 
  users as initialUsers, 
  modules as initialModules, 
  enrollments as initialEnrollments 
} from '../data/mockData';


import { UserManagerSettings } from 'oidc-client-ts';
import { getAllDepartmentsPublic, GetUser, registerUser } from '../api/api';

export const oidcConfig: UserManagerSettings = {
  authority: 'http://localhost:8080/realms/ironone',
  client_id: 'lms-frontend',
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  silent_redirect_uri: window.location.origin + '/silent-callback.html',
  post_logout_redirect_uri: window.location.origin,
};



interface AuthContextType {
  currentUser: User | null;
  users: User[];
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  modules: Module[];
  enrollments: Enrollment[];
  loginWithOidc: () => Promise<void>;
  logout: () => void;
  register: (userData: RegistrationRequest) => Promise<boolean>;
  isLoading: boolean;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userManager] = useState(() => new UserManager(oidcConfig));
  const didProcessCallback = useRef(false);
  
  useEffect(() => {
    const fetchDepartments = async ()=>{
      const depts = await getAllDepartmentsPublic();
      setDepartments(depts);
    }
    const initAuth = async () => {
      try {
        setIsLoading(true);
        if (window.location.pathname === '/callback') {
          if (didProcessCallback.current) {
             return;
          }
          didProcessCallback.current = true;

          try {
            await userManager.signinRedirectCallback();
            window.history.replaceState({}, document.title, '/');
            
            const user = await GetUser();
            if (user) {
              setCurrentUser(user);
            }
            return;
          } catch (error) {
            console.error('Signin callback error:', error);
            setIsLoading(false);
            return;
          }
        }
        const storedUser = await userManager.getUser();
        
        if (storedUser && !storedUser.expired) {
          const user = await GetUser();
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
    fetchDepartments();
  }, [userManager]);

  const loginWithOidc = async (): Promise<void> => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('OIDC login error:', error);
      throw error;
    }
  };


  const logout = () => {
    setCurrentUser(null);
    sessionStorage.clear();
    userManager.signoutRedirect();
  };

  const register = async (userData: RegistrationRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const success = await registerUser(userData);
      setIsLoading(false);
      if (success) {
        alert('Registration successful! Please login.');
      } else {
        alert('Registration failed. Please try again.');
      }
      return success;
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
      return false;
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
        setDepartments,
        modules,
        enrollments,
        loginWithOidc,
        logout,
        register,
        isLoading,
        setUsers,
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
