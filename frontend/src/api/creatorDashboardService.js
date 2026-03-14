import axiosInstance from './axios';

/**
 * Creator Dashboard Service
 * Provides access to creator-specific dashboard data endpoints
 */

/**
 * Fetch the authenticated creator's profile.
 * Mirrors getBrandProfile in brandService.js.
 */
export const getCreatorProfile = async () => {
    const response = await axiosInstance.get('/creators/profile');
    return response.data;
};

// Get creator dashboard stats (KPIs, quick wins, match score)
export const getCreatorDashboardStats = async () => {
    const response = await axiosInstance.get('/users/me/dashboard-stats');
    return response.data;
};

// Get creator's active campaigns/collaborations
export const getCreatorCampaigns = async () => {
    const response = await axiosInstance.get('/collaborations/my-campaigns');
    return response.data;
};

// Get recommended campaigns for the creator
export const getRecommendedCampaigns = async () => {
    try {
        const response = await axiosInstance.get('/campaigns/recommended');
        return response.data;
    } catch {
        // Endpoint may not exist yet — return empty
        return { status: 'success', data: [] };
    }
};

export default {
    getCreatorProfile,
    getCreatorDashboardStats,
    getCreatorCampaigns,
    getRecommendedCampaigns
};
