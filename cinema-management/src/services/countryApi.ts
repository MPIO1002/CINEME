import axios, { type AxiosResponse } from 'axios';

// Country interface
export interface Country {
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
const countryApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
countryApi.interceptors.request.use(
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
countryApi.interceptors.response.use(
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
export const countryApiService = {
  // Get all countries
  getAllCountries: async (): Promise<Country[]> => {
    try {
      console.log('🌍 Fetching all countries...');
      const response: AxiosResponse<ApiResponse<Country[]>> = await countryApi.get('/countries');
      
      console.log('📡 Countries API response:', response.data);
      console.log('🔢 Number of countries:', response.data.data?.length || 0);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching countries:', error);
      throw error;
    }
  },

  // Get country by ID
  getCountryById: async (id: string): Promise<Country> => {
    try {
      console.log(`🌍 Fetching country by ID: ${id}`);
      const response: AxiosResponse<ApiResponse<Country>> = await countryApi.get(`/countries/${id}`);
      
      console.log('📡 Country detail response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error fetching country ${id}:`, error);
      throw error;
    }
  },

  // Create new country
  createCountry: async (country: Omit<Country, 'id'>): Promise<ApiResponse<Country>> => {
    try {
      console.log('🌍 Creating new country:', country);
      
      const response: AxiosResponse<ApiResponse<Country>> = await countryApi.post('/countries', country);
      
      console.log('✅ Country created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating country:', error);
      throw error;
    }
  },

  // Update country
  updateCountry: async (id: string, country: Omit<Country, 'id'>): Promise<ApiResponse<Country>> => {
    try {
      console.log(`🌍 Updating country ${id}:`, country);
      
      const response: AxiosResponse<ApiResponse<Country>> = await countryApi.put(`/countries/${id}`, country);
      
      console.log('✅ Country updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating country ${id}:`, error);
      throw error;
    }
  },

  // Delete country
  deleteCountry: async (id: string): Promise<ApiResponse<string>> => {
    try {
      console.log(`🌍 Deleting country: ${id}`);
      
      const response: AxiosResponse<ApiResponse<string>> = await countryApi.delete(`/countries/${id}`);
      
      console.log('✅ Country deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting country ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Delete failed - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
};

export default countryApiService;
