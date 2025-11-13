import api from '@/lib/axios';
import type { SeatType } from './roomApi';

// Pricing Rule interface
export interface PricingRule {
    id?: string;
    dayOfWeek: number;
    dayOfWeekName?: string;
    seatType: SeatType;
    seatTypeId?: string;
    price: number;
}

// Promotion interface (mock data)
export interface Promotion {
    id?: string;
    code: string;
    discount_percent: number;
    start_date: string;
    end_date: string;
    description_vn: string;
    description_en: string;
    is_active: boolean;
}

// Price API Service
export const priceApiService = {
    // Get all pricing rules
    getAllPricingRules: async () => {
        try {
            const response = await api.get(`/pricing-rules`);

            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to fetch pricing rules');
            }
        } catch (error) {
            console.error('Error fetching pricing rules:', error);
            throw error;
        }
    },

    // Create pricing rule
    createPricingRule: async (pricingRuleData: { dayOfWeek: number; seatTypeId: string; price: number }) => {
        try {
            const response = await api.post(`/pricing-rules`, pricingRuleData);

            if (response.data.statusCode === 200 || response.data.statusCode === 201) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to create pricing rule');
            }
        } catch (error) {
            console.error('Error creating pricing rule:', error);
            throw error;
        }
    },

    // Update pricing rule
    updatePricingRule: async (id: string, pricingRuleData: { dayOfWeek: number; seatTypeId: string; price: number }) => {
        try {
            const response = await api.put(`/pricing-rules/${id}`, pricingRuleData);

            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update pricing rule');
            }
        } catch (error) {
            console.error('Error updating pricing rule:', error);
            throw error;
        }
    },

    // Delete pricing rule
    deletePricingRule: async (id: string) => {
        try {
            const response = await api.delete(`/pricing-rules/${id}`);

            if (response.data.statusCode !== 200) {
                throw new Error(response.data.message || 'Failed to delete pricing rule');
            }
        } catch (error) {
            console.error('Error deleting pricing rule:', error);
            throw error;
        }
    },
};

// Mock data for promotions
export const mockPromotions: Promotion[] = [
  {
    id: '1',
    code: 'SUMMER2025',
    discount_percent: 20,
    start_date: '2025-06-01',
    end_date: '2025-08-31',
    description_vn: 'Giảm giá 20% cho tất cả vé phim mùa hè',
    description_en: '20% discount for all movie tickets in summer',
    is_active: true
  },
  {
    id: '2',
    code: 'WEEKEND',
    discount_percent: 15,
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    description_vn: 'Giảm giá 15% cho vé cuối tuần',
    description_en: '15% discount for weekend tickets',
    is_active: true
  },
  {
    id: '3',
    code: 'STUDENT',
    discount_percent: 25,
    start_date: '2025-09-01',
    end_date: '2025-12-31',
    description_vn: 'Giảm giá 25% cho sinh viên',
    description_en: '25% discount for students',
    is_active: false
  },
  {
    id: '4',
    code: 'HOLIDAY',
    discount_percent: 30,
    start_date: '2025-12-20',
    end_date: '2025-12-31',
    description_vn: 'Giảm giá 30% dịp lễ',
    description_en: '30% discount for holiday season',
    is_active: true
  }
];

export default priceApiService;