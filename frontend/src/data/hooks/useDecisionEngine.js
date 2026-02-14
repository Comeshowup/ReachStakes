/**
 * useDecisionEngine Hook
 * Integrates Decision Engine with TanStack Query
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    usePerformanceMetrics,
    useCampaignsTable,
    useFinancialStrip,
    useContentApprovals
} from './useDashboardWidgets';
import { getDecisionEngineData } from '../services/decisionEngine';
import { widgetContracts } from '../contracts/widgetContracts';

/**
 * Main Decision Engine Hook
 * Aggregates data from all widgets and produces actionable insights
 */
export const useDecisionEngine = () => {
    // Fetch all required data
    const { data: metrics, isLoading: metricsLoading } = usePerformanceMetrics();
    const { data: campaigns, isLoading: campaignsLoading } = useCampaignsTable();
    const { data: escrow, isLoading: escrowLoading } = useFinancialStrip();
    const { data: approvals, isLoading: approvalsLoading } = useContentApprovals();

    const isLoading = metricsLoading || campaignsLoading || escrowLoading || approvalsLoading;

    // Compute decision engine data
    const engineData = useMemo(() => {
        if (isLoading) return null;

        return getDecisionEngineData({
            metrics,
            campaigns,
            escrow,
            approvals
        });
    }, [metrics, campaigns, escrow, approvals, isLoading]);

    return {
        ...engineData,
        isLoading,
        // Convenience accessors
        alerts: engineData?.alerts || [],
        criticalCount: engineData?.criticalCount || 0,
        warningCount: engineData?.warningCount || 0,
        insights: engineData?.insights || [],
        hasUrgentItems: engineData?.hasUrgentItems || false
    };
};

/**
 * Enhanced Decision Strip Hook
 * Combines original decision strip with engine alerts
 */
export const useEnhancedDecisionStrip = () => {
    const { alerts, criticalCount, warningCount, insights, isLoading } = useDecisionEngine();
    const { data: approvals } = useContentApprovals();

    const pendingCount = approvals?.totalPending || 0;

    // Group alerts by type for display
    const alertGroups = useMemo(() => {
        if (!alerts.length) return {};

        return alerts.reduce((acc, alert) => {
            const key = alert.type.split('_')[0]; // pacing, budget, roi, etc.
            if (!acc[key]) acc[key] = [];
            acc[key].push(alert);
            return acc;
        }, {});
    }, [alerts]);

    return {
        pendingCount,
        criticalCount,
        warningCount,
        alerts,
        alertGroups,
        insights,
        hasIssues: pendingCount > 0 || criticalCount > 0 || warningCount > 0,
        isLoading
    };
};

export default useDecisionEngine;
