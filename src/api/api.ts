import apiClient from './axiosConfig';
import { User, RegistrationRequest, Department, Module, AssignmentRequest,ModuleCreationRequest } from '../types';


export const GetUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/auth/getuser');
    return response.data;
  } catch (error) {
    console.error('Failed to get user:', error);
    return null;
  }
};

export const registerUser = async (userData: RegistrationRequest): Promise<boolean> => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Failed to register user:', error);
    return false;
  }


};

export const getAllDepartments = async ():Promise<Department[]> => {
    try {
        const response = await apiClient.get('/api/admin/get-all-dept');
        return response.data;
    } catch (error){
        return [];
    }
}

export const getAllDepartmentsPublic = async ():Promise<Department[]> => {
    try {
        const response = await apiClient.get('/auth/get-all-dept');
        return response.data;
    } catch (error){
        return [];
    }
}

export const getAllLecturers = async ():Promise<User[]> => {
    try{
        const response = await apiClient.get('/api/admin/all-lecturers')
        return response.data;

    } catch(error){
        console.log(error);
        return []
    }
}

export const getAllDepartmentLecturers = async(departmentId:string):Promise<User[]> => {
    try{
        const response = await apiClient.get(`/api/admin/lecturers-by-dept/${departmentId}`);
        return response.data;
    } catch(error){
        console.log(error);
        return []
    }
}

export const getAllDepartmentStudents = async(departmentId:string):Promise<User[]> => {
    try{
        const response = await apiClient.get(`/api/admin/students-by-dept/${departmentId}`);
        return response.data;
    } catch(error){
        console.log(error);
        return []
    }
}

export const getAllStudents = async ():Promise<User[]> => {
    try{
        const response = await apiClient.get('/api/admin/all-students');
        return response.data;

    } catch(error){
        console.log(error);
        return []
    }
}

export const getDeptModuleDetails = async(departmentId:string):Promise<Module[]> => {
    try{
        const response = await apiClient.get(`/api/admin/getmodule-dept/${departmentId}`);
        return response.data;
    } catch(error){
        console.log(error);
        return []
    }

}
export const getLecturerById = async (lecturerId: string): Promise<User | null> => {
    try {
        const response = await apiClient.get(`/api/admin/lecturer/${lecturerId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get lecturer:', error);
        return null;
    }
}

export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
    try {
        const response = await apiClient.get(`/api/admin/department/${departmentId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get department:', error);
        return null;
    }
}

export const getEnrolledStudentsByModuleId = async (moduleId: string): Promise<User[]> => {
    try {
        const response = await apiClient.get(`/api/student/students-by-module/${moduleId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get enrolled students:', error);
        return [];
    }
}

export const assignLecturerToModule = async (assignmentRequest: AssignmentRequest): Promise<boolean> => {
    try {
        const response = await apiClient.patch(`/api/admin/assign-lecturer`,assignmentRequest);
        console.log(response);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Failed to assign lecturer to module:', error);
        return false;
    }
}

export const getModulesbyLecturerId = async (lecturerId: string): Promise<Module[]> => {
    try {
        const response = await apiClient.get(`/api/lecturer/getmodule-lect/${lecturerId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get modules by lecturer:', error);
        return [];
    }
}

export const getModulebyStudentId = async (studentId: string): Promise<Module[]> => {
    try {
        const response = await apiClient.get(`/api/student/enrollments/${studentId}`);
        console.log('Modules by student response:', response);
        return response.data;
    } catch (error) {
        console.error('Failed to get modules by student:', error);
        return [];
    }
}

export const createModule = async (moduleData: ModuleCreationRequest): Promise<Module | null> => {
    try {
        const response = await apiClient.post('/api/admin/create-module', moduleData);
        if (response.status === 201){
            console.log('Module created successfully:', response.data);
            return response.data;
        }
        return response.data;
    } catch (error) {
        console.error('Failed to create module:', error);
        return null;
    }
}

export const createDepartment = async (name: string): Promise<Department | null> => {
    try {
        const response = await apiClient.post('/api/admin/create-dept', { name });
        if (response.status === 201){
            console.log('Department created successfully:', response.data);
            return response.data;
        }
        return response.data;
    } catch (error) {
        console.error('Failed to create department:', error);
        return null;
    }
}

export const approveLecturer = async (lecturerId: string): Promise<boolean> => {
    try {
        const response = await apiClient.patch(`/api/admin/approve-lecturer/`, { lecturerId });
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Failed to approve lecturer:', error);
        return false;
    }
}