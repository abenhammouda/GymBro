import axios from 'axios';
import type { AssignedClient } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
};

export const clientService = {
    async getMyClients(): Promise<AssignedClient[]> {
        const response = await axios.get(
            `${API_URL}/api/CoachClients/my-clients`,
            { headers: getAuthHeader() }
        );
        return response.data;
    }
};
