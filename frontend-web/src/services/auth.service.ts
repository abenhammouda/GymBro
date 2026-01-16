import api, { handleApiError } from './api';
import type {
    LoginRequest,
    RegisterCoachRequest,
    RegisterAdherentRequest,
    VerifyCodeRequest,
    SendVerificationCodeRequest,
    AuthResponse,
    RefreshTokenRequest
} from '../types';


class AuthService {
    /**
     * Login with email/phone and password
     */
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);

            // Store tokens and user info
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('authToken', response.data.accessToken); // For backward compatibility
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userType', response.data.userType);
            }

            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Register new coach
     */
    async registerCoach(data: RegisterCoachRequest): Promise<{ message: string }> {
        try {
            const response = await api.post('/auth/register/coach', data);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Register new adherent
     */
    async registerAdherent(data: RegisterAdherentRequest): Promise<{ message: string }> {
        try {
            const response = await api.post('/auth/register/adherent', data);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Send verification code
     */
    async sendVerificationCode(data: SendVerificationCodeRequest): Promise<{ message: string }> {
        try {
            const response = await api.post('/auth/send-verification-code', data);
            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Verify email/phone with code
     */
    async verifyCode(data: VerifyCodeRequest): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/verify', data);

            // Store tokens and user info
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userType', response.data.userType);
            }

            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });

            // Update tokens
            if (response.data.accessToken) {
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
            }

            return response.data;
        } catch (error) {
            throw new Error(handleApiError(error));
        }
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        return localStorage.getItem('authToken');
    }
}

export default new AuthService();
