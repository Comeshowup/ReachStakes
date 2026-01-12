import axios from './axios';

const API_BASE = '/payouts';

export const payoutService = {
    // ============================================
    // SECURE HOSTED ONBOARDING (RECOMMENDED)
    // ============================================

    /**
     * Initiate secure hosted onboarding
     * Returns a URL to redirect the user to Tazapay's secure portal
     */
    initiateOnboarding: async () => {
        const response = await axios.post(`${API_BASE}/initiate-onboarding`);
        return response.data;
    },

    /**
     * Get current onboarding status
     * Includes entity status, beneficiary ID, bank details if connected
     */
    getOnboardingStatus: async () => {
        const response = await axios.get(`${API_BASE}/onboarding-status`);
        return response.data;
    },

    /**
     * Regenerate onboarding link if expired
     */
    regenerateOnboardingLink: async () => {
        const response = await axios.post(`${API_BASE}/regenerate-link`);
        return response.data;
    },

    // ============================================
    // LEGACY METHODS (kept for backward compatibility)
    // ============================================

    /**
     * Get required bank fields for a country/currency
     * @param {string} country - ISO 2-letter country code
     * @param {string} currency - ISO 3-letter currency code
     */
    getBankFields: async (country, currency = 'USD') => {
        const response = await axios.get(`${API_BASE}/bank-fields`, {
            params: { country, currency }
        });
        return response.data;
    },

    /**
     * @deprecated Use initiateOnboarding instead
     * Connect bank account directly (passes PII through your servers)
     * @param {Object} bankDetails - Bank account details
     */
    connectBank: async (bankDetails) => {
        const response = await axios.post(`${API_BASE}/connect-bank`, bankDetails);
        return response.data;
    },

    /**
     * Get current payout setup status
     */
    getPayoutStatus: async () => {
        const response = await axios.get(`${API_BASE}/status`);
        return response.data;
    },

    /**
     * Disconnect bank account
     */
    disconnectBank: async () => {
        const response = await axios.post(`${API_BASE}/disconnect`);
        return response.data;
    },

    /**
     * Get payout history
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     */
    getPayoutHistory: async (page = 1, limit = 10) => {
        const response = await axios.get(`${API_BASE}/history`, {
            params: { page, limit }
        });
        return response.data;
    }
};

export default payoutService;

