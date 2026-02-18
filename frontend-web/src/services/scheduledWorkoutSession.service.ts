import axios from 'axios';
import type { ScheduledWorkoutSession, CreateScheduledWorkoutRequest, UpdateScheduledWorkoutRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL + '/api/ScheduledWorkoutSessions';

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
};

export const scheduledWorkoutSessionService = {
    getScheduledSessionsByClient: async (adherentId: number): Promise<ScheduledWorkoutSession[]> => {
        const response = await axios.get(`${API_URL}/client/${adherentId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    getScheduledSessionsByCoach: async (startDate?: Date, endDate?: Date): Promise<ScheduledWorkoutSession[]> => {
        const params: any = {};
        if (startDate) params.startDate = startDate.toISOString();
        if (endDate) params.endDate = endDate.toISOString();

        const response = await axios.get(`${API_URL}/coach`, {
            headers: getAuthHeader(),
            params
        });
        return response.data;
    },

    getScheduledSessionById: async (id: number): Promise<ScheduledWorkoutSession> => {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    createScheduledSession: async (request: CreateScheduledWorkoutRequest): Promise<ScheduledWorkoutSession> => {
        const response = await axios.post(API_URL, request, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    bulkScheduleSessions: async (workoutSessionId: number, adherentId: number, startDate: Date, sessionsPerWeek: number = 2): Promise<ScheduledWorkoutSession[]> => {
        const response = await axios.post(`${API_URL}/bulk-schedule`, {
            workoutSessionId,
            adherentId,
            startDate: startDate.toISOString(),
            sessionsPerWeek
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    updateScheduledSession: async (id: number, request: UpdateScheduledWorkoutRequest): Promise<ScheduledWorkoutSession> => {
        const response = await axios.put(`${API_URL}/${id}`, request, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    deleteScheduledSession: async (id: number): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`, {
            headers: getAuthHeader()
        });
    }
};
