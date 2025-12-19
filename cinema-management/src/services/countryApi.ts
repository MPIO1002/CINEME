import api from '@/lib/axios';

// Country interface
export interface Country {
  id: string;
  nameVn: string;
  nameEn: string;
}

// API Functions
export const countryApiService = {
    // Get all countries
    getAllCountries: async () => {
        try {
            const response = await api.get('/countries');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error fetching countries:', error);
            throw error;
        }
    },

    // Create new country
    createCountry: async (country: Country) => {
        try {
            const response = await api.post('/countries', country);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating country:', error);
            throw error;
        }
    },

    // Update country
    updateCountry: async (id: string, country: Country) => {
        try {
            const response = await api.put(`/countries/${id}`, country);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating country ${id}:`, error);
            throw error;
        }
    },

    // Delete country
    deleteCountry: async (id: string) => {
        try {
            const response = await api.delete(`/countries/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting country ${id}:`, error);
            throw error;
        }
    },
};

export default countryApiService;
