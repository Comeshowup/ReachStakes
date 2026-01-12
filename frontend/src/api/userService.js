import api from './axios';

// Get the auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get authenticated user's posts
 */
export const getMyPosts = async () => {
    const response = await api.get('/users/me/posts', {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Create a new post
 * @param {Object} postData - { content, mediaType, mediaUrl }
 */
export const createPost = async (postData) => {
    const response = await api.post('/users/me/posts', postData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Delete a post
 * @param {number} postId
 */
export const deletePost = async (postId) => {
    const response = await api.delete(`/users/me/posts/${postId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
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
    getMyPosts,
    createPost,
    deletePost,
    deleteAccount
};
