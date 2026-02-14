import axiosInstance from './axios';

/**
 * Dashboard Service
 * Provides access to brand dashboard data endpoints
 */

// Get dashboard overview (KPIs, overall ROI)
export const getDashboardOverview = async () => {
    const response = await axiosInstance.get('/dashboard/overview');
    return response.data;
};

// Get campaigns summary with pacing status
export const getCampaignsSummary = async () => {
    const response = await axiosInstance.get('/dashboard/campaigns');
    return response.data;
};

// Get escrow status with allocations
export const getEscrowStatus = async () => {
    const response = await axiosInstance.get('/dashboard/escrow');
    return response.data;
};

// Get pending approvals grouped by campaign
export const getPendingApprovals = async () => {
    const response = await axiosInstance.get('/dashboard/approvals');
    return response.data;
};

// Get recent activity feed
export const getRecentActivity = async (limit = 20) => {
    const response = await axiosInstance.get(`/dashboard/activity?limit=${limit}`);
    return response.data;
};

// Get top performing campaigns
export const getTopCampaigns = async (limit = 3) => {
    const response = await axiosInstance.get(`/dashboard/top-campaigns?limit=${limit}`);
    return response.data;
};

export default {
    getDashboardOverview,
    getCampaignsSummary,
    getEscrowStatus,
    getPendingApprovals,
    getRecentActivity,
    getTopCampaigns
};
