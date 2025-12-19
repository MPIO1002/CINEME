import api from '@/lib/axios';

// Movie interface for actor's movie list
export interface MovieInActor {
    id: string;
    nameVn: string;
    nameEn: string;
    image: string;
    ratings: number;
}

// Actor interface
export interface Actor {
    id?: string;
    name: string;
    img: string | File;
    dateOfBirth?: string;
    nationality?: string;
    biography?: string;
    //   createdAt?: string;
    //   updatedAt?: string;
    listMovie?: MovieInActor[];
}

// API Functions
export const actorApiService = {
    // Get all actors with pagination
    getAllActors: async () => {
        try {
            const response = await api.get(`/actors`,
                { withCredentials: true }
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching actors:', error);
            throw error;
        }
    },

    // Get actor detail by ID
    getActorDetail: async (id: string) => {
        try {
            const response = await api.get(`/actors/${id}/detail`,
                { withCredentials: true }
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching actor detail for ID ${id}:`, error);
            throw error;
        }
    },

    // Create new actor
    createActor: async (actorData: Actor) => {
        try {
            const formData = new FormData();
            
            console.log('Creating actor with data:', actorData);
            console.log('Avatar type:', typeof actorData.img, actorData.img instanceof File ? 'File' : 'String');
            
            // Append actor data to FormData
            formData.append('name', actorData.name);
            if (actorData.dateOfBirth) formData.append('dateOfBirth', actorData.dateOfBirth);
            if (actorData.nationality) formData.append('nationality', actorData.nationality);
            if (actorData.biography) formData.append('biography', actorData.biography);
            
            // Handle img - can be File or string
            if (actorData.img) {
                if (actorData.img instanceof File) {
                    formData.append('img', actorData.img);
                    console.log('Added File to FormData:', actorData.img.name);
                } else if (typeof actorData.img === 'string') {
                    formData.append('avatarUrl', actorData.img);
                    console.log('Added img URL to FormData:', actorData.img);
                }
            }

            // Log FormData contents for debugging
            console.log('=== FormData Debug ===');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            console.log('=== End FormData Debug ===');

            const response = await api.post('/actors', formData, {
                timeout: 60000, // 1 minute for file upload
                withCredentials: true
            });
            return response.data.data;
        } catch (error) {
            console.error('Error creating actor:', error);
            throw error;
        }
    },

    // Update actor
    updateActor: async (id: string, actorData: Actor) => {
        try {
            const formData = new FormData();
            
            console.log('Updating actor with data:', actorData);
            console.log('Avatar type:', typeof actorData.img, actorData.img instanceof File ? 'File' : 'String');
            
            // Append actor data to FormData
            formData.append('name', actorData.name);
            if (actorData.dateOfBirth) formData.append('dateOfBirth', actorData.dateOfBirth);
            if (actorData.nationality) formData.append('nationality', actorData.nationality);
            if (actorData.biography) formData.append('biography', actorData.biography);
            
            // Handle img - can be File or string
            if (actorData.img) {
                if (actorData.img instanceof File) {
                    formData.append('img', actorData.img);
                    console.log('Added File to FormData for update:', actorData.img.name);
                } else if (typeof actorData.img === 'string') {
                    formData.append('avatarUrl', actorData.img);
                    console.log('Added img URL to FormData for update:', actorData.img);
                }
            }

            // Log FormData contents for debugging
            console.log('=== Update FormData Debug ===');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            console.log('=== End Update FormData Debug ===');

            const response = await api.put(`/actors/${id}`, formData, {
                timeout: 60000, // 1 minute for file upload
                withCredentials: true
            });
            return response.data;
        } catch (error) {
        console.error(`Error updating actor ${id}:`, error);
        throw error;
        }
    },

    // Delete actor
    deleteActor: async (id: string) => {
        try {
            const response = await api.delete(`/actors/${id}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error(`Error deleting actor ${id}:`, error);
            throw error;
        }
    },
};

export default actorApiService;
