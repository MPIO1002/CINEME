import api from '@/lib/axios';

export interface Rank {
    id?: string;
    name: string;
    minAmount: number;
    discountPercentage: number;
}

interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const rankApiService = {
    // Get all ranks
    getAllRanks: async (): Promise<Rank[]> => {
        try {
            const response = await api.get<ApiResponse<Rank[]>>('/ranks');
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch ranks');
            }
        } catch (error) {
            console.error('Error fetching ranks:', error);
            throw error;
        }
    },

    // Get rank by ID
    getRankById: async (id: string): Promise<Rank> => {
        try {
            const response = await api.get<ApiResponse<Rank>>(`/ranks/${id}`);
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch rank');
            }
        } catch (error) {
            console.error('Error fetching rank:', error);
            throw error;
        }
    },

    // Create new rank
    createRank: async (rankData: Omit<Rank, 'id'>): Promise<Rank> => {
        try {
            const response = await api.post<ApiResponse<Rank>>('/ranks', rankData);
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create rank');
            }
        } catch (error) {
            console.error('Error creating rank:', error);
            throw error;
        }
    },

    // Update rank
    updateRank: async (id: string, rankData: Partial<Rank>): Promise<Rank> => {
        try {
            const response = await api.put<ApiResponse<Rank>>(`/ranks/${id}`, rankData);
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update rank');
            }
        } catch (error) {
            console.error('Error updating rank:', error);
            throw error;
        }
    },

    // Delete rank
    // deleteRank: async (id: string): Promise<void> => {
    //     try {
    //         const response = await api.delete<ApiResponse<null>>(`/ranks/${id}`);
    //         if (response.data.statusCode !== 200) {
    //             throw new Error(response.data.message || 'Failed to delete rank');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting rank:', error);
    //         throw error;
    //     }
    // },
};

export default rankApiService;
