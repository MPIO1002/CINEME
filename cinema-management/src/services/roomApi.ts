import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Room interface matching the API response
export interface Room {
  id?: string;
  name: string;
  type: string; // "Standard" from API
  location?: string;
  totalSeats?: number;
  vipSeats?: number;
  regularSeats?: number;
  coupleSeats?: number;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  screenSize?: string;
  screenResolution?: string;
  audioSystem?: string;
  hasAirCondition?: boolean;
  hasEmergencyExit?: boolean;
  hasDolbyAtmos?: boolean;
  has4K?: boolean;
  description?: string;
  utilization?: number;
  monthlyRevenue?: number;
  seatLayout?: Seat[];
}

// Seat interface matching the API response
export interface Seat {
  id?: string;
  seatNumber: string;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED';
  row?: string;
  column?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
  type?: 'regular' | 'vip' | 'couple' | 'disabled'; // For frontend mapping
}

// API Response interface
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Room API Service
export const roomApiService = {
  // Get all rooms
  getAllRooms: async (): Promise<Room[]> => {
    try {
      const response = await axios.get<ApiResponse<Room[]>>(`${API_BASE_URL}/rooms`);
      
      if (response.data.statusCode === 200) {
        // Transform API data to match frontend interface
        return response.data.data.map(room => ({
          ...room,
          // Map API type to frontend type
          type: mapRoomTypeFromApi(room.type),
          // Set default values for properties not in API
          status: 'ACTIVE' as const,
          screenSize: '15m x 8m',
          screenResolution: '4K',
          audioSystem: 'Dolby Digital',
          hasAirCondition: true,
          hasEmergencyExit: true,
          hasDolbyAtmos: false,
          has4K: true,
          totalSeats: 0, // Will be calculated from seats
          vipSeats: 0,
          regularSeats: 0,
          coupleSeats: 0,
          utilization: Math.floor(Math.random() * 100), // Mock data
          monthlyRevenue: Math.floor(Math.random() * 500000000), // Mock data
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Get seats for a room
  getRoomSeats: async (roomId: string): Promise<Seat[]> => {
    try {
      const response = await axios.get<ApiResponse<Seat[]>>(`${API_BASE_URL}/rooms/${roomId}/seats`);
      
      if (response.data.statusCode === 200) {
        return response.data.data.map(seat => ({
          ...seat,
          // Map API seatType to frontend type
          type: mapSeatTypeFromApi(seat.seatType),
          status: 'AVAILABLE' as const,
          // Extract row and column from seatNumber (e.g., "A1" -> row: "A", column: 1)
          row: seat.seatNumber.charAt(0),
          column: parseInt(seat.seatNumber.slice(1)),
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch seats');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Create new room
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    try {
      const response = await axios.post<ApiResponse<Room>>(`${API_BASE_URL}/rooms`, {
        name: roomData.name,
        type: mapRoomTypeToApi(roomData.type || '2D')
      });
      
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return {
          ...response.data.data,
          type: mapRoomTypeFromApi(response.data.data.type),
          status: roomData.status || 'ACTIVE',
          screenSize: roomData.screenSize || '15m x 8m',
          screenResolution: roomData.screenResolution || '4K',
          audioSystem: roomData.audioSystem || 'Dolby Digital',
          hasAirCondition: roomData.hasAirCondition || true,
          hasEmergencyExit: roomData.hasEmergencyExit || true,
          hasDolbyAtmos: roomData.hasDolbyAtmos || false,
          has4K: roomData.has4K || true,
          description: roomData.description,
          totalSeats: roomData.totalSeats || 0,
          vipSeats: roomData.vipSeats || 0,
          regularSeats: roomData.regularSeats || 0,
          coupleSeats: roomData.coupleSeats || 0,
          utilization: 0,
          monthlyRevenue: 0,
        };
      } else {
        throw new Error(response.data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Update room
  updateRoom: async (roomId: string, roomData: Partial<Room>): Promise<Room> => {
    try {
      const response = await axios.put<ApiResponse<Room>>(`${API_BASE_URL}/rooms/${roomId}`, {
        name: roomData.name,
        type: mapRoomTypeToApi(roomData.type || '2D')
      });
      
      if (response.data.statusCode === 200) {
        return {
          ...response.data.data,
          type: mapRoomTypeFromApi(response.data.data.type),
          status: roomData.status || 'ACTIVE',
          screenSize: roomData.screenSize || '15m x 8m',
          screenResolution: roomData.screenResolution || '4K',
          audioSystem: roomData.audioSystem || 'Dolby Digital',
          hasAirCondition: roomData.hasAirCondition || true,
          hasEmergencyExit: roomData.hasEmergencyExit || true,
          hasDolbyAtmos: roomData.hasDolbyAtmos || false,
          has4K: roomData.has4K || true,
          description: roomData.description,
          totalSeats: roomData.totalSeats || 0,
          vipSeats: roomData.vipSeats || 0,
          regularSeats: roomData.regularSeats || 0,
          coupleSeats: roomData.coupleSeats || 0,
          utilization: roomData.utilization || 0,
          monthlyRevenue: roomData.monthlyRevenue || 0,
        };
      } else {
        throw new Error(response.data.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Delete room
  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/rooms/${roomId}`);
      
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },
};

// Helper functions to map between API and frontend types
function mapRoomTypeFromApi(apiType: string): '2D' | '3D' | 'IMAX' | '4DX' {
  switch (apiType.toUpperCase()) {
    case 'STANDARD':
    case '2D':
      return '2D';
    case '3D':
      return '3D';
    case 'IMAX':
      return 'IMAX';
    case '4DX':
      return '4DX';
    default:
      return '2D';
  }
}

function mapRoomTypeToApi(frontendType: string): string {
  switch (frontendType) {
    case '2D':
      return 'Standard';
    case '3D':
      return '3D';
    case 'IMAX':
      return 'IMAX';
    case '4DX':
      return '4DX';
    default:
      return 'Standard';
  }
}

function mapSeatTypeFromApi(apiSeatType: string): 'regular' | 'vip' | 'couple' | 'disabled' {
  switch (apiSeatType.toUpperCase()) {
    case 'STANDARD':
      return 'regular';
    case 'VIP':
      return 'vip';
    case 'COUPLE':
      return 'couple';
    case 'DISABLED':
      return 'disabled';
    default:
      return 'regular';
  }
}

export default roomApiService;
