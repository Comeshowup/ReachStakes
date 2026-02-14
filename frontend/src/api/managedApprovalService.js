import api from './axios';

/**
 * Managed Approval API Service
 * Handles toggle, CM queue, and managed approval actions.
 */

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Toggle managed approval for a campaign
 * @param {number} campaignId 
 * @param {boolean} enabled 
 * @param {string} mode - 'Manual' | 'AutoManaged'
 */
export const toggleManagedApproval = async (campaignId, enabled, mode = 'Manual') => {
    const response = await api.patch(`/managed-approvals/campaigns/${campaignId}/toggle`, {
        enabled,
        mode
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Get managed items for a brand
 * @param {number} brandId 
 */
export const getBrandManagedItems = async (brandId) => {
    const response = await api.get(`/managed-approvals/brand/${brandId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Request escalation to CM (brand asks for help)
 * @param {number} collabId 
 */
export const requestEscalation = async (collabId) => {
    const response = await api.post(`/managed-approvals/${collabId}/escalate`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// ============================================================
// ADMIN/CM ENDPOINTS
// ============================================================

/**
 * Get CM pending queue
 */
export const getCMQueue = async () => {
    const response = await api.get('/managed-approvals/cm-queue', {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Get CM dashboard stats
 */
export const getCMStats = async () => {
    const response = await api.get('/managed-approvals/stats', {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * CM picks up an item for review
 * @param {number} collabId 
 */
export const cmPickupItem = async (collabId) => {
    const response = await api.post(`/managed-approvals/${collabId}/cm-pickup`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * CM approves content on brand's behalf
 * @param {number} collabId 
 * @param {string} notes - Optional internal notes
 */
export const cmApprove = async (collabId, notes = '') => {
    const response = await api.post(`/managed-approvals/${collabId}/cm-approve`, {
        notes
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * CM rejects content on brand's behalf
 * @param {number} collabId 
 * @param {string} feedback - Required feedback for creator
 * @param {string} notes - Optional internal notes
 */
export const cmReject = async (collabId, feedback, notes = '') => {
    const response = await api.post(`/managed-approvals/${collabId}/cm-reject`, {
        feedback,
        notes
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    toggleManagedApproval,
    getBrandManagedItems,
    requestEscalation,
    getCMQueue,
    getCMStats,
    cmPickupItem,
    cmApprove,
    cmReject
};
