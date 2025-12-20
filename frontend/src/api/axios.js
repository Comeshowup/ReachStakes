import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Your backend URL
    withCredentials: true,                // Send cookies with requests
});

export default api;