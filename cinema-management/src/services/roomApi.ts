import api from '@/lib/axios';

// Room interface matching the API response
export interface Room {
    id?: string;
    name: string;
    type: string; // "Standard" from API
    location?: string;
    theaterId: string;
    theaterName?: string;
    totalSeats?: number;
    vipSeats?: number;
    standardSeats?: number;
    coupleSeats?: number;
    status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
    utilization?: number;
    monthlyRevenue?: number;
    seatLayout?: Seat[];
}

// Seat interface matching the API response
export interface Seat {
    color: string;
    id: string;
    seatNumber: string;
    seatType: string;
    row?: number;
    column?: number;
    status?: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
    isCouplePart?: boolean | undefined;
    couplePart?: number | undefined;
}

export interface SeatType {
    id?: string;
    name: string;
    desc: string;
    img: string;
    color: string;
    capacity: number;
}

export interface SeatPlacement {
    seatTypeId: string;
    startRow: string;
    endRow: string;
}

export interface RoomLayout {
    col: number;
    row: number;
    walkways: { columnIndex: number; rowIndex: number }[];
    seatPlacements: SeatPlacement[];
}

// Room API Service
export const roomApiService = {
    // Get all rooms
    getAllRooms: async () => {
        try {
            const response = await api.get(`/rooms`);
            
            if (response.data.statusCode === 200) {
                // Transform API data to match frontend interface
                return response.data.data.map((room: Room) => ({
                    ...room,
                    // Set default values for properties not in API
                    status: 'ACTIVE' as const,
                    totalSeats: 0, // Will be calculated from seats
                    vipSeats: 0,
                    standardSeats: 0,
                    coupleSeats: 0,
                    utilization: Math.floor(Math.random() * 100), // Mock data
                    monthlyRevenue: Math.floor(Math.random() * 500000000), // Mock data
                }));
            } else {
                throw new Error(response.data.message || 'Failed to fetch rooms');
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    // Get seats for a room
    getRoomSeats: async (roomId: string) => {
        try {
            const response = await api.get(`/rooms/${roomId}`);
            
            if (response.data.statusCode === 200) {
                return response.data.data.map((seat: Seat) => ({
                ...seat,
                status: 'AVAILABLE' as const,
                // Extract row and column from seatNumber (e.g., "A1" -> row: 1, column: 1)
                row: parseInt(seat.seatNumber.charAt(0)),
                column: parseInt(seat.seatNumber.slice(1)),
                }));
            } else {
                throw new Error(response.data.message || 'Failed to fetch seats');
            }
        } catch (error) {
            console.error('Error fetching seats:', error);
            throw error;
        }
    },

    // Create new room
    createRoom: async (theaterId: string, roomData: Room) => {
        try {
            const response = await api.post(`/theaters/${theaterId}/rooms`, roomData);
            
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create room');
            }
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    },

    updateRoomSeats: async (roomId: string, roomlayout: RoomLayout) => {
        try {
            const response = await api.post(`/rooms/${roomId}/seats`, roomlayout);

            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update seats');
            }
        } catch (error) {
            console.error('Error updating seats:', error);
            throw error;
        }
    },

    // Delete room
    // deleteRoom: async (roomId: string) => {
    //     try {
    //         const response = await api.delete(`/rooms/${roomId}`);
            
    //         if (response.data.statusCode !== 200) {
    //             throw new Error(response.data.message || 'Failed to delete room');
    //         }
    //     } catch (error) {
    //         console.error('Error deleting room:', error);
    //         throw error;
    //     }
    // },

    getSeatTypes: async (): Promise<SeatType[]> => {
        try {
            const response = await api.get(`/seat-types`);

            if (response.data.statusCode === 0) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch seat types');
            }
        } catch (error) {
            console.error('Error fetching seat types:', error);
            throw error;
        }
    },

    createSeatType: async (seatTypeData: SeatType) => {
        try {
            const response = await api.post(`/seat-types`, seatTypeData);
                if (response.data.statusCode === 0) {
                return response.data.data;
            }
                else {
                throw new Error(response.data.message || 'Failed to create seat type');
            }
        } catch (error) {
            console.error('Error creating seat type:', error);
            throw error;
        }
    },

    updateSeatType: async (seatTypeId: string, seatTypeData: SeatType) => {
        try {
            const response = await api.put(`/seat-types/${seatTypeId}`, seatTypeData);
            if (response.data.statusCode === 0) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update seat type');
            }
        } catch (error) {
            console.error('Error updating seat type:', error);
            throw error;
        }
    },

    deleteSeatType: async (seatTypeId: string) => {
        try {
            const response = await api.delete(`/seat-types/${seatTypeId}`);

            if (response.data.statusCode !== 0) {
                throw new Error(response.data.message || 'Failed to delete seat type');
            }
        } catch (error) {
            console.error('Error deleting seat type:', error);
            throw error;
        }
    },
};

export default roomApiService;