import api from './api';
import type { Program, CreateProgramRequest, UpdateProgramRequest } from '../types';

class ProgramService {
    async getPrograms(status?: string): Promise<Program[]> {
        const params = status ? { status } : {};
        const response = await api.get<Program[]>('/programs', { params });
        return response.data;
    }

    async getProgramById(id: number): Promise<Program> {
        const response = await api.get<Program>(`/programs/${id}`);
        return response.data;
    }

    async createProgram(data: CreateProgramRequest, imageFile?: File): Promise<Program> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('status', data.status);
        formData.append('duration', data.duration.toString());
        if (data.description) formData.append('description', data.description);
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        if (imageFile) formData.append('imageFile', imageFile);

        const response = await api.post<Program>('/programs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async updateProgram(id: number, data: UpdateProgramRequest, imageFile?: File): Promise<Program> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('status', data.status);
        formData.append('duration', data.duration.toString());
        if (data.description) formData.append('description', data.description);
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        if (imageFile) formData.append('imageFile', imageFile);

        const response = await api.put<Program>(`/programs/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async deleteProgram(id: number): Promise<void> {
        await api.delete(`/programs/${id}`);
    }

    async assignClientsToProgram(programId: number, clientIds: number[]): Promise<void> {
        await api.post(`/programs/${programId}/assign-clients`, { clientIds });
    }
}

export default new ProgramService();
