import axios from 'axios';
import type { AssignedClient, AssignClientsRequest } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
};

export const workoutSessionService = {
    async getAssignedClients(sessionId: number): Promise<AssignedClient[]> {
        const response = await axios.get(
            `${API_URL}/api/WorkoutSessions/${sessionId}/clients`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    async assignClients(sessionId: number, adherentIds: number[]): Promise<void> {
        const request: AssignClientsRequest = { adherentIds };
        await axios.post(
            `${API_URL}/api/WorkoutSessions/${sessionId}/clients`,
            request,
            { headers: getAuthHeader() }
        );
    },

    async unassignClient(sessionId: number, adherentId: number): Promise<void> {
        await axios.delete(
            `${API_URL}/api/WorkoutSessions/${sessionId}/clients/${adherentId}`,
            { headers: getAuthHeader() }
        );
    }
};
