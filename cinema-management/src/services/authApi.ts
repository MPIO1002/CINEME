import api from '@/lib/axios';

// Login interface
export interface Login {
    email: string;
    password: string;
}

// User data interface for login response
export interface UserData {
    id: string;
    email: string;
    fullName: string;
    accessToken: string;
    refreshToken: string;
}

export interface Register {
    email: string;
    fullName: string;
    password: string;
    phone: string;
    roleId: string;
}

export const authApiService = {
    login: (userData: Login) => {
        return api.post('/auth/login-admin', userData,
            { withCredentials: true }
        );
    },
//   register: (userData: Register) => {
//     return api.post('/auth/register', userData);
//   }
    logout: () => {
        return api.get('/auth/logout-admin',
            { withCredentials: true }
        );
    }
};

export default authApiService;