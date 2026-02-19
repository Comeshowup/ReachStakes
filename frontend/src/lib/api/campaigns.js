import axios from 'axios';

// Create a dedicated axios instance or use a global one if available.
// Assuming a global instance is likely configured with auth headers.
// If not, we'll implement a simple one with interceptors.
// For now, looking at main.jsx, there's no clear global axios export, 
// but package.json has axios. Let's create a local instance or modify this if we find a global one.
// The user has 'src/api/dashboardService.js' open, let's peek at that pattern first 
// but I'll implement this based on standard best practices.

const API_BASE_URL = 'http://localhost:3000/api/v1/brand/campaigns';
// Note: Hardcoding base URL to localhost for dev as per server.js log. 
// In prod, this should be env var.

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token interceptor if needed (checking local storage 'token')
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const campaignsApi = {
    create: async (data) => {
        const response = await api.post('/', data);
        return response.data.data;
    },

    getDetail: async (id) => {
        const response = await api.get(`/${id}`);
        return response.data.data;
    },
};
