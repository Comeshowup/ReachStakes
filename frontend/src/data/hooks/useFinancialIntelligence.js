/**
 * useFinancialIntelligence — Composite data hook for the Financial Intelligence component.
 * Composes useFinancialStrip (escrow) + usePerformanceMetrics (ROAS/overview)
 * into a single data contract with memoized formatting.
 */

import { useMemo } from 'react';
import { useFinancialStrip, usePerformanceMetrics } from './useDashboardWidgets';

// --- Formatting Helpers ---

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

/**
 * Format a number as USD currency string. Returns '$0' for invalid values.
 */
export const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '$0';
    return currencyFormatter.format(num);
};

/**
 * Format a date string or Date object. Returns 'N/A' for invalid values.
 */
export const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'N/A';
        return dateFormatter.format(d);
    } catch {
        return 'N/A';
    }
};

/**
 * Calculate "Due in X days" from a date string. Returns null if invalid.
 */
export const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    try {
        const target = new Date(dateString);
        if (isNaN(target.getTime())) return null;
        const now = new Date();
        const diffMs = target.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    } catch {
        return null;
    }
};

/**
 * Clamp a numeric ratio between 0 and 100.
 */
const clampRatio = (value) => Math.max(0, Math.min(100, Number(value) || 0));

/**
 * Determine health status from a liquidity ratio.
 */
const getHealthStatus = (ratio) => {
    if (ratio >= 50) return 'Healthy';
    if (ratio >= 20) return 'Warning';
    return 'Critical';
};

// --- Main Hook ---

export const useFinancialIntelligence = () => {
    const {
        data: escrow,
        isLoading: escrowLoading,
        isError: escrowError,
        refetch: refetchEscrow,
    } = useFinancialStrip();

    const {
        data: performance,
        isLoading: perfLoading,
        isError: perfError,
        refetch: refetchPerf,
    } = usePerformanceMetrics();

    const isLoading = escrowLoading || perfLoading;
    const isError = escrowError || perfError;

    const refetch = () => {
        refetchEscrow();
        refetchPerf();
    };

    // Memoize the computed financial intelligence data
    const data = useMemo(() => {
        if (isLoading || isError) return null;

        // --- Available Balance ---
        const availableBalance = Number(escrow?.available) || 0;
        const totalBalance = Number(escrow?.totalBalance) || 0;
        const liquidityRatio = totalBalance > 0
            ? clampRatio((availableBalance / totalBalance) * 100)
            : 0;
        const healthStatus = getHealthStatus(liquidityRatio);

        // --- Total Committed ---
        const totalCommitted = totalBalance;
        // We don't have a previous period from this API, so show the percentage of capacity
        const committedChangePercent = null; // Would come from a diff API
        const capacityPercent = totalBalance > 0
            ? clampRatio((Number(escrow?.locked) || 0) / totalBalance * 100)
            : 0;

        // --- Escrow ---
        const escrowAmount = Number(escrow?.locked) || 0;

        // --- Payouts ---
        const pendingPayouts = Number(escrow?.pendingPayouts) || 0;
        // Next payout date would come from an enriched API; placeholder for now
        const nextPayoutDate = null;
        const daysUntilPayout = getDaysUntil(nextPayoutDate);

        // --- ROAS ---
        const roas = performance?.overallROI || null;
        const roasValue = Number(roas?.value) || 0;
        const hasRoasData = roasValue > 0;
        // Approximate efficiency score for the bar (ROAS 1x=20%, 3x=60%, 5x=100%)
        const efficiencyScore = clampRatio(Math.min(roasValue / 5, 1) * 100);
        const activeSources = Number(performance?.activeCampaigns) || 0;

        return {
            // Available Balance card
            availableBalance,
            liquidityRatio,
            healthStatus,

            // Total Committed card
            totalCommitted,
            committedChangePercent,
            capacityPercent,

            // Escrow card
            escrowAmount,

            // Payout card
            pendingPayouts,
            nextPayoutDate,
            daysUntilPayout,
            hasPayoutData: pendingPayouts > 0,

            // ROAS card
            roasValue,
            hasRoasData,
            efficiencyScore,
            activeSources,

            // Empty state flag
            hasAnyData: availableBalance > 0 || totalCommitted > 0 || escrowAmount > 0 || hasRoasData,
        };
    }, [escrow, performance, isLoading, isError]);

    return {
        data,
        isLoading,
        isError,
        refetch,
    };
};

export default useFinancialIntelligence;
