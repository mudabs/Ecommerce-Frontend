import { createContext, useState, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    const signin = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.signin({ email, password });
            setUser(response.user || response);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (userData) => {
        setLoading(true);
        try {
            const response = await authService.signup(userData);
            setUser(response.user || response);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const signout = useCallback(async () => {
        setLoading(true);
        try {
            await authService.signout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Signout error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCurrentUser = useCallback(async () => {
        try {
            const response = await authService.getCurrentUser();
            setUser(response);
            setIsAuthenticated(true);
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            return null;
        }
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        signin,
        signup,
        signout,
        getCurrentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
