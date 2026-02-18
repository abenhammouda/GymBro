import api from './api';
import type {
    ScheduledMeal,
    CreateScheduledMealRequest,
    UpdateScheduledMealRequest
} from '../types';

export const scheduledMealService = {
    /**
     * Get all scheduled meals for a specific client
     */
    getScheduledMealsByClient: async (adherentId: number): Promise<ScheduledMeal[]> => {
        const response = await api.get(`/scheduledmeals/client/${adherentId}`);
        return response.data;
    },

    /**
     * Get all scheduled meals for the authenticated coach
     */
    getScheduledMealsByCoach: async (startDate?: string, endDate?: string): Promise<ScheduledMeal[]> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await api.get(`/scheduledmeals/coach?${params.toString()}`);
        return response.data;
    },

    /**
     * Get a specific scheduled meal by ID
     */
    getScheduledMealById: async (scheduledMealId: number): Promise<ScheduledMeal> => {
        const response = await api.get(`/scheduledmeals/${scheduledMealId}`);
        return response.data;
    },

    /**
     * Create a new scheduled meal
     */
    createScheduledMeal: async (request: CreateScheduledMealRequest): Promise<ScheduledMeal> => {
        const response = await api.post('/scheduledmeals', request);
        return response.data;
    },

    /**
     * Update an existing scheduled meal
     */
    updateScheduledMeal: async (
        scheduledMealId: number,
        request: UpdateScheduledMealRequest
    ): Promise<ScheduledMeal> => {
        const response = await api.put(`/scheduledmeals/${scheduledMealId}`, request);
        return response.data;
    },

    /**
     * Delete a scheduled meal
     */
    deleteScheduledMeal: async (scheduledMealId: number): Promise<void> => {
        await api.delete(`/scheduledmeals/${scheduledMealId}`);
    }
};
