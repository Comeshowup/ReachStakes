import api from './axios';

/**
 * Concierge & Approval API Service
 * Handles Social Verification, Escrow Release, and Brand Decisions.
 */

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all collaborations for a brand (used to populate the queue)
 * @param {number|string} brandId 
 */
export const getBrandQueue = async (brandId) => {
    // We fetch all and filter/sort on frontend or use query params if implemented
    const response = await api.get(`/collaborations/brand/${brandId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Get brand approvals queue — only Under_Review / Changes_Requested with submissionUrl.
 * Returns pre-mapped items ready for the ApprovalQueue UI.
 * @param {number|string} brandId
 */
export const getBrandApprovalsQueue = async (brandId) => {
    const response = await api.get(`/collaborations/brand/${brandId}/approvals`, {
        headers: getAuthHeaders()
    });
    return response.data; // { status, count, data: [...items] }
};

/**
 * Verify Social Metrics (Read-only Sync)
 * @param {number} collaborationId
 */
export const verifySocialMetrics = async (collaborationId) => {
    const response = await api.get(`/concierge/verify-metrics/${collaborationId}`, {
        headers: getAuthHeaders()
    });
    return response.data; // { status, data: { formatted stats... } }
};

/**
 * Release Payout (Escrow)
 * @param {number} collaborationId
 */
export const releaseEscrow = async (collaborationId) => {
    const response = await api.post(`/concierge/release-payout/${collaborationId}`, {}, {
        headers: getAuthHeaders()
    });
    return response.data;
};

/**
 * Submit Brand Decision (Approve / Revision)
 * @param {number} collaborationId 
 * @param {string} status - 'Approved', 'Changes_Requested', 'Rejected'
 * @param {string} feedback - Optional feedback note
 */
export const submitDecision = async (collaborationId, status, feedback = "") => {
    const response = await api.patch(`/collaborations/${collaborationId}/decision`, {
        status,
        feedback
    }, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export default {
    getBrandQueue,
    verifySocialMetrics,
    releaseEscrow,
    submitDecision
};
