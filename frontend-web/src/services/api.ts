import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5085/api',
    timeout: 10000,
    withCredentials: true, // Required for CORS with credentials
    headers: {
        'Content-Type': 'application/json',
    },
});


// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    // Try to refresh the token
                    const response = await axios.post('http://localhost:5085/api/auth/refresh', {
                        refreshToken,
                    });

                    const { token, refreshToken: newRefreshToken } = response.data;

                    // Update tokens
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Retry the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

export default api;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // Server responded with error
            return error.response.data?.message || error.response.data?.errors?.[0] || 'An error occurred';
        } else if (error.request) {
            // Request made but no response
            return 'No response from server. Please check your connection.';
        }
    }
    return 'An unexpected error occurred';
};
