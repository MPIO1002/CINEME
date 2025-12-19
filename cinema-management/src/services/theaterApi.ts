import api from '@/lib/axios';

// Types
export interface Room {
    id: string;
    name: string;
    type: string;
}

export interface Theater {
    id?: string;
    nameEn: string;
    nameVn: string;
    address?: string;
    phone?: string;
    email?: string;
    totalRooms?: number;
    status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
    rooms?: Room[];
    utilization?: number;
    monthlyRevenue?: number;
    latitude?: number;
    longitude?: number;
}

// Theater API functions
export const theaterApi = {
    // Get all theaters
    getAllTheaters: async () => {
        const response = await api.get('/theaters');
        return response.data;
    },

    // Get theater by ID
    getTheaterById: async (id: string) => {
        const response = await api.get(`/theaters/${id}`);
        return response.data;
    },

    // Get rooms for a theater
    getTheaterRooms: async (theaterId: string) => {
        const response = await api.get(`/theaters/${theaterId}/rooms`);
        return response.data;
    },

    // Create new theater
    createTheater: async (theater: Theater) => {
        const response = await api.post('/theaters', {
            nameEn: theater.nameEn,
            nameVn: theater.nameVn,
            address: theater.address,
            phone: theater.phone,
            email: theater.email,
        });
        return response.data;
    },

    // Update theater
    // updateTheater: async (id: string, theater: Theater) => {
    //     const response = await api.put(`/theaters/${id}`, {
    //     nameEn: theater.nameEn,
    //     nameVn: theater.nameVn,
    //     address: theater.address,
    //     phone: theater.phone,
    //     email: theater.email,
    //     });
    //     return response.data;
    // },

    // Delete theater
    // deleteTheater: async (id: string) => {
    //     const response = await api.delete(`/theaters/${id}`);
    //     return response.data;
    // },
};

export default api;
