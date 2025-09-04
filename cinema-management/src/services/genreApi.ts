import axios, { type AxiosResponse } from 'axios';

// Genre interface
export interface Genre {
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
const genreApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// Request interceptor
genreApi.interceptors.request.use(
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
genreApi.interceptors.response.use(
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
export const genreApiService = {
  // Get all genres
  getAllGenres: async (): Promise<Genre[]> => {
    try {
      console.log('🎭 Fetching all genres...');
      const response: AxiosResponse<ApiResponse<Genre[]>> = await genreApi.get('/genres');
      
      console.log('📡 Genres API response:', response.data);
      console.log('🔢 Number of genres:', response.data.data?.length || 0);
      
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching genres:', error);
      throw error;
    }
  },

  // Get genre by ID
  getGenreById: async (id: string): Promise<Genre> => {
    try {
      console.log(`🎭 Fetching genre by ID: ${id}`);
      const response: AxiosResponse<ApiResponse<Genre>> = await genreApi.get(`/genres/${id}`);
      
      console.log('📡 Genre detail response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`❌ Error fetching genre ${id}:`, error);
      throw error;
    }
  },

  // Create new genre
  createGenre: async (genre: Omit<Genre, 'id'>): Promise<ApiResponse<Genre>> => {
    try {
      console.log('🎭 Creating new genre:', genre);
      
      const response: AxiosResponse<ApiResponse<Genre>> = await genreApi.post('/genres', genre);
      
      console.log('✅ Genre created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating genre:', error);
      throw error;
    }
  },

  // Update genre
  updateGenre: async (id: string, genre: Omit<Genre, 'id'>): Promise<ApiResponse<Genre>> => {
    try {
      console.log(`🎭 Updating genre ${id}:`, genre);
      
      const response: AxiosResponse<ApiResponse<Genre>> = await genreApi.put(`/genres/${id}`, genre);
      
      console.log('✅ Genre updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating genre ${id}:`, error);
      throw error;
    }
  },

  // Delete genre
  deleteGenre: async (id: string): Promise<ApiResponse<string>> => {
    try {
      console.log(`🎭 Deleting genre: ${id}`);
      
      const response: AxiosResponse<ApiResponse<string>> = await genreApi.delete(`/genres/${id}`);
      
      console.log('✅ Genre deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting genre ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Delete failed - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
};

export default genreApiService;
