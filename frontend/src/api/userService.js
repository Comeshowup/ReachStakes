import api from './axios';

// Get the auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Delete the signed-in user's account
 */
export const deleteAccount = async () => {
    const response = await api.delete('/users/me', {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    deleteAccount
};
