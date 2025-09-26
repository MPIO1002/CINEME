import axios, { type AxiosResponse } from 'axios';

// Login interface
export interface Login {
  email: string;
  password: string;
}

// User data interface for login response
export interface UserData {
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
  permissions: string[];
}

export interface Register {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  roleId: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const authApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
authApi.interceptors.request.use(
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
authApi.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    console.error('Response interceptor error:', error);
    
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry, thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Gọi API refresh token
          const refreshResponse = await axios.post(`${authApi.defaults.baseURL}/auth/refresh`, {
            refreshToken
          });
          
          if (refreshResponse.data.statusCode === 200) {
            const newTokens = refreshResponse.data.data;
            
            // Lưu tokens mới
            localStorage.setItem('accessToken', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);
            
            // Cập nhật header cho request gốc
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            
            // Retry request gốc
            return authApi(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Nếu refresh thất bại, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApiService = {
  login: (userData: Login): Promise<AxiosResponse<ApiResponse<UserData>>> => {
    return authApi.post('/auth/login', userData);
  },
  register: (userData: Register): Promise<AxiosResponse<ApiResponse<null>>> => {
    return authApi.post('/auth/register', userData);
  }
};

export default authApi;