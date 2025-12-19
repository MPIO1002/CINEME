import api from '@/lib/axios';

// Language interface
export interface Language {
    id: string;
    nameVn: string;
    nameEn: string;
}

// API Functions
export const languageApiService = {
    // Get all languages
    getAllLanguages: async () => {
        try {
            const response = await api.get('/languages');
            return response.data.data;
        } catch (error) {
            console.error('❌ Error fetching languages:', error);
            throw error;
        }
    },

    // Get language by ID
    getLanguageById: async (id: string) => {
        try {
            const response = await api.get(`/languages/${id}`);
            return response.data.data;
        } catch (error) {
            console.error(`❌ Error fetching language ${id}:`, error);
            throw error;
        }
    },

    // Create new language
    createLanguage: async (language: Language) => {
        try {
            const response = await api.post('/languages', language);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating language:', error);
            throw error;
        }
    },

    // Update language
    updateLanguage: async (id: string, language: Language) => {
        try {
            const response = await api.put(`/languages/${id}`, language);
            return response.data;
        } catch (error) {
            console.error(`❌ Error updating language ${id}:`, error);
            throw error;
        }
    },

    // Delete language
    deleteLanguage: async (id: string) => {
        try {
            const response = await api.delete(`/languages/${id}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error deleting language ${id}:`, error);
            throw error;
        }
    },
};

export default languageApiService;
