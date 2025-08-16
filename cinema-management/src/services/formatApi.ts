import axios, { type AxiosResponse } from 'axios';

// Format interface
export interface Format {
  id: string;
  nameVn: string;
  nameEn: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const formatApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
formatApi.interceptors.request.use(
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
formatApi.interceptors.response.use(
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

// API Functions
export const formatApiService = {
  // Get all formats
  getAllFormats: async (): Promise<Format[]> => {
    try {
      console.log('🌍 Fetching all formats...');
      const response: AxiosResponse<ApiResponse<Format[]>> = await formatApi.get('/formats');

      console.log('📡 Formats API response:', response.data);
      console.log('🔢 Number of formats:', response.data.data?.length || 0);

      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching formats:', error);
      throw error;
    }
  },

  // Get format by ID
  getFormatById: async (id: string): Promise<Format> => {
    try {
      console.log(`🌍 Fetching format by ID: ${id}`);
      const response: AxiosResponse<ApiResponse<Format>> = await formatApi.get(`/formats/${id}`);

      console.log('📡 Format detail response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error fetching format ${id}:`, error);
      throw error;
    }
  },

  // Create new format
  createFormat: async (format: Omit<Format, 'id'>): Promise<ApiResponse<Format>> => {
    try {
      console.log('🌍 Creating new format:', format);

      const response: AxiosResponse<ApiResponse<Format>> = await formatApi.post('/formats', format);
      
      console.log('✅ Format created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating format:', error);
      throw error;
    }
  },

  // Update format
  updateFormat: async (id: string, format: Omit<Format, 'id'>): Promise<ApiResponse<Format>> => {
    try {
      console.log(`🌍 Updating format ${id}:`, format);
      
      const response: AxiosResponse<ApiResponse<Format>> = await formatApi.put(`/formats/${id}`, format);
      
      console.log('✅ Format updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating format ${id}:`, error);
      throw error;
    }
  },

  // Delete format
  deleteFormat: async (id: string): Promise<ApiResponse<string>> => {
    try {
      console.log(`🌍 Deleting format: ${id}`);

      const response: AxiosResponse<ApiResponse<string>> = await formatApi.delete(`/formats/${id}`);
      
      console.log('✅ Format deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting format ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Delete failed - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
};

export default formatApiService;
