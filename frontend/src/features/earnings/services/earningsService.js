/**
 * Earnings Service — API layer for the earnings module.
 * Uses the shared axios instance (auto-injects Bearer token).
 */
import api from '../../../api/axios';

const BASE = '/creators';

/**
 * Fetch the aggregated earnings summary for the dashboard.
 * Single endpoint replaces the previous multi-call pattern.
 *
 * @returns {Promise<import('../types/earnings.types').EarningsSummary>}
 */
export const getEarningsSummary = async () => {
  const response = await api.get(`${BASE}/earnings-summary`);
  // Support both `{ data: EarningsSummary }` and direct EarningsSummary responses
  return response.data?.data ?? response.data;
};

/**
 * Fetch paginated + filtered transaction ledger.
 *
 * @param {import('../types/earnings.types').TransactionFilters} filters
 * @returns {Promise<{ transactions: import('../types/earnings.types').Transaction[], total: number, page: number, totalPages: number }>}
 */
export const getTransactions = async (filters = {}) => {
  const { page = 1, limit = 20, status = '', type = '', campaignId = '', from = '', to = '' } = filters;
  const response = await api.get(`${BASE}/transactions`, {
    params: { page, limit, status: status || undefined, type: type || undefined, campaignId: campaignId || undefined, from: from || undefined, to: to || undefined },
  });
  return response.data?.data ?? response.data;
};

/**
 * Request a manual withdrawal of available balance.
 *
 * @param {number} amount
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export const requestWithdraw = async (amount) => {
  const response = await api.post(`${BASE}/withdrawals`, { amount });
  return response.data;
};
