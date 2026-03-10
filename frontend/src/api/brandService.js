import api from './axios';

/**
 * Brand API Service
 * Handles all brand-related API calls
 */

// Get the auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch the authenticated brand's profile
 */
export const getBrandProfile = async () => {
    const response = await api.get('/brands/profile', {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Update the brand's profile
 * @param {Object} profileData - Profile data to update
 */
export const updateBrandProfile = async (profileData) => {
    const response = await api.put('/brands/profile', profileData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Upload brand logo (multipart/form-data)
 * @param {File} file - Image file (jpg, png, webp — max 2MB)
 */
export const uploadLogo = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/brands/profile/logo', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload brand cover image (multipart/form-data)
 * @param {File} file - Image file (jpg, png, webp — max 5MB)
 */
export const uploadCover = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/brands/profile/cover', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload brand document (brand guidelines or media kit)
 * @param {File} file - PDF file (max 10MB)
 * @param {string} type - 'brandGuidelines' or 'mediaKit'
 */
export const uploadDocument = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post('/brands/profile/documents', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Fetch the brand's community posts
 */
export const getBrandPosts = async () => {
    const response = await api.get('/brands/posts', {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Create a new community post
 * @param {Object} postData - Post data (content, mediaType, mediaUrl, type)
 */
export const createBrandPost = async (postData) => {
    const response = await api.post('/brands/posts', postData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Delete a community post
 * @param {number} postId - ID of the post to delete
 */
export const deleteBrandPost = async (postId) => {
    const response = await api.delete(`/brands/posts/${postId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Fetch the brand's campaigns with stats
 */
export const getBrandCampaigns = async () => {
    const response = await api.get('/brands/campaigns', {
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

/**
 * Create a new campaign
 * @param {Object} campaignData - Campaign data
 */
export const createCampaign = async (campaignData) => {
    const response = await api.post('/campaigns', campaignData, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    getBrandProfile,
    updateBrandProfile,
    uploadLogo,
    uploadCover,
    uploadDocument,
    getBrandPosts,
    createBrandPost,
    deleteBrandPost,
    getBrandCampaigns,
    deleteAccount,
    createCampaign
};
