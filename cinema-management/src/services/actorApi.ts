import axios, { type AxiosResponse } from 'axios';

// Movie interface for actor's movie list
export interface MovieInActor {
  id: string;
  nameVn: string;
  nameEn: string;
  image: string;
}

// Actor interface
export interface Actor {
  id?: string;
  name: string;
  img: string | File;
  dateOfBirth?: string;
  nationality?: string;
  biography?: string;
//   createdAt?: string;
//   updatedAt?: string;
  listMovie?: MovieInActor[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const actorApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
});

// Request interceptor
actorApi.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    
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
actorApi.interceptors.response.use(
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
export const actorApiService = {
  // Get all actors with pagination
  getAllActors: async (): Promise<Actor[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Actor[]>> = await actorApi.get(`/actors`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching actors:', error);
      throw error;
    }
  },

  // Get actor detail by ID
  getActorDetail: async (id: string): Promise<Actor> => {
    try {
      const response: AxiosResponse<ApiResponse<Actor>> = await actorApi.get(`/actors/${id}/detail`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching actor detail for ID ${id}:`, error);
      throw error;
    }
  },

  // Create new actor
  createActor: async (actorData: Actor): Promise<ApiResponse<Actor>> => {
    try {
      const formData = new FormData();
      
      console.log('Creating actor with data:', actorData);
      console.log('Avatar type:', typeof actorData.img, actorData.img instanceof File ? 'File' : 'String');
      
      // Append actor data to FormData
      formData.append('name', actorData.name);
      if (actorData.dateOfBirth) formData.append('dateOfBirth', actorData.dateOfBirth);
      if (actorData.nationality) formData.append('nationality', actorData.nationality);
      if (actorData.biography) formData.append('biography', actorData.biography);
      
      // Handle img - can be File or string
      if (actorData.img) {
        if (actorData.img instanceof File) {
          formData.append('img', actorData.img);
          console.log('Added File to FormData:', actorData.img.name);
        } else if (typeof actorData.img === 'string') {
          formData.append('avatarUrl', actorData.img);
          console.log('Added img URL to FormData:', actorData.img);
        }
      }

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

      const response = await actorApi.post('/actors', formData, {
        timeout: 60000, // 1 minute for file upload
      });
      return response.data;
    } catch (error) {
      console.error('Error creating actor:', error);
      throw error;
    }
  },

  // Update actor
  updateActor: async (id: string, actorData: Actor): Promise<ApiResponse<Actor>> => {
    try {
      const formData = new FormData();
      
      console.log('Updating actor with data:', actorData);
      console.log('Avatar type:', typeof actorData.img, actorData.img instanceof File ? 'File' : 'String');
      
      // Append actor data to FormData
      formData.append('name', actorData.name);
      if (actorData.dateOfBirth) formData.append('dateOfBirth', actorData.dateOfBirth);
      if (actorData.nationality) formData.append('nationality', actorData.nationality);
      if (actorData.biography) formData.append('biography', actorData.biography);
      
      // Handle img - can be File or string
      if (actorData.img) {
        if (actorData.img instanceof File) {
          formData.append('img', actorData.img);
          console.log('Added File to FormData for update:', actorData.img.name);
        } else if (typeof actorData.img === 'string') {
          formData.append('avatarUrl', actorData.img);
          console.log('Added img URL to FormData for update:', actorData.img);
        }
      }

      // Log FormData contents for debugging
      console.log('=== Update FormData Debug ===');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      console.log('=== End Update FormData Debug ===');

      const response = await actorApi.put(`/actors/${id}`, formData, {
        timeout: 60000, // 1 minute for file upload
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating actor ${id}:`, error);
      throw error;
    }
  },

  // Delete actor
  deleteActor: async (id: string): Promise<ApiResponse<string>> => {
    try {
      const response = await actorApi.delete(`/actors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting actor ${id}:`, error);
      throw error;
    }
  },
};

export default actorApiService;
