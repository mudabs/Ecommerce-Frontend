import api from '../api/api';

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

const normalizeOrderPath = (path) => {
    if (!path) return '/orders';
    if (path.startsWith('/')) return path;
    return `/${path}`;
};

const orderService = {
    createOrder: async (orderPayload) => {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const createOrderPath = normalizeOrderPath(import.meta.env.VITE_ORDER_CREATE_PATH || '/orders');
        const response = await api.post(createOrderPath, orderPayload, { headers });
        return response.data;
    },
};

export default orderService;
