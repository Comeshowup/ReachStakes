import api from './axios';

/**
 * Admin API Service
 * Handles all admin/manager-related API calls
 */

// Get the auth token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch all campaigns (for admin view)
 */
export const getAllCampaigns = async () => {
    // The backend returns { status: 'success', data: [...campaigns] }
    const response = await api.get('/campaigns/all', {
        headers: getAuthHeaders()
    });
    // Extract the campaigns array from the response wrapper
    return response.data.data || [];
};

/**
 * Fetch collaborations for a specific campaign
 * @param {number} campaignId 
 */
export const getCampaignCollaborations = async (campaignId) => {
    const response = await api.get(`/collaborations/campaign/${campaignId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Approve a collaboration (Decision)
 * @param {number} id - Collaboration ID
 * @param {string} feedback - Optional feedback
 */
export const approveCollaboration = async (id, feedback = "") => {
    const response = await api.patch(`/collaborations/${id}/decision`, {
        status: 'In_Progress', // This triggers the bundle generation
        feedback
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    getAllCampaigns,
    getCampaignCollaborations,
    approveCollaboration
};
