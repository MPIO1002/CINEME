import api from '@/lib/axios';

// User interface matching the API response
export interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    //   avatar?: string;
    provider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
    createdAt: string;
    updatedAt: string;
    locked: boolean;
    // Extended properties for frontend
    status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    joinDate?: string;
    //   lastLogin?: string;
    totalBookings?: number;
    totalSpent?: number;
}

// User API Service
export const userApiService = {
    // Get all users
    getAllUsers: async () => {
        try {
            const response = await api.get(`/users`);
            
            if (response.data.statusCode === 200) {
                // Transform API data to match frontend interface
                return response.data.data.map((user: User) => ({
                    ...user,
                    // Set status based on locked
                    status: user.locked ? 'BANNED' : 'ACTIVE' as const,
                    // Map createdAt to joinDate
                    joinDate: user.createdAt.split(' ')[0], // Extract date part
                    // Set default values for extended properties
                    totalBookings: 0,
                    totalSpent: 0,
                    isOnline: false,
                }));
            } else {
                throw new Error(response.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Create new user
    createUser: async (userData: User) => {
        try {
            const response = await api.post(`/users`, {
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
                provider: userData.provider || 'LOCAL'
            });
            
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return {
                    ...response.data.data,
                    status: response.data.data.locked ? 'BANNED' : 'ACTIVE',
                    joinDate: response.data.data.createdAt.split(' ')[0],
                    totalBookings: 0,
                    totalSpent: 0,
                };
            } else {
                throw new Error(response.data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user
    updateUser: async (userId: string, userData: User) => {
        try {
            const response = await api.put(`/users/${userId}`, {
                fullName: userData.fullName,
                email: userData.email,
                phone: userData.phone,
            });
            
            if (response.data.statusCode === 200) {
                return {
                    ...response.data.data,
                    status: response.data.data.locked ? 'BANNED' : 'ACTIVE',
                    joinDate: response.data.data.createdAt.split(' ')[0],
                    totalBookings: userData.totalBookings || 0,
                    totalSpent: userData.totalSpent || 0,
                };
            } else {
                throw new Error(response.data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (userId: string) => {
        try {
            const response = await api.delete(`/users/${userId}`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (userId: string) => {
        try {
            const response = await api.get(`/users/${userId}`);
            
            if (response.data.statusCode === 200) {
                return {
                    ...response.data.data,
                    status: response.data.data.locked ? 'BANNED' : 'ACTIVE',
                    joinDate: response.data.data.createdAt.split(' ')[0],
                    totalBookings: 0,
                    totalSpent: 0,
                };
            } else {
                throw new Error(response.data.message || 'Failed to fetch user');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Lock/Unlock user
    lockUser: async (userId: string, lock: boolean) => {
        try {
            const response = await api.put(`/users/${userId}/lock?lock=${lock}`);
            
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to update user lock status');
            }
        } catch (error) {
            console.error('Error updating user lock status:', error);
            throw error;
        }
    },
};

// Role API (for getting available roles)
// export const roleApiService = {
//   getAllRoles: async (): Promise<Array<{id: string, name: string}>> => {
//     try {
//       const response = await axios.get<ApiResponse<Array<{id: string, name: string}>>>(`${API_BASE_URL}/roles`);
      
//       if (response.data.statusCode === 200) {
//         return response.data.data;
//       } else {
//         throw new Error(response.data.message || 'Failed to fetch roles');
//       }
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//       // Return default roles if API fails
//       return [
//         { id: '1', name: 'Admin' },
//         { id: '2', name: 'Staff' },
//         { id: '3', name: 'Customer' }
//       ];
//     }
//   }
// };

export default userApiService;
