import axios from "axios";
import { BACKEND_API_BASE_URL } from "../utils/env";

const api = axios.create({
    baseURL: BACKEND_API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

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
            
            // Don't try to refresh for auth endpoints to avoid infinite loops
            if (originalRequest.url?.includes('/auth/')) {
                console.log('API Interceptor: 401 on auth endpoint, clearing auth');
                handleAuthFailure();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // Check if we're already refreshing to avoid multiple refresh attempts
            if (!isRefreshing) {
                isRefreshing = true;
                console.log('API Interceptor: Starting token refresh');
                
                try {
                    refreshPromise = api.post("/auth/refresh");
                    const response = await refreshPromise;
                    
                    if (response.data) {
                        console.log('API Interceptor: Token refresh successful');
                        // Update localStorage with new token data
                        localStorage.setItem("auth", JSON.stringify(response.data));
                        
                        // Update the original request with new token
                        const newToken = response.data?.jwtToken || response.data?.token;
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        
                        isRefreshing = false;
                        refreshPromise = null;
                        
                        // Retry the original request with new token
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.log("API Interceptor: Token refresh failed:", refreshError);
                    isRefreshing = false;
                    refreshPromise = null;
                    
                    // Only clear auth if the refresh actually failed with 401/403
                    if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
                        handleAuthFailure();
                    }
                    return Promise.reject(refreshError);
                }
            } else if (refreshPromise) {
                console.log('API Interceptor: Waiting for ongoing refresh');
                // Wait for the ongoing refresh to complete
                try {
                    await refreshPromise;
                    const authData = localStorage.getItem("auth");
                    if (authData) {
                        const parsedAuth = JSON.parse(authData);
                        const newToken = parsedAuth?.jwtToken || parsedAuth?.token;
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                    }
                    return api(originalRequest);
                } catch (refreshError) {
                    handleAuthFailure();
                    return Promise.reject(refreshError);
                }
            }
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