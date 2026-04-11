import axios from "axios";
import { BACKEND_API_BASE_URL } from "../utils/env";

console.log("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
    baseURL: BACKEND_API_BASE_URL,
    withCredentials: true,
});

// Add request interceptor to include JWT token in headers if available
api.interceptors.request.use(
    (config) => {
        const authData = localStorage.getItem("auth");
        if (authData) {
            try {
                const parsedAuth = JSON.parse(authData);
                const token = parsedAuth?.jwtToken || parsedAuth?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn("Invalid auth data in localStorage:", error);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration with automatic refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('API Interceptor: Received error', error.response?.status, 'for URL:', originalRequest?.url);

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('API Interceptor: Handling 401 error');

            // Don't retry auth endpoints to avoid loops.
            if (originalRequest.url?.includes('/auth/')) {
                console.log('API Interceptor: 401 on auth endpoint, clearing auth');
                handleAuthFailure();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // This backend issues a single JWT and does not expose a refresh endpoint.
            // A 401 therefore means the session is no longer usable and the client must re-authenticate.
            handleAuthFailure();
        }
        
        return Promise.reject(error);
    }
);

function handleAuthFailure() {
    console.log('API Interceptor: Handling auth failure - clearing auth data and redirecting');
    
    // Clear all auth-related data
    localStorage.removeItem("auth");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("CHECKOUT_ADDRESS");
    localStorage.removeItem("PAYMENT_METHOD");
    localStorage.removeItem("SAVED_PAYMENT_METHODS");
    
    // Only redirect if not already on auth pages
    const currentPath = window.location.pathname;
    console.log('API Interceptor: Current path:', currentPath);
    
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        console.log('API Interceptor: Redirecting to login with expired=true');
        window.location.href = '/login?expired=true';
    }
}

export default api;