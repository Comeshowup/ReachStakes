import api from './axios';

/**
 * Escrow Vault API Service
 * Provides access to escrow management endpoints
 */

// Get escrow overview (KPIs, liquidity, trends)
export const getEscrowOverview = async () => {
    const response = await api.get('/escrow/overview');
    return response.data;
};

// Get vault summary (reshaped for new Vault UI)
export const getVaultSummary = async () => {
    const response = await api.get('/escrow/summary');
    return response.data;
};

// Get campaigns with escrow funding data
export const getEscrowCampaigns = async () => {
    const response = await api.get('/escrow/campaigns');
    return response.data;
};

// Fund a campaign escrow
export const fundCampaignEscrow = async (campaignId, amount) => {
    const response = await api.post('/escrow/fund', { campaignId, amount });
    return response.data;
};

// Deposit funds into vault (general fund)
export const depositFunds = async (amount, method = 'Wire') => {
    const response = await api.post('/escrow/deposit', { amount, method });
    return response.data;
};

// Withdraw funds from vault
export const withdrawFunds = async (amount) => {
    const response = await api.post('/escrow/withdraw', { amount });
    return response.data;
};

// Release milestone funds
export const releaseMilestone = async (campaignId, milestoneId, amount) => {
    const response = await api.post('/escrow/release', { campaignId, milestoneId, amount });
    return response.data;
};

// Get paginated escrow transactions (with sort, search, filter)
export const getEscrowTransactions = async (page = 1, limit = 20, { sortBy = 'date', sortOrder = 'desc', search = '', type = '' } = {}) => {
    const params = new URLSearchParams({ page, limit, sortBy, sortOrder });
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    const response = await api.get(`/escrow/transactions?${params.toString()}`);
    return response.data;
};

// Get system operational status
export const getSystemStatus = async () => {
    const response = await api.get('/escrow/system-status');
    return response.data;
};

export default {
    getEscrowOverview,
    getVaultSummary,
    getEscrowCampaigns,
    fundCampaignEscrow,
    depositFunds,
    withdrawFunds,
    releaseMilestone,
    getEscrowTransactions,
    getSystemStatus,
};

