import api from '@/lib/axios';

// Genre interface
export interface Genre {
  id: string;
  nameVn: string;
  nameEn: string;
}

// API Functions
export const genreApiService = {
    // Get all genres
    getAllGenres: async () => {
        try {
            const response = await api.get('/genres');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error fetching genres:', error);
            throw error;
        }
    },

    // Get genre by ID
    getGenreById: async (id: string) => {
        try {
            const response = await api.get(`/genres/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`❌ Error fetching genre ${id}:`, error);
            throw error;
        }
    },

    // Create new genre
    createGenre: async (genre: Genre) => {
        try {
            const response = await api.post('/genres', genre);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating genre:', error);
            throw error;
        }
    },

    // Update genre
    updateGenre: async (id: string, genre: Genre) => {
        try {
            const response = await api.put(`/genres/${id}`, genre);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating genre ${id}:`, error);
            throw error;
        }
    },

    // Delete genre
    deleteGenre: async (id: string) => {
        try {
            const response = await api.delete(`/genres/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting genre ${id}:`, error);
            throw error;
        }
    },
};

export default genreApiService;
