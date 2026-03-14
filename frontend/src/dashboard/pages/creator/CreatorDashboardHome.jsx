import React, { useState, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

import useCreatorOverview from '../../../hooks/useCreatorOverview';
import CampaignDrawer from '../../components/CampaignDrawer';

// New modular overview components
import CreatorStatusBanner from '../../components/creator/CreatorStatusBanner';
import CreatorMetrics from '../../components/creator/CreatorMetrics';
import ActiveCampaigns from '../../components/creator/ActiveCampaigns';
import EarningsSummary from '../../components/creator/EarningsSummary';
import UpcomingDeliverables from '../../components/creator/UpcomingDeliverables';
import CampaignOpportunities from '../../components/creator/CampaignOpportunities';
import PerformanceSnapshot from '../../components/creator/PerformanceSnapshot';

// ─── Page-level skeleton ──────────────────────────────────────────────────────
const DashboardSkeleton = () => (
    <div
        className="space-y-6 animate-pulse"
        style={{ padding: '32px' }}
        aria-label="Loading dashboard"
        aria-busy="true"
    >
        {/* Banner skeleton */}
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
        {/* Metrics skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
            ))}
        </div>
        {/* Row 2 skeleton */}
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 h-64 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
            <div className="col-span-12 lg:col-span-4 h-64 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
        </div>
        {/* Row 3 skeleton */}
        <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 h-48 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
            <div className="col-span-12 lg:col-span-6 h-48 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
        </div>
        {/* Row 4 skeleton */}
        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-[14px]" />
    </div>
);

// ─── Error screen ─────────────────────────────────────────────────────────────
const DashboardError = ({ onRetry }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center px-4"
        role="alert"
    >
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong loading your dashboard.
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-sm">
            We couldn't fetch your campaign data. Check your connection and try again.
        </p>
        <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
            <RefreshCw className="w-4 h-4" /> Retry
        </button>
    </motion.div>
);

// ─── Main dashboard page ──────────────────────────────────────────────────────
const CreatorDashboardHome = () => {
    const {
        stats,
        activeCampaigns,
        earnings,
        deliverables,
        recommendedCampaigns,
        performance,
        profileCompletion,
        userName,
        loading,
        error,
        refetch,
    } = useCreatorOverview();

    // Campaign drawer state
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleCampaignClick = useCallback((campaign, index) => {
        setSelectedCampaign({
            ...campaign,
            brandColor: ['#6366f1', '#ec4899', '#ef4444'][index % 3],
        });
        setIsDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

    // Loading
    if (loading) return <DashboardSkeleton />;

    // Error
    if (error) return <DashboardError onRetry={refetch} />;

    return (
        <>
            <div
                className="space-y-6"
                style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}
            >
                {/* Welcome header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Welcome back, {userName?.split(' ')[0] || 'Creator'} 👋
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        Here's what's happening with your campaigns today.
                    </p>
                </div>

                {/* ── Status Banner (conditional) ──────────────────────────── */}
                <CreatorStatusBanner profileCompletion={profileCompletion} />

                {/* ── Row 1: Metrics (full width) ──────────────────────────── */}
                <CreatorMetrics stats={stats} />

                {/* ── Row 2: Active Campaigns (8) + Earnings (4) ───────────── */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-8">
                        <ActiveCampaigns
                            campaigns={activeCampaigns}
                            onCampaignClick={handleCampaignClick}
                        />
                    </div>
                    <div className="col-span-12 lg:col-span-4">
                        <EarningsSummary earnings={earnings} />
                    </div>
                </div>

                {/* ── Row 3: Deliverables (6) + Opportunities (6) ──────────── */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-6">
                        <UpcomingDeliverables deliverables={deliverables} />
                    </div>
                    <div className="col-span-12 lg:col-span-6">
                        <CampaignOpportunities campaigns={recommendedCampaigns} />
                    </div>
                </div>

                {/* ── Row 4: Performance (full width) ──────────────────────── */}
                <PerformanceSnapshot socialPerformance={performance} />
            </div>

            {/* Campaign Detail Drawer */}
            <CampaignDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                campaign={selectedCampaign}
            />
        </>
    );
};

export default CreatorDashboardHome;
