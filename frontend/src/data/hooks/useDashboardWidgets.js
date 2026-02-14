/**
 * Dashboard Widget Hooks
 * TanStack Query hooks for each dashboard widget with proper caching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import dashboardService from '../../api/dashboardService';
import { widgetContracts } from '../contracts/widgetContracts';

// Query key factory for dashboard
export const dashboardKeys = {
    all: ['dashboard'],
    overview: () => [...dashboardKeys.all, 'overview'],
    campaigns: () => [...dashboardKeys.all, 'campaigns'],
    escrow: () => [...dashboardKeys.all, 'escrow'],
    approvals: () => [...dashboardKeys.all, 'approvals'],
    activity: (limit) => [...dashboardKeys.all, 'activity', { limit }],
    topCampaigns: (limit) => [...dashboardKeys.all, 'top-campaigns', { limit }]
};

/**
 * Hook: Dashboard Overview (Performance Metrics)
 * Returns: overallROI, stats, KPIs
 */
export const usePerformanceMetrics = () => {
    const contract = widgetContracts.performanceMetrics;

    return useQuery({
        queryKey: dashboardKeys.overview(),
        queryFn: async () => {
            const res = await dashboardService.getDashboardOverview();
            if (res.status !== 'success') throw new Error('Failed to fetch overview');
            return res.data;
        },
        ...contract.queryOptions,
        select: (data) => ({
            overallROI: data.overallROI,
            stats: data.stats,
            activeCampaigns: data.stats?.activeCampaigns?.value || 0,
            activeCreators: data.stats?.activeCreators?.value || 0,
            atRiskCampaigns: data.stats?.atRiskCampaigns || 0
        })
    });
};

/**
 * Hook: Campaigns Table
 * Returns: campaigns array with pacing, budget, ROI
 */
export const useCampaignsTable = () => {
    const contract = widgetContracts.campaignsTable;

    return useQuery({
        queryKey: dashboardKeys.campaigns(),
        queryFn: async () => {
            const res = await dashboardService.getCampaignsSummary();
            if (res.status !== 'success') throw new Error('Failed to fetch campaigns');
            return res.data.campaigns || [];
        },
        ...contract.queryOptions
    });
};

/**
 * Hook: Financial Strip (Escrow Data)
 * Returns: available, locked, totalBalance, pendingPayouts
 */
export const useFinancialStrip = () => {
    const contract = widgetContracts.financialStrip;

    return useQuery({
        queryKey: dashboardKeys.escrow(),
        queryFn: async () => {
            const res = await dashboardService.getEscrowStatus();
            if (res.status !== 'success') throw new Error('Failed to fetch escrow');
            return res.data;
        },
        ...contract.queryOptions,
        select: (data) => ({
            available: data.available || 0,
            locked: data.locked || 0,
            totalBalance: data.totalBalance || 0,
            pendingPayouts: data.pendingPayouts || 0
        })
    });
};

/**
 * Hook: Content Approvals
 * Returns: totalPending, groupedByCampaign
 */
export const useContentApprovals = () => {
    const contract = widgetContracts.contentApprovals;

    return useQuery({
        queryKey: dashboardKeys.approvals(),
        queryFn: async () => {
            const res = await dashboardService.getPendingApprovals();
            if (res.status !== 'success') throw new Error('Failed to fetch approvals');
            return res.data;
        },
        ...contract.queryOptions
    });
};

/**
 * Hook: Activity Feed
 * Returns: activities array
 */
export const useActivityFeed = (limit = 10) => {
    const contract = widgetContracts.activityFeed;

    return useQuery({
        queryKey: dashboardKeys.activity(limit),
        queryFn: async () => {
            const res = await dashboardService.getRecentActivity(limit);
            if (res.status !== 'success') throw new Error('Failed to fetch activity');
            return res.data.activities || [];
        },
        ...contract.queryOptions
    });
};

/**
 * Hook: Decision Strip (Aggregated Alerts)
 * Combines data from multiple sources for urgent items
 */
export const useDecisionStrip = () => {
    const { data: metrics } = usePerformanceMetrics();
    const { data: campaigns } = useCampaignsTable();
    const { data: approvals } = useContentApprovals();

    const pendingCount = approvals?.totalPending || 0;
    const atRiskCampaigns = metrics?.atRiskCampaigns || 0;

    const underspending = campaigns?.filter(c => c.pacing?.status === 'Underspending').length || 0;
    const overspending = campaigns?.filter(c => c.pacing?.status === 'Overspending').length || 0;
    const anomalyCount = underspending + overspending;

    return {
        pendingCount,
        atRiskCampaigns,
        anomalyCount,
        underspending,
        overspending,
        hasIssues: pendingCount > 0 || atRiskCampaigns > 0 || anomalyCount > 0
    };
};

/**
 * Hook: Invalidate All Dashboard Data
 * Use after mutations that affect dashboard
 */
export const useInvalidateDashboard = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    };
};

/**
 * Hook: Prefetch Dashboard Data
 * Call on route enter for faster perceived load
 */
export const usePrefetchDashboard = () => {
    const queryClient = useQueryClient();

    return () => {
        queryClient.prefetchQuery({
            queryKey: dashboardKeys.overview(),
            queryFn: () => dashboardService.getDashboardOverview()
        });
        queryClient.prefetchQuery({
            queryKey: dashboardKeys.campaigns(),
            queryFn: () => dashboardService.getCampaignsSummary()
        });
        queryClient.prefetchQuery({
            queryKey: dashboardKeys.escrow(),
            queryFn: () => dashboardService.getEscrowStatus()
        });
    };
};
