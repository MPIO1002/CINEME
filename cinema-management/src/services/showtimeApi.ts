import axios, { type AxiosResponse } from 'axios';

// Showtime interface based on API response
export interface Showtime {
  id?: string;
  movieId?: string;
  movieNameVn: string;
  movieNameEn?: string;
  theaterId?: string;
  theaterName?: string;
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:mm:ss"
  endTime: string; // Format: "HH:mm:ss"
  languageVn: string;
  languageEn: string;
  formatVn: string;
  formatEn: string;
  roomId: string;
  roomName: string;
  totalSeats?: number;
  availableSeats?: number;
  bookedSeats?: number;
  // Additional UI fields
  img?: string;
  ticketPrice?: number;
}

// Request interface for creating showtime
export interface CreateShowtimeRequest {
  movieId: string;
  theaterId: string;
  roomId: string;
  date: string; // Format: "YYYY-MM-DD"
  startTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  endTime: {
    hour: number;
    minute: number;
    second: number;
    nano: number;
  };
  // Temporarily optional to test basic functionality
  languageVn?: string;
  languageEn?: string;
  formatVn?: string;
  formatEn?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Create axios instance with default config
const showtimeApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
showtimeApi.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
showtimeApi.interceptors.response.use(
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

// Utility function to convert time string to time object
// Note: This function is now deprecated as backend expects string format directly
// const timeStringToObject = (timeString: string) => { ... }

// API functions
export const getAllShowtimes = async (): Promise<ApiResponse<Showtime[]>> => {
  try {
    const response: AxiosResponse<ApiResponse<Showtime[]>> = await showtimeApi.get('/showtimes/all');

    return response.data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
};

export const createShowtime = async (showtimeData: {
  movieId: string;
  theaterId: string;
  roomId: string;
  date: string; // "YYYY-MM-DD" format
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  languageVn?: string;
  languageEn?: string;
  formatVn?: string;
  formatEn?: string;
}): Promise<ApiResponse<Showtime>> => {
  try {
    console.log('Creating showtime with data:', showtimeData);
    
    // Backend expects LocalTime format as "HH:mm:ss" string
    const requestData = {
      movieId: showtimeData.movieId,
      theaterId: showtimeData.theaterId,
      roomId: showtimeData.roomId,
      date: showtimeData.date,
      startTime: showtimeData.startTime + ':00', // Convert "HH:mm" to "HH:mm:ss"
      endTime: showtimeData.endTime + ':00' // Convert "HH:mm" to "HH:mm:ss"
    };

    console.log('Request data being sent to API:', JSON.stringify(requestData, null, 2));
    console.log('Making POST request to /showtimes');

    const response: AxiosResponse<ApiResponse<Showtime>> = await showtimeApi.post('/showtimes', requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating showtime:', error);
    
    // Try to get more details from the error
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown } };
      if (axiosError.response?.data) {
        console.error('Full error response:', axiosError.response.data);
      }
    }
    
    throw error;
  }
};

// Update showtime interface for edit requests
export interface UpdateShowtimeRequest {
  movieId?: string;
  theaterId?: string;
  roomId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  languageVn?: string;
  languageEn?: string;
  formatVn?: string;
  formatEn?: string;
}

// Showtime edit validation response
export interface ShowtimeEditValidation {
  canEdit: boolean;
  canEditFields: string[];
  restrictedFields: string[];
  reasons: string[];
  warnings: string[];
}

export const validateShowtimeEdit = async (id: string): Promise<ApiResponse<ShowtimeEditValidation>> => {
  try {
    const response: AxiosResponse<ApiResponse<ShowtimeEditValidation>> = await showtimeApi.get(`/showtime/${id}/validate-edit`);
    return response.data;
  } catch (error) {
    console.error('Error validating showtime edit:', error);
    throw error;
  }
};

export const updateShowtime = async (
  id: string, 
  updateData: UpdateShowtimeRequest
): Promise<ApiResponse<Showtime>> => {
  try {
    console.log('Updating showtime with ID:', id);
    console.log('Update data:', updateData);

    // Build request data with proper string format for time fields
    const requestData: Record<string, string | undefined> = {
      movieId: updateData.movieId,
      theaterId: updateData.theaterId,
      roomId: updateData.roomId,
      date: updateData.date,
      languageVn: updateData.languageVn,
      languageEn: updateData.languageEn,
      formatVn: updateData.formatVn,
      formatEn: updateData.formatEn,
    };
    
    if (updateData.startTime) {
      requestData.startTime = updateData.startTime + ':00'; // Convert "HH:mm" to "HH:mm:ss"
    }
    
    if (updateData.endTime) {
      requestData.endTime = updateData.endTime + ':00'; // Convert "HH:mm" to "HH:mm:ss"
    }

    console.log('Formatted request data:', JSON.stringify(requestData, null, 2));

    const response: AxiosResponse<ApiResponse<Showtime>> = await showtimeApi.put(`/showtime/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error updating showtime:', error);
    
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as { response?: { data?: unknown } };
      if (axiosError.response?.data) {
        console.error('Full error response:', axiosError.response.data);
      }
    }
    
    throw error;
  }
};

export const deleteShowtime = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const response: AxiosResponse<ApiResponse<void>> = await showtimeApi.delete(`/showtime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting showtime:', error);
    throw error;
  }
};

export const getShowtimeById = async (id: string): Promise<ApiResponse<Showtime>> => {
  try {
    const response: AxiosResponse<ApiResponse<Showtime>> = await showtimeApi.get(`/showtime/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching showtime:', error);
    throw error;
  }
};

// Export the axios instance for direct use if needed
export { showtimeApi };
