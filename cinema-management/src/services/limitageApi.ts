import api from '@/lib/axios';

// limitage interface
export interface Limitage {
    id: string;
    nameVn: string;
    nameEn: string;
    descVn: string;
    descEn: string;
}

// API Functions
export const limitageApiService = {
    // Get all limitages
    getAllLimitages: async () => {
        try {
            const response = await api.get('/limit-age');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error fetching limitages:', error);
            throw error;
        }
    },

    // Get limitage by ID
    getLimitageById: async (id: string) => {
        try {
            const response = await api.get(`/limit-age/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`❌ Error fetching limitage ${id}:`, error);
            throw error;
        }
    },

    // Create new limitage
    createLimitage: async (limitage: Limitage) => {
        try {
            const response = await api.post('/limit-age', limitage);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating limitage:', error);
            throw error;
        }
    },

    // Update limitage
    updateLimitage: async (id: string, limitage: Limitage) => {
        try {
            const response = await api.put(`/limit-age/${id}`, limitage);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating limitage ${id}:`, error);
            throw error;
        }
    },

    // Delete limitage
    deleteLimitage: async (id: string) => {
        try {
            const response = await api.delete(`/limit-age/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting limitage ${id}:`, error);
            throw error;
        }
    },
};

export default limitageApiService;
