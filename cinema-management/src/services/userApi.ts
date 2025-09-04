import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// User interface matching the API response
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  provider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
  createdAt: string;
  updatedAt: string;
  
  // Extended properties for frontend
  role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  joinDate?: string;
  lastLogin?: string;
  totalBookings?: number;
  totalSpent?: number;
  permissions?: string[];
}

// API Response interface
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// User API Service
export const userApiService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get<ApiResponse<User[]>>(`${API_BASE_URL}/users`);
      
      if (response.data.statusCode === 200) {
        // Transform API data to match frontend interface
        return response.data.data.map(user => ({
          ...user,
          // Map roleName to role enum
          role: mapRoleNameToEnum(user.roleName),
          // Set default status
          status: 'ACTIVE' as const,
          // Map createdAt to joinDate
          joinDate: user.createdAt.split(' ')[0], // Extract date part
          // Set default values for extended properties
          totalBookings: 0,
          totalSpent: 0,
          isOnline: false,
          permissions: getDefaultPermissions(user.roleName)
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Create new user
  createUser: async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await axios.post<ApiResponse<User>>(`${API_BASE_URL}/users`, {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        roleId: userData.roleId,
        provider: userData.provider || 'LOCAL'
      });
      
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return {
          ...response.data.data,
          role: mapRoleNameToEnum(response.data.data.roleName),
          status: 'ACTIVE' as const,
          joinDate: response.data.data.createdAt.split(' ')[0],
          totalBookings: 0,
          totalSpent: 0,
          permissions: getDefaultPermissions(response.data.data.roleName)
        };
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Update user
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await axios.put<ApiResponse<User>>(`${API_BASE_URL}/users/${userId}`, {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        roleId: userData.roleId
      });
      
      if (response.data.statusCode === 200) {
        return {
          ...response.data.data,
          role: mapRoleNameToEnum(response.data.data.roleName),
          status: userData.status || 'ACTIVE',
          joinDate: response.data.data.createdAt.split(' ')[0],
          totalBookings: userData.totalBookings || 0,
          totalSpent: userData.totalSpent || 0,
          permissions: userData.permissions || getDefaultPermissions(response.data.data.roleName)
        };
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    try {
      const response = await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/users/${userId}`);
      
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get<ApiResponse<User>>(`${API_BASE_URL}/users/${userId}`);
      
      if (response.data.statusCode === 200) {
        return {
          ...response.data.data,
          role: mapRoleNameToEnum(response.data.data.roleName),
          status: 'ACTIVE' as const,
          joinDate: response.data.data.createdAt.split(' ')[0],
          totalBookings: 0,
          totalSpent: 0,
          permissions: getDefaultPermissions(response.data.data.roleName)
        };
      } else {
        throw new Error(response.data.message || 'Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }
};

// Helper functions
function mapRoleNameToEnum(roleName: string): 'ADMIN' | 'STAFF' | 'CUSTOMER' {
  switch (roleName.toUpperCase()) {
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return 'ADMIN';
    case 'STAFF':
    case 'EMPLOYEE':
      return 'STAFF';
    case 'CUSTOMER':
    case 'USER':
    default:
      return 'CUSTOMER';
  }
}

function getDefaultPermissions(roleName: string): string[] {
  switch (roleName.toUpperCase()) {
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return [
        'USER_MANAGEMENT',
        'MOVIE_MANAGEMENT',
        'ROOM_MANAGEMENT',
        'SHOWTIME_MANAGEMENT',
        'BOOKING_MANAGEMENT',
        'REPORTS',
        'SYSTEM_SETTINGS'
      ];
    case 'STAFF':
    case 'EMPLOYEE':
      return [
        'MOVIE_MANAGEMENT',
        'SHOWTIME_MANAGEMENT',
        'BOOKING_MANAGEMENT'
      ];
    case 'CUSTOMER':
    case 'USER':
    default:
      return [];
  }
}

// Role API (for getting available roles)
export const roleApiService = {
  getAllRoles: async (): Promise<Array<{id: string, name: string}>> => {
    try {
      const response = await axios.get<ApiResponse<Array<{id: string, name: string}>>>(`${API_BASE_URL}/roles`);
      
      if (response.data.statusCode === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch roles');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Return default roles if API fails
      return [
        { id: '1', name: 'Admin' },
        { id: '2', name: 'Staff' },
        { id: '3', name: 'Customer' }
      ];
    }
  }
};

export default userApiService;
