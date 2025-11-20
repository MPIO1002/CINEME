import api from '@/lib/axios';
import type { Actor } from './actorApi';
import type { Genre } from './genreApi';

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
    listGenre?: Genre[];
}

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
    listGenre: Genre[];
}

// API Functions
export const movieApiService = {
    // Get all movies
    getAllMovies: async () => {
        try {
            const response = await api.get('/movies');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching movies:', error);
            throw error;
        }
    },

    getMoviesByTheaterAndDate: async (theaterId: string, date: string) => {
        try {
            const response = await api.get(`/schedules/search?theaterId=${theaterId}&date=${date}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching movies for theater ${theaterId} on date ${date}:`, error);
            throw error;
        }
    },

    // Get movie detail by ID
    getMovieDetail: async (id: string) => {
        try {
            const response = await api.get(`/movies/${id}/detail`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching movie detail for ID ${id}:`, error);
            throw error;
        }
    },

    // Create new movie
    createMovie: async (formData: FormData) => {
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
            const response = await api.post('/movies', formData, {
                timeout: 120000, // 2 minutes for file upload
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
            
            console.error('=== End Error Debug ===');
            throw error;
        }
    },

    // Update movie
    updateMovie: async (id: string, formData: FormData) => {
        try {
            console.log(`Updating movie ${id} with FormData:`, formData);
            
            const response = await api.put(`/movies/${id}`, formData, {
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
    deleteMovie: async (id: string) => {
        try {
            console.log(`Attempting to delete movie with ID: ${id}`);
            const response = await api.delete(`/movies/${id}`);
            console.log(`Successfully deleted movie ${id}`);
        return response.data;
        } catch (error) {
            console.error(`Error deleting movie ${id}:`, error);
            throw error;
        }
    },
};

export default movieApiService;