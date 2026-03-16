import axios from 'axios';

const apiBaseUrl = import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL || '/api');

// Create axios instance for public endpoints
export const publicApi = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create axios instance for protected endpoints
export const protectedApi = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default publicApi;
