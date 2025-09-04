import axios, { type AxiosResponse } from 'axios';
import type { Actor } from './actorApi';

// Unified Movie interface for both API and form usage
export interface Movie {
  id?: string; // Optional for new movies
  nameVn: string;
  nameEn: string;
  director: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string | File | ""; // API returns string, form accepts File
  trailer: string | File | ""; // API returns string, form accepts File
  status: string; // Auto-calculated based on releaseDate and endDate
  ratings?: string; // Optional
  time: number;
  // Additional fields needed for form (optional, filled when needed)
  countryId?: string;
  limitageId?: string;
  listActor?: Actor[];
}

// For backward compatibility - now just an alias
export type MovieListItem = Movie;

export interface MovieDetail {
  id: string;
  nameVn: string;
  nameEn: string;
  director: string;
  countryVn: string;
  countryEn: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string;
  trailer: string;
  status: string;
  ratings: string;
  time: number;
  limitageNameVn: string;
  limitageNameEn: string;
  listActor: Actor[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const movieApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  // Don't set default Content-Type to avoid conflicts with multipart/form-data
});

// Request interceptor
movieApi.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    console.log('Request data type:', config.data?.constructor.name);
    console.log('Initial headers:', config.headers);
    
    // Don't override headers for FormData - let axios handle it automatically
    if (config.data instanceof FormData) {
      console.log('FormData detected - letting axios set Content-Type automatically');
      // Remove any existing Content-Type header to let axios set it with boundary
      delete config.headers['Content-Type'];
    } else if (config.data && !config.headers['Content-Type']) {
      // Only set JSON content type for non-FormData requests
      config.headers['Content-Type'] = 'application/json';
    }
    
    console.log('Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
movieApi.interceptors.response.use(
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
export const movieApiService = {
  // Get all movies
  getAllMovies: async (): Promise<Movie[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Movie[]>> = await movieApi.get('/movies');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Get movie detail by ID
  getMovieDetail: async (id: string): Promise<MovieDetail> => {
    try {
      const response: AxiosResponse<ApiResponse<MovieDetail>> = await movieApi.get(`/movies/${id}/detail`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching movie detail for ID ${id}:`, error);
      throw error;
    }
  },

  // Create new movie
  createMovie: async (formData: FormData): Promise<ApiResponse<Movie>> => {
    try {
      console.log('Creating movie with FormData:', formData);
      
      // Log FormData contents for debugging
      console.log('=== FormData Debug ===');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== End FormData Debug ===');

      // Try the most basic approach - direct axios call with no custom config
      console.log('Starting upload...');
      const response = await axios({
        method: 'POST',
        url: 'http://localhost:8080/api/v1/movies',
        data: formData,
        timeout: 60000, // Reduce timeout to 60 seconds for faster feedback
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      
      console.log('=== Success Response ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('=== End Response ===');
      
      return response.data;
    } catch (error) {
      console.error('=== Error in createMovie ===');
      console.error('Error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
        
        // Try to get more detailed error info
        if (error.response.data) {
          console.error('Detailed error info:');
          console.error(JSON.stringify(error.response.data, null, 2));
        }
      }
      console.error('=== End Error Debug ===');
      throw error;
    }
  },

  // Update movie
  updateMovie: async (id: string, formData: FormData): Promise<ApiResponse<Movie>> => {
    try {
      console.log(`Updating movie ${id} with FormData:`, formData);
      
      const response = await movieApi.put(`/movies/${id}`, formData, {
        headers: {
          // Let axios set the Content-Type with boundary for multipart/form-data
          // Don't manually set Content-Type for FormData
        },
        timeout: 120000, // 2 minutes for file upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating movie ${id}:`, error);
      throw error;
    }
  },

  // Delete movie
  deleteMovie: async (id: string): Promise<ApiResponse<string>> => {
    try {
      console.log(`Attempting to delete movie with ID: ${id}`);
      const response = await movieApi.delete(`/movies/${id}`);
      console.log(`Successfully deleted movie ${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting movie ${id}:`, error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Delete failed - Status: ${error.response.status}, Message: ${error.response.data?.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  },
};

export default movieApiService;