import api from '@/lib/axios';

// Product interface
export interface Product {
    id: string;
    name: string;
}

// Combo Item interface
export interface ComboItem {
    itemId: string;
    itemName: string;
    quantity: number;
}

// Combo interface
export interface Combo {
    id: string;
    name: string;
    price: number;
    img: string;
    listItems: ComboItem[];
}

// Combo API Service
export const comboApiService = {
    // Get all products
    getAllProducts: async () => {
        try {
            const response = await api.get(`/products`);
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get all combos
    getAllCombos: async () => {
        try {
            const response = await api.get(`/combos`);
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch combos');
            }
        } catch (error) {
            console.error('Error fetching combos:', error);
            throw error;
        }
    },

    // Create product
    createProduct: async (productData: { name: string }) => {
        try {
            const response = await api.post(`/products`, productData);
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Create combo
    createCombo: async (formData: FormData) => {
        try {
            const response = await api.post(`/combos`, formData, {
            // headers: {
            // 'Content-Type': 'multipart/form-data',
            // },
            });
            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create combo');
            }
        } catch (error) {
            console.error('Error creating combo:', error);
            throw error;
        }
    },

    // Update product
    updateProduct: async (productId: string, productData: { name: string }) => {
        try {
            const response = await api.put(`/products/${productId}`, productData);
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Update combo
    updateCombo: async (comboId: string, formData: FormData) => {
        try {
            const response = await api.put(`/combos/${comboId}`, formData);
            //     headers: {
            //       'Content-Type': 'multipart/form-data',
            //     },
            //   });
            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update combo');
            }
        } catch (error) {
            console.error('Error updating combo:', error);
            throw error;
        }
    },

    // Delete product
    deleteProduct: async (productId: string) => {
        try {
            const response = await api.delete(`/products/${productId}`);
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Delete combo
    deleteCombo: async (comboId: string) => {
        try {
            const response = await api.delete(`/combos/${comboId}`);
            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to delete combo');
            }
        } catch (error) {
            console.error('Error deleting combo:', error);
            throw error;
        }
    },
};

export default comboApiService;