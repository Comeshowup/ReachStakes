import api from './axios';

/**
 * Campaign View API Service
 * Handles API calls for the brand campaign view page
 */

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetch full campaign data for view page
 * @param {number} campaignId - Campaign ID
 */
export const getCampaignViewData = async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}/view`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Fetch campaign activity log
 * @param {number} campaignId - Campaign ID
 * @param {number} limit - Max number of events (default 10)
 */
export const getCampaignActivity = async (campaignId, limit = 10) => {
    const response = await api.get(`/campaigns/${campaignId}/activity?limit=${limit}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Update campaign status (pause/end)
 * @param {number} campaignId - Campaign ID
 * @param {string} status - New status (Active, Paused, Completed)
 */
export const updateCampaignStatus = async (campaignId, status) => {
    const response = await api.patch(`/campaigns/${campaignId}/status`,
        { status },
        { headers: getAuthHeaders() }
    );
    return response.data;
};

export default {
    getCampaignViewData,
    getCampaignActivity,
    updateCampaignStatus
};
