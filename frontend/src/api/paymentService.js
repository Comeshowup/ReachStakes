import api from './axios';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

/**
 * Parse a backend API error into a structured, user-friendly error.
 * Backend returns: { error: string, code: string, details?: object }
 * This extracts those fields and attaches them to the thrown Error so
 * UI components can display actionable messages.
 */
const parseApiError = (error, fallbackMessage) => {
    const data = error.response?.data;

    // Build a friendly error with structured fields
    const parsed = new Error(
        data?.error || error.message || fallbackMessage
    );
    parsed.code = data?.code || 'UNKNOWN';
    parsed.statusCode = error.response?.status || 500;
    parsed.details = data?.details || null;
    parsed.isPaymentError = true; // flag for UI consumers

    // Map specific backend codes to user-friendly guidance
    const codeMessages = {
        CONFIG_ERROR: 'Payment system is not properly configured. Please contact support.',
        AUTH_ERROR: 'Payment system is not properly configured. Please contact support.',
        IDENTICAL_PARTIES: 'Payment configuration issue. Please contact support.',
        AMOUNT_TOO_LOW: data?.error || 'Amount is below the minimum allowed.',
        AMOUNT_TOO_HIGH: data?.error || 'Amount exceeds the maximum allowed.',
        RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
        NO_CHECKOUT_URL: 'Payment service is temporarily unavailable. Please try again.',
        NOT_FOUND: data?.error || 'The requested resource was not found.',
        FORBIDDEN: 'You are not authorized to perform this action.',
    };

    if (codeMessages[parsed.code]) {
        parsed.userMessage = codeMessages[parsed.code];
    } else {
        parsed.userMessage = parsed.message;
    }

    return parsed;
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
            throw parseApiError(error, 'Failed to calculate fees');
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
            throw parseApiError(error, 'Failed to fetch escrow details');
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
            throw parseApiError(error, 'Failed to initiate payment');
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
            throw parseApiError(error, 'Failed to fetch transaction history');
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
            throw parseApiError(error, 'Failed to fetch transaction status');
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
            throw parseApiError(error, 'Failed to verify payment');
        }
    }
};

export default paymentService;
