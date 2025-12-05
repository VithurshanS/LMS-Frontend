import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { User, Department, RegistrationRequest } from '../types';
import { getAllDepartments, GetUser, registerUser } from '../api/api';

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
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  loginWithOidc: () => Promise<void>;
  logout: () => void;
  register: (userData: RegistrationRequest) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userManager] = useState(() => new UserManager(oidcConfig));
  const didProcessCallback = useRef(false);
  
  useEffect(() => {
    const fetchDepartments = async ()=>{
      const depts = await getAllDepartments();
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
      alert('Registration failed. Please try again.');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        departments,
        setDepartments,
        loginWithOidc,
        logout,
        register,
        isLoading,
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
