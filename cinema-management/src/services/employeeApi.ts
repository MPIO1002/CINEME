import api from '@/lib/axios';

// Employee interface matching the API response
export interface Employee {
  id?: string;
  email: string;
  fullName: string;
  phone: string;
  roleName?: string;
  theaterName?: string;
  theaterId?: string;
  roleId?: string;
  password?: string; // For creating new employee
  status?: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt?: string;
  updatedAt?: string;
}

// Employee API Service
export const employeeApiService = {
    // Get all employees
    getAllEmployees: async () => {
        try {
            const response = await api.get('/employees');

            if (response.data.statusCode === 200) {
                return response.data.data.map((employee: Employee) => ({
                ...employee,
                status: 'ACTIVE' as const, // Default status
                }));
            } else {
                throw new Error(response.data.message || 'Failed to fetch employees');
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw error;
        }
    },

    // Create new employee
    createEmployee: async (employeeData: Employee) => {
        try {
            const response = await api.post(`/employees`, employeeData);

            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return {
                ...response.data.data,
                status: 'ACTIVE' as const,
                };
            } else {
                throw new Error(response.data.message || 'Failed to create employee');
            }
        } catch (error) {
            console.error('Error creating employee:', error);
            throw error;
        }
    },

    // Update employee (assuming similar to user, but adjust as needed)
    updateEmployee: async (employeeId: string, employeeData: Employee) => {
        try {
            const response = await api.put(`/employees/${employeeId}`, employeeData);
            if (response.data.statusCode === 200) {
                return {
                ...response.data.data,
                status: employeeData.status || 'ACTIVE',
                };
            } else {
                throw new Error(response.data.message || 'Failed to update employee');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            throw error;
        }
    },

    // Delete employee
    deleteEmployee: async (employeeId: string) => {
        try {
            const response = await api.delete(`/employees/${employeeId}`);

            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to delete employee');
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    },

    // Get employee by ID
    getEmployeeById: async (employeeId: string) => {
        try {
            const response = await api.get(`/employees/${employeeId}`);

            if (response.data.statusCode === 200) {
                return {
                ...response.data.data,
                status: 'ACTIVE' as const,
                };
            } else {
                throw new Error(response.data.message || 'Failed to fetch employee');
            }
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw error;
        }
    }
};

export default employeeApiService;