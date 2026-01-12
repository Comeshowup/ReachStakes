import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Support dynamic API URL
    withCredentials: true,                // Send cookies with requests
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
});

// Request interceptor to attach JWT token from localStorage
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - could redirect to login
            console.warn('Authentication failed - token may be expired');
        }
        return Promise.reject(error);
    }
);

export default api;