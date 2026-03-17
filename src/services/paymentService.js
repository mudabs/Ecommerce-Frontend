import api from '../api/api';

const normalizePath = (path, fallback) => {
    const basePath = path || fallback;
    if (basePath.startsWith('/')) return basePath;
    return `/${basePath}`;
};

const getAuthToken = () => {
    try {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return null;
        const user = JSON.parse(rawUser);
        return user?.token || user?.accessToken || user?.jwt || user?.jwtToken || null;
    } catch {
        return null;
    }
};

const paymentService = {
    createStripePaymentIntent: async (payload) => {
        const endpoint = normalizePath(
            import.meta.env.VITE_STRIPE_INTENT_PATH,
            '/payments/stripe/create-intent'
        );
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await api.post(endpoint, payload, { headers });
        return response.data;
    },
    getCheckoutCurrency: () => String(import.meta.env.VITE_ORDER_CURRENCY || 'USD').toUpperCase(),
};

export default paymentService;
