/**
 * Earnings Hooks — TanStack Query v5 hooks for the earnings module.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEarningsSummary, getTransactions, requestWithdraw } from '../services/earningsService';

// ─── Query Keys ────────────────────────────────────────────────────────────
export const EARNINGS_KEYS = {
  summary: ['earnings-summary'],
  transactions: (filters) => ['transactions', filters],
};

// ─── Earnings Summary ──────────────────────────────────────────────────────
/**
 * Fetches the aggregated earnings dashboard data (single endpoint).
 * Data is cached for 60 seconds to avoid redundant fetches on tab switches.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult<import('../types/earnings.types').EarningsSummary>}
 */
export const useEarnings = () =>
  useQuery({
    queryKey: EARNINGS_KEYS.summary,
    queryFn: getEarningsSummary,
    staleTime: 60_000,          // 1 minute
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

// ─── Transaction Ledger ────────────────────────────────────────────────────
/**
 * Fetches paginated + filtered transactions.
 * Uses `placeholderData: keepPreviousData` for smooth pagination (no flash).
 *
 * @param {import('../types/earnings.types').TransactionFilters} filters
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export const useTransactions = (filters) =>
  useQuery({
    queryKey: EARNINGS_KEYS.transactions(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: (prev) => prev,   // v5 equivalent of keepPreviousData
    staleTime: 30_000,
    retry: 1,
  });

// ─── Withdraw Mutation ─────────────────────────────────────────────────────
/**
 * Mutation to request a manual payout withdrawal.
 * On success, invalidates the summary cache so balances refresh immediately.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export const useWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestWithdraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EARNINGS_KEYS.summary });
    },
  });
};
