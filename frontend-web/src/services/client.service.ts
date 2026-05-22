import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
};

export interface ClientSummary {
    coachClientId: number;
    adherentId: number;
    adherentName: string;
    adherentEmail?: string;
    profilePicture?: string;
    age?: number;
    gender?: string;
    height?: number;
    status: 'Active' | 'Paused' | 'Inactive' | 'Completed' | 'Cancelled';
    startDate: string;
    endDate?: string;
    goalSummary?: string;
    lastWeight?: number;
    lastActivityDate?: string;
    nutritionGoal?: 'Deficit' | 'Maintenance' | 'Surplus';
    caloriesDelta?: number;
}

export interface IntakePhotoDto {
    intakePhotoId: number;
    photoUrl: string;
    photoType: 'Front' | 'Side' | 'Back';
}

export interface AdherentIntake {
    adherentId: number;
    name: string;
    email?: string;
    profilePicture?: string;
    age?: number;
    gender?: string;
    height?: number;
    initialWeight?: number;
    workNature?: string;
    goalType?: string;
    intakePhotos: IntakePhotoDto[];
}

export interface MacroPlan {
    macroPlanId: number;
    coachClientId: number;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    startDate: string;
    endDate?: string;
    notes?: string;
    isActive: boolean;
}

export interface ProgressPhoto {
    progressPhotoId: number;
    photoUrl: string;
    photoType: string;
}

export interface WeeklyProgress {
    progressReportId: number;
    coachClientId: number;
    weekNumber: number;
    reportDate: string;
    currentWeight?: number;
    notes?: string;
    photos: ProgressPhoto[];
}

export interface ClientProfile {
    coachClientId: number;
    status: string;
    startDate: string;
    endDate?: string;
    goalSummary?: string;
    notes?: string;
    inactiveReason?: string;
    currentMacroPlan?: MacroPlan;
    weeklyProgress: WeeklyProgress[];
    adherent: AdherentIntake;
}

export interface CreateMacroPlanRequest {
    coachClientId: number;
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    notes?: string;
}

export interface SubmitWeeklyProgressRequest {
    coachClientId: number;
    weekNumber: number;
    currentWeight?: number;
    notes?: string;
    photos: { photoUrl: string; photoType: string }[];
}

export const clientService = {
    async getMyClients(status?: string): Promise<ClientSummary[]> {
        const params = status ? { status } : {};
        const response = await axios.get(`${API_URL}/api/CoachClients/my-clients`, {
            headers: getAuthHeader(),
            params
        });
        // Map adherentName → name so legacy components (CalendarPage etc.) keep working
        return response.data.map((c: any) => ({
            ...c,
            name: c.adherentName ?? c.name,
            email: c.adherentEmail ?? c.email,
        }));
    },

    async getClientProfile(coachClientId: number): Promise<ClientProfile> {
        const response = await axios.get(
            `${API_URL}/api/CoachClients/${coachClientId}/profile`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    async updateClientStatus(coachClientId: number, status: string, inactiveReason?: string, endDate?: string): Promise<void> {
        await axios.patch(
            `${API_URL}/api/CoachClients/${coachClientId}/status`,
            { status, inactiveReason, endDate },
            { headers: getAuthHeader() }
        );
    },

    async getCurrentMacroPlan(coachClientId: number): Promise<MacroPlan | null> {
        try {
            const response = await axios.get(
                `${API_URL}/api/MacroPlans/${coachClientId}/current`,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 404) return null;
            throw e;
        }
    },

    async createMacroPlan(request: CreateMacroPlanRequest): Promise<MacroPlan> {
        const response = await axios.post(`${API_URL}/api/MacroPlans`, request, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    async getWeeklyProgress(coachClientId: number): Promise<WeeklyProgress[]> {
        const response = await axios.get(
            `${API_URL}/api/WeeklyProgress/${coachClientId}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    },

    async submitWeeklyProgress(request: SubmitWeeklyProgressRequest): Promise<WeeklyProgress> {
        const response = await axios.post(`${API_URL}/api/WeeklyProgress`, request, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/api/upload`, formData, {
            headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return response.data.url;
    }
};
