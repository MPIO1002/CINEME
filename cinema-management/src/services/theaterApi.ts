import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      // localStorage.removeItem('authToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Room {
  id: string;
  name: string;
  type: string;
}

export interface Theater {
  id?: string;
  nameEn: string;
  nameVn: string;
  address?: string;
  phone?: string;
  email?: string;
  totalRooms?: number;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  rooms?: Room[];
  utilization?: number;
  monthlyRevenue?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Theater API functions
export const theaterApi = {
  // Get all theaters
  getAllTheaters: async (): Promise<ApiResponse<Theater[]>> => {
    const response = await api.get<ApiResponse<Theater[]>>('/theaters');
    return response.data;
  },

  // Get theater by ID
  getTheaterById: async (id: string): Promise<ApiResponse<Theater>> => {
    const response = await api.get<ApiResponse<Theater>>(`/theaters/${id}`);
    return response.data;
  },

  // Get rooms for a theater
  getTheaterRooms: async (theaterId: string): Promise<ApiResponse<Room[]>> => {
    const response = await api.get<ApiResponse<Room[]>>(`/theaters/${theaterId}/rooms`);
    return response.data;
  },

  // Create new theater
  createTheater: async (theater: Omit<Theater, 'id'>): Promise<ApiResponse<Theater>> => {
    const response = await api.post<ApiResponse<Theater>>('/theaters', {
      nameEn: theater.nameEn,
      nameVn: theater.nameVn,
      address: theater.address,
      phone: theater.phone,
      email: theater.email,
    });
    return response.data;
  },

  // Update theater
  updateTheater: async (id: string, theater: Partial<Theater>): Promise<ApiResponse<Theater>> => {
    const response = await api.put<ApiResponse<Theater>>(`/theaters/${id}`, {
      nameEn: theater.nameEn,
      nameVn: theater.nameVn,
      address: theater.address,
      phone: theater.phone,
      email: theater.email,
    });
    return response.data;
  },

  // Delete theater
  deleteTheater: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/theaters/${id}`);
    return response.data;
  },
};

export default api;
