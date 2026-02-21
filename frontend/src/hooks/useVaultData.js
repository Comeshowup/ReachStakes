/**
 * useVaultData — React Query hooks for the Vault Overview page.
 * Provides data fetching, caching, mutations, and optimistic updates.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVaultSummary,
    getEscrowTransactions,
    getEscrowCampaigns,
    depositFunds,
    withdrawFunds,
    fundCampaignEscrow,
    getSystemStatus,
} from '../api/escrowService';

const VAULT_KEYS = {
    summary: ['vault', 'summary'],
    transactions: (params) => ['vault', 'transactions', params],
    campaigns: ['vault', 'campaigns'],
    systemStatus: ['vault', 'systemStatus'],
};

/**
 * Fetch vault summary (balance, available, locked, pending, trend)
 */
export function useVaultSummary() {
    return useQuery({
        queryKey: VAULT_KEYS.summary,
        queryFn: async () => {
            const res = await getVaultSummary();
            return res.data;
        },
        staleTime: 30_000,       // 30s
        refetchInterval: 60_000, // refetch every 60s
    });
}

/**
 * Fetch paginated, sortable, searchable transactions
 */
export function useVaultTransactions(page = 1, limit = 10, { sortBy = 'date', sortOrder = 'desc', search = '', type = '' } = {}) {
    return useQuery({
        queryKey: VAULT_KEYS.transactions({ page, limit, sortBy, sortOrder, search, type }),
        queryFn: async () => {
            const res = await getEscrowTransactions(page, limit, { sortBy, sortOrder, search, type });
            return res.data;
        },
        staleTime: 15_000,
        keepPreviousData: true, // smooth pagination
    });
}

/**
 * Fetch campaigns for allocation modal
 */
export function useVaultCampaigns() {
    return useQuery({
        queryKey: VAULT_KEYS.campaigns,
        queryFn: async () => {
            const res = await getEscrowCampaigns();
            return res.data;
        },
        staleTime: 60_000,
    });
}

/**
 * System status polling (lightweight heartbeat)
 */
export function useSystemStatus() {
    return useQuery({
        queryKey: VAULT_KEYS.systemStatus,
        queryFn: async () => {
            const res = await getSystemStatus();
            return res.data;
        },
        staleTime: 120_000,
        refetchInterval: 120_000,
    });
}

/**
 * Deposit funds mutation
 */
export function useDepositFunds() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ amount, method }) => depositFunds(amount, method),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VAULT_KEYS.summary });
            queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
        },
    });
}

/**
 * Withdraw funds mutation
 */
export function useWithdrawFunds() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ amount }) => withdrawFunds(amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VAULT_KEYS.summary });
            queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
        },
    });
}

/**
 * Allocate to campaign mutation (wraps existing fundCampaignEscrow)
 */
export function useAllocateCampaign() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ campaignId, amount }) => fundCampaignEscrow(campaignId, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: VAULT_KEYS.summary });
            queryClient.invalidateQueries({ queryKey: VAULT_KEYS.campaigns });
            queryClient.invalidateQueries({ queryKey: ['vault', 'transactions'] });
        },
    });
}
