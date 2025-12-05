import apiClient from './axiosConfig';
import { User, RegistrationRequest, Department, Module, AssignmentRequest,ModuleCreationRequest,EnrollmentRequest,ControllUserRequest } from '../types';


export const GetUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/getuser');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const registerUser = async (userData: RegistrationRequest): Promise<boolean> => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
};

export const getAllDepartments = async ():Promise<Department[]> => {
    try {
        const response = await apiClient.get('/api/department/all');
        return response.data;
    } catch (error){
        return [];
    }
}



export const getAllLecturers = async ():Promise<User[]> => {
    try{
        const response = await apiClient.get('/api/lecturer/all')
        return response.data;

    } catch(error){
        return []
    }
}

export const getAllDepartmentLecturers = async(departmentId:string):Promise<User[]> => {
    try{
        const response = await apiClient.get(`/api/lecturer/departmentId/${departmentId}`);
        return response.data;
    } catch(error){
        return []
    }
}

export const getAllDepartmentStudents = async(departmentId:string):Promise<User[]> => {
    try{
        const response = await apiClient.get(`/api/student/departmentId/${departmentId}`);
        return response.data;
    } catch(error){
        return []
    }
}

export const getAllStudents = async ():Promise<User[]> => {
    try{
        const response = await apiClient.get('/api/student/all');
        return response.data;

    } catch(error){
        return []
    }
}

export const getDeptModuleDetails = async(departmentId:string):Promise<Module[]> => {
    try{
        const response = await apiClient.get(`/api/module/departmentId/${departmentId}`);
        return response.data;
    } catch(error){
        return []
    }
}
export const getLecturerById = async (lecturerId: string): Promise<User | null> => {
    try {
        const response = await apiClient.get(`/api/lecturer/id/${lecturerId}`);
        return response.data;
    } catch (error) {
        return null;
    }
}

export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
    try {
        const response = await apiClient.get(`/api/department/id/${departmentId}`);
        return response.data;
    } catch (error) {
        return null;
    }
}

export const getEnrolledStudentsByModuleId = async (moduleId: string): Promise<User[]> => {
    try {
        const response = await apiClient.get(`/api/student/moduleId/${moduleId}`);
        return response.data;
    } catch (error) {
        return [];
    }
}

export const assignLecturerToModule = async (assignmentRequest: AssignmentRequest): Promise<boolean> => {
    try {
        const response = await apiClient.patch(`/api/module/assignLecturer`,assignmentRequest);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
}

export const getModulesbyLecturerId = async (lecturerId: string): Promise<Module[]> => {
    try {
        const response = await apiClient.get(`/api/module/lecturerId/${lecturerId}`);
        return response.data;
    } catch (error) {
        return [];
    }
}

export const getModulebyStudentId = async (studentId: string): Promise<Module[]> => {
    try {
        const response = await apiClient.get(`/api/module/studentId/${studentId}`);
        return response.data;
    } catch (error) {
        return [];
    }
}

export const createModule = async (moduleData: ModuleCreationRequest): Promise<Module | null> => {
    try {
        const response = await apiClient.post('/api/module/create', moduleData);
        if (response.status === 201){
            return response.data;
        }
        return response.data;
    } catch (error) {
        return null;
    }
}

export const createDepartment = async (name: string): Promise<Department | null> => {
    try {
        const response = await apiClient.post('/api/department/create', { name });
        if (response.status === 201){
            return response.data;
        }
        return response.data;
    } catch (error) {
        return null;
    }
}



export const enrolltoModule = async (enrollmentRequest: EnrollmentRequest): Promise<boolean> => {
    try {
        const response = await apiClient.post(`/api/enrollment/enroll`, enrollmentRequest);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }       
}

export const controlUserAccess = async (controlRequest: ControllUserRequest): Promise<boolean> => {
    try {
        const response = await apiClient.patch(`/auth/control`, controlRequest);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
}

export const unerrollFromModule = async (enrollmentRequest: EnrollmentRequest): Promise<boolean> => {
    try {
        const response = await apiClient.delete(`/api/enrollment/unenroll`, { data: enrollmentRequest });
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
}