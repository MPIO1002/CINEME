import api from '@/lib/axios';

// Country interface
// export interface Permission {
//     key: string;
//     label: string;
//     description: string;
//     category: 'USER' | 'MOVIE' | 'SHOWTIME' | 'ROOM' | 'THEATER' | 'SYSTEM' | 'BOOKING' | 'ACTOR';
//     critical?: boolean;
// }

// export interface Role {
//     key: string;
//     label: string;
//     description: string;
//     icon: React.ReactNode;
//     color: string;
//     permissions: string[];
//     userCount: number;
// }

export interface Permission {
    key: string;
    name: string;
}

export interface Role {
    id?: string;
    name: string;
    permissionList?: Permission[];
}

export interface Response<T> {
    statusCode: number;
    message: string;
    data: T;
}

export const rolePermissionApiService = {
  // Fetch all permissions
    getAllPermissions: async () => {
        const response = await api.get('/permissions');
        return response.data.data;
    },

    // Fetch all roles
    getAllRoles: async () => {
        const response = await api.get('/roles');
        return response.data.data;
    },

    // Create a new permission
    createPermission: async (permission: { key: string; name: string }) => {
        const response = await api.post('/permissions', permission);
        return response.data.data;
    },

    // Create a new role
    createRole: async (role: { name: string }) => {
        const response = await api.post('/roles', role);
        return response.data.data;
    },

    // Add permissions to a role
    addPermissionsToRole: async (roleId: string, keys: string[]) => {
        await api.post('/roles/permissions', { roleId, keys });
    },
}
export default rolePermissionApiService;