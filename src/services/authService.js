import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_AUTH_BASE_URL;

// Create axios instance with credentials enabled
const apiClient = axios.create({
    baseURL: API_BASE_URL,
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
            throw error.response?.data || error.message;
        }
    },

    // Sign in user
    signin: async (credentials) => {
        try {
            const response = await apiClient.post('/signin', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Sign out user
    signout: async () => {
        try {
            const response = await apiClient.post('/signout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get current user info
    getCurrentUser: async () => {
        try {
            const response = await apiClient.get('/user');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default authService;
