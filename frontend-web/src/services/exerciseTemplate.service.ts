import api from './api';
import type { ExerciseTemplate, CreateExerciseTemplateRequest, UpdateExerciseTemplateRequest, ExerciseSuggestion } from '../types';

class ExerciseTemplateService {
    async getExerciseTemplates(category?: string): Promise<ExerciseTemplate[]> {
        const params = category ? { category } : {};
        const response = await api.get<ExerciseTemplate[]>('/exercisetemplates', { params });
        return response.data;
    }

    async getExerciseTemplate(id: number): Promise<ExerciseTemplate> {
        const response = await api.get<ExerciseTemplate>(`/exercisetemplates/${id}`);
        return response.data;
    }

    async createExerciseTemplate(data: CreateExerciseTemplateRequest, videoFile?: File): Promise<ExerciseTemplate> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('category', data.category);
        if (data.description) formData.append('description', data.description);
        if (data.equipment) formData.append('equipment', data.equipment);
        if (data.instructions) formData.append('instructions', data.instructions);
        if (data.videoUrl) formData.append('videoUrl', data.videoUrl);
        if (videoFile) formData.append('videoFile', videoFile);

        const response = await api.post<ExerciseTemplate>('/exercisetemplates', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async updateExerciseTemplate(id: number, data: UpdateExerciseTemplateRequest, videoFile?: File): Promise<ExerciseTemplate> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('category', data.category);
        if (data.description) formData.append('description', data.description);
        if (data.equipment) formData.append('equipment', data.equipment);
        if (data.instructions) formData.append('instructions', data.instructions);
        if (data.videoUrl) formData.append('videoUrl', data.videoUrl);
        if (videoFile) formData.append('videoFile', videoFile);

        const response = await api.put<ExerciseTemplate>(`/exercisetemplates/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async deleteExerciseTemplate(id: number): Promise<void> {
        await api.delete(`/exercisetemplates/${id}`);
    }

    // Placeholder for future API integration
    async getSuggestions(_query: string): Promise<ExerciseSuggestion[]> {
        // TODO: Integrate with external exercise API
        // For now, return empty array
        return [];
    }
}

export default new ExerciseTemplateService();
