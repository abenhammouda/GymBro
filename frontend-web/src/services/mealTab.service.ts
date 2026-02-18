import api from './api';
import type { MealTab, CreateMealTabRequest } from '../types';

export const mealTabService = {
    getAllTabs: async (): Promise<MealTab[]> => {
        const response = await api.get('/meals/tabs');
        return response.data;
    },

    createTab: async (data: CreateMealTabRequest): Promise<MealTab> => {
        const response = await api.post('/meals/tabs', data);
        return response.data;
    },

    deleteTab: async (tabId: number): Promise<void> => {
        await api.delete(`/meals/tabs/${tabId}`);
    }
};
