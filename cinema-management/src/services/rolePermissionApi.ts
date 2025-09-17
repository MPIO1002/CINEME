import axios, { type AxiosResponse } from 'axios';

// Country interface
export interface Permission {
    key: string;
    label: string;
    description: string;
    category: 'USER' | 'MOVIE' | 'SHOWTIME' | 'ROOM' | 'THEATER' | 'SYSTEM' | 'BOOKING' | 'ACTOR';
    critical?: boolean;
}

export interface Role {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    permissions: string[];
    userCount: number;
}

export interface ApiPermission {
    key: string;
    name: string;
}

export interface ApiRole {
    name: string;
    permissions?: string[]; // Assume permissions are included in role data
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

// Create axios instance with default config
const rolePermissionApi = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
    timeout: 10000,
    headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    }
});

// Request interceptor
rolePermissionApi.interceptors.request.use(
    (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        
        // Add timestamp to bypass cache
        const separator = config.url?.includes('?') ? '&' : '?';
        config.url = `${config.url}${separator}_t=${Date.now()}`;
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
rolePermissionApi.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
    },
    (error) => {
        console.error('Response interceptor error:', error);
        if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        }
        return Promise.reject(error);
    }
);

export const rolePermissionApiService = {
  // Fetch all permissions
    getAllPermissions: async (): Promise<ApiPermission[]> => {
        const response: AxiosResponse<ApiResponse<ApiPermission[]>> = await rolePermissionApi.get('/permissions');
        return response.data.data;
    },

    // Fetch all roles
    getAllRoles: async (): Promise<ApiRole[]> => {
        const response: AxiosResponse<ApiResponse<ApiRole[]>> = await rolePermissionApi.get('/roles');
        return response.data.data;
    },
}
export default rolePermissionApiService;