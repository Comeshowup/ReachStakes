import api from './axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

const paymentService = {
    /**
     * Calculate fees for a given amount
     * @param {number} amount 
     * @returns {Promise<{amount, platformFee, processingFee, total}>}
     */
    calculateFees: async (amount) => {
        try {
            const response = await api.post(
                '/payments/calculate-fees',
                { amount },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Calculate Fees Error:', error);
            throw error;
        }
    },

    /**
     * Get escrow details for a campaign
     * @param {number} campaignId 
     * @returns {Promise<Object>}
     */
    getEscrowDetails: async (campaignId) => {
        try {
            const response = await api.get(
                `/payments/escrow/${campaignId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Get Escrow Details Error:', error);
            throw error;
        }
    },

    /**
     * Initiate a payment session for a campaign
     * @param {string} campaignId 
     * @param {number} amount
     * @returns {Promise<{url: string, transactionId: number}>}
     */
    initiateCampaignPayment: async (campaignId, amount) => {
        try {
            const response = await api.post(
                '/payments/checkout',
                { campaignId, amount },
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Payment Initiation Error:', error);
            throw error;
        }
    },

    /**
     * Get transaction history
     * @param {Object} filters - { campaignId? }
     * @returns {Promise<Array>}
     */
    getTransactionHistory: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.campaignId) params.append('campaignId', filters.campaignId);

            const response = await api.get(
                `/payments/history?${params.toString()}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Get Transaction History Error:', error);
            throw error;
        }
    },

    /**
     * Get single transaction status
     * @param {number} transactionId
     * @returns {Promise<Object>}
     */
    getTransactionStatus: async (transactionId) => {
        try {
            const response = await api.get(
                `/payments/status/${transactionId}`,
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Get Transaction Status Error:', error);
            throw error;
        }
    },

    /**
     * Verify payment status by checking with Tazapay API directly
     * This is used when webhooks can't reach the server (e.g., localhost)
     * @param {number} transactionId
     * @returns {Promise<{status: string, message: string}>}
     */
    verifyPayment: async (transactionId) => {
        try {
            const response = await api.post(
                `/payments/verify/${transactionId}`,
                {},
                getAuthHeaders()
            );
            return response.data;
        } catch (error) {
            console.error('Verify Payment Error:', error);
            throw error;
        }
    }
};

export default paymentService;
