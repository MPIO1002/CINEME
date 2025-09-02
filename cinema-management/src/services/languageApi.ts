import axios, { type AxiosResponse } from 'axios';

// Language interface
export interface Language {
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
const languageApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
languageApi.interceptors.request.use(
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
languageApi.interceptors.response.use(
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
export const languageApiService = {
  // Get all languages
  getAllLanguages: async (): Promise<Language[]> => {
    try {
      console.log('🌍 Fetching all languages...');
      const response: AxiosResponse<ApiResponse<Language[]>> = await languageApi.get('/languages');
      
      console.log('📡 Languages API response:', response.data);
      console.log('🔢 Number of languages:', response.data.data?.length || 0);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching languages:', error);
      throw error;
    }
  },

  // Get language by ID
  getLanguageById: async (id: string): Promise<Language> => {
    try {
      console.log(`🌍 Fetching language by ID: ${id}`);
      const response: AxiosResponse<ApiResponse<Language>> = await languageApi.get(`/languages/${id}`);
      
      console.log('📡 Language detail response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error fetching language ${id}:`, error);
      throw error;
    }
  },

  // Create new language
  createLanguage: async (language: Omit<Language, 'id'>): Promise<ApiResponse<Language>> => {
    try {
      console.log('🌍 Creating new language:', language);
      
      const response: AxiosResponse<ApiResponse<Language>> = await languageApi.post('/languages', language);
      
      console.log('✅ Language created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating language:', error);
      throw error;
    }
  },

  // Update language
  updateLanguage: async (id: string, language: Omit<Language, 'id'>): Promise<ApiResponse<Language>> => {
    try {
      console.log(`🌍 Updating language ${id}:`, language);
      
      const response: AxiosResponse<ApiResponse<Language>> = await languageApi.put(`/languages/${id}`, language);
      
      console.log('✅ Language updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating language ${id}:`, error);
      throw error;
    }
  },

  // Delete language
  deleteLanguage: async (id: string): Promise<ApiResponse<string>> => {
    try {
      console.log(`🌍 Deleting language: ${id}`);
      
      const response: AxiosResponse<ApiResponse<string>> = await languageApi.delete(`/languages/${id}`);
      
      console.log('✅ Language deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting language ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Delete failed - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
};

export default languageApiService;
