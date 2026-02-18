import api from './api';
import type { Meal, CreateMealRequest, UpdateMealRequest } from '../types';

export const mealService = {
    getMealsByTab: async (tabId: number): Promise<Meal[]> => {
        const response = await api.get(`/meals?tabId=${tabId}`);
        return response.data;
    },

    createMeal: async (data: CreateMealRequest, imageFile?: File): Promise<Meal> => {
        const formData = new FormData();
        formData.append('mealData', JSON.stringify(data));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        const response = await api.post('/meals', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateMeal: async (mealId: number, data: UpdateMealRequest, imageFile?: File): Promise<Meal> => {
        const formData = new FormData();
        formData.append('mealData', JSON.stringify(data));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        const response = await api.put(`/meals/${mealId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteMeal: async (mealId: number): Promise<void> => {
        await api.delete(`/meals/${mealId}`);
    }
};
