import axios from "axios";
import { User } from "oidc-client-ts";

const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

const publicEndpoints = ['/auth/register', '/auth/login', '/auth/sample'];

apiClient.interceptors.request.use((config) => {
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
        // const manualToken = sessionStorage.getItem('access_token');
        // if (manualToken) {
        //     config.headers.Authorization = `Bearer ${manualToken}`;
        //     return config;
        // }
        const sessStorage = sessionStorage.getItem(`oidc.user:http://localhost:8080/realms/ironone:lms-iam`);
        if (sessStorage) {
            const user = User.fromStorageString(sessStorage);
            if (user && user.access_token) {
                config.headers.Authorization = `Bearer ${user.access_token}`;
            }
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;