import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';

import useCreatorAnalytics from '../../../hooks/useCreatorAnalytics';
import MetricsRow from '../../components/analytics/MetricsRow';
import PerformanceChart from '../../components/analytics/PerformanceChart';
import PlatformPerformance from '../../components/analytics/PlatformPerformance';
import ContentPerformanceTable from '../../components/analytics/ContentPerformanceTable';
import AnalyticsEmptyState from '../../components/analytics/AnalyticsEmptyState';

// ─── Error Banner ────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
    <div
        className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-6"
        style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
        }}
    >
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-sm flex-1" style={{ color: 'var(--bd-text-primary)' }}>
            {message}
        </p>
        <button
            onClick={onRetry}
            className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors"
        >
            Retry
        </button>
    </div>
);

// ─── AnalyticsPage ───────────────────────────────────────────────────────────
const AnalyticsPage = () => {
    const {
        data,
        sortedVideos,
        hasData,
        loading,
        error,
        timeRange,
        setTimeRange,
        selectedMetric,
        setSelectedMetric,
        sortBy,
        setSortBy,
        refetch,
    } = useCreatorAnalytics();

    return (
        <div className="space-y-8">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl font-bold tracking-tight mb-1"
                        style={{ color: 'var(--bd-text-primary)' }}
                    >
                        Analytics
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                        Track your content performance, platform reach, and engagement trends
                    </p>
                </div>

                {/* Refresh button (only when data exists) */}
                {!loading && (
                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                        style={{
                            background: 'var(--bd-surface-overlay)',
                            border: '1px solid var(--bd-border-subtle)',
                            color: 'var(--bd-text-secondary)',
                        }}
                        title="Refresh analytics"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
            </div>

            {/* ── Error Banner ── */}
            {error && <ErrorBanner message={error} onRetry={refetch} />}

            {/* ── Empty State ── */}
            <AnimatePresence mode="wait">
                {!loading && !error && !hasData ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AnalyticsEmptyState />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        {/* 1 ── Performance Summary KPI Row */}
                        <MetricsRow metrics={data?.metrics} loading={loading} />

                        {/* 2 ── Performance Over Time */}
                        <PerformanceChart
                            timeline={data?.timeline ?? []}
                            loading={loading}
                            timeRange={timeRange}
                            setTimeRange={setTimeRange}
                            selectedMetric={selectedMetric}
                            setSelectedMetric={setSelectedMetric}
                        />

                        {/* 3 ── Platform Performance */}
                        <PlatformPerformance
                            platformStats={data?.platformStats ?? []}
                            loading={loading}
                        />

                        {/* 4 ── Content Performance Table */}
                        <ContentPerformanceTable
                            videos={sortedVideos}
                            loading={loading}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AnalyticsPage;
