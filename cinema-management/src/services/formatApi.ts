import api from '@/lib/axios';

// Format interface
export interface Format {
    id: string;
    nameVn: string;
    nameEn: string;
}

// API Functions
export const formatApiService = {
    // Get all formats
    getAllFormats: async () => {
        try {
            const response = await api.get('/formats');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error fetching formats:', error);
            throw error;
        }
    },

    // Get format by ID
    getFormatById: async (id: string) => {
        try {
            const response = await api.get(`/formats/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`❌ Error fetching format ${id}:`, error);
            throw error;
        }
    },

    // Create new format
    createFormat: async (format: Format) => {
        try {
            const response = await api.post('/formats', format);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating format:', error);
            throw error;
        }
    },

    // Update format
    updateFormat: async (id: string, format: Format) => {
        try {
            const response = await api.put(`/formats/${id}`, format);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating format ${id}:`, error);
            throw error;
        }
    },

    // Delete format
    deleteFormat: async (id: string) => {
        try {
            const response = await api.delete(`/formats/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting format ${id}:`, error);
            throw error;
        }
    },
};

export default formatApiService;
