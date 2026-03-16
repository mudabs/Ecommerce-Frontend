import axios from 'axios';

const apiBaseUrl = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || '/api');

// Create axios instance with credentials enabled
const apiClient = axios.create({
    baseURL: `${apiBaseUrl}/auth`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const authService = {
    // Sign up new user
    signup: async (userData) => {
        try {
            const response = await apiClient.post('/signup', userData);
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.message || data?.error) ||
                error.message ||
                'Registration failed.';
            throw new Error(message);
        }
    },

    // Sign in user
    signin: async (credentials) => {
        try {
            const response = await apiClient.post('/signin', credentials);
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.message || data?.error) ||
                error.message ||
                'Login failed.';
            throw new Error(message);
        }
    },

    // Sign out user
    signout: async () => {
        try {
            const response = await apiClient.post('/signout');
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.message || data?.error) ||
                error.message ||
                'Logout failed.';
            throw new Error(message);
        }
    },

    // Get current user info
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/user');
            return response.data;
        } catch (error) {
            const data = error.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.message || data?.error) ||
                error.message ||
                'Failed to load user.';
            throw new Error(message);
        }
    },
};

export default authService;
