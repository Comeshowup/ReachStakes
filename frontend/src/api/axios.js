import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Support dynamic API URL
    withCredentials: true,                // Send cookies with requests
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
});

export default api;