import React from 'react';
import { motion } from 'framer-motion';
import {
    Target,
    Activity,
    Users,
    TrendingUp,
    ArrowUpRight,
    AlertCircle
} from 'lucide-react';
import { usePerformanceMetrics } from '../../../data/hooks/useDashboardWidgets';

// --- Skeleton ---
const Skeleton = ({ className = '' }) => (
    <div className={`bd-skeleton ${className}`} />
);

const PerformanceSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bd-card p-6 space-y-4">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-14 w-24" />
            <Skeleton className="h-3 w-full" />
        </div>
        <div className="bd-card col-span-2 p-6 space-y-4">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-10 w-16" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// --- Error Fallback ---
const ErrorFallback = ({ onRetry }) => (
    <div className="bd-card p-8 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--bd-danger)' }} />
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--bd-text-primary)' }}>
            Failed to load performance metrics
        </p>
        <button onClick={onRetry}
            className="text-xs font-semibold px-4 py-2 rounded-xl"
            style={{ background: 'var(--bd-secondary)', color: 'var(--bd-secondary-fg)' }}>
            Try again
        </button>
    </div>
);

// --- Icon Color Map (semantic tokens) ---
const iconStyles = {
    purple: { background: 'var(--bd-purple-muted)', color: 'var(--bd-purple)' },
    green: { background: 'var(--bd-success-muted)', color: 'var(--bd-success)' },
    blue: { background: 'var(--bd-info-muted)', color: 'var(--bd-info)' },
};

// --- Main Component ---
const PerformanceMetricsWidget = React.memo(function PerformanceMetricsWidget({ className = '' }) {
    const { data: metrics, isLoading, isError, refetch } = usePerformanceMetrics();

    if (isLoading) return <PerformanceSkeleton />;
    if (isError) return <ErrorFallback onRetry={refetch} />;

    const roiValue = metrics?.overallROI?.value || 0;
    const activeCampaigns = metrics?.activeCampaigns || 0;
    const activeCreators = metrics?.activeCreators || 0;
    const hasData = activeCampaigns > 0;

    const targetRoas = 3.5;
    const roasProgress = hasData ? Math.min(Math.round((roiValue / targetRoas) * 100), 100) : 0;

    const activityMetrics = [
        {
            label: 'Active Campaigns',
            value: activeCampaigns,
            icon: Activity,
            color: 'green',
            description: hasData ? 'Currently running' : 'No active campaigns',
            actionLabel: 'Manage campaigns',
        },
        {
            label: 'Active Creators',
            value: activeCreators,
            icon: Users,
            color: 'blue',
            description: activeCreators > 0 ? 'Creators assigned' : 'No creators assigned',
            actionLabel: 'View creators',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={className}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* ROAS Card */}
                <div className="bd-card col-span-1 flex flex-col group overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b"
                        style={{ borderColor: 'var(--bd-border-default)', background: 'var(--bd-surface-header)' }}>
                        <div className="p-2.5 rounded-2xl" style={iconStyles.purple}>
                            <Target className="h-5 w-5" />
                        </div>
                        <button className="h-8 w-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="View ROAS breakdown">
                            <ArrowUpRight className="h-4 w-4" style={{ color: 'var(--bd-text-secondary)' }} />
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col justify-center p-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider mb-1"
                                    style={{ color: 'var(--bd-text-secondary)' }}>
                                    Overall ROAS
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-5xl font-extrabold tracking-tight"
                                        style={{ color: hasData ? 'var(--bd-text-value)' : 'var(--bd-text-secondary)' }}>
                                        {hasData ? `${roiValue.toFixed(1)}x` : '—'}
                                    </p>
                                    {hasData && (
                                        <span className="text-lg font-medium"
                                            style={{ color: 'var(--bd-text-muted)' }}>
                                            / {targetRoas}x
                                        </span>
                                    )}
                                </div>
                            </div>

                            {hasData && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span style={{ color: 'var(--bd-text-primary)' }}>Target Progress</span>
                                        <span style={{ color: roasProgress >= 90 ? 'var(--bd-success)' : 'var(--bd-text-primary)' }}>
                                            {roasProgress}%
                                        </span>
                                    </div>
                                    <div className="h-3 rounded-full overflow-hidden"
                                        style={{ background: 'var(--bd-progress-track)' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${roasProgress}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full rounded-full"
                                            style={{ background: 'var(--bd-primary)' }}
                                        />
                                    </div>
                                    <p className="text-xs pt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                        Return on Ad Spend
                                    </p>
                                </div>
                            )}
                            {!hasData && (
                                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                                    Launch campaigns to track ROAS
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Overview Card */}
                <div className="bd-card col-span-1 lg:col-span-2 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b"
                        style={{ borderColor: 'var(--bd-border-default)', background: 'var(--bd-surface-header)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl" style={iconStyles.blue}>
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight"
                                    style={{ color: 'var(--bd-text-primary)' }}>
                                    Activity Overview
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                                    Real-time platform metrics
                                </p>
                            </div>
                        </div>
                        <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors"
                            style={{ borderColor: 'var(--bd-border-default)', color: 'var(--bd-text-primary)' }}
                            aria-label="View all activity">
                            View All Activity
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 flex-1"
                        style={{ borderColor: 'var(--bd-border-default)' }}>
                        {activityMetrics.map((metric, idx) => {
                            const Icon = metric.icon;
                            const style = iconStyles[metric.color];
                            return (
                                <div key={metric.label}
                                    className="p-6 flex flex-col h-full group transition-colors"
                                    style={{ borderRight: idx === 0 ? '1px solid var(--bd-border-default)' : 'none' }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 rounded-xl" style={style}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                            style={{
                                                background: 'var(--bd-success-muted)',
                                                color: 'var(--bd-success)',
                                                border: '1px solid var(--bd-success-border)'
                                            }}>
                                            <TrendingUp className="h-3 w-3" />
                                            —
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-1">
                                        <p className="text-xs font-bold uppercase tracking-wider"
                                            style={{ color: 'var(--bd-text-secondary)' }}>
                                            {metric.label}
                                        </p>
                                        <p className="text-3xl font-extrabold tracking-tight"
                                            style={{ color: 'var(--bd-text-value)' }}>
                                            {metric.value}
                                        </p>
                                        <p className="text-xs font-medium"
                                            style={{ color: 'var(--bd-text-secondary)' }}>
                                            {metric.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{ borderTop: '1px solid var(--bd-border-muted)' }}>
                                        <button className="text-xs font-semibold flex items-center gap-1"
                                            style={{ color: 'var(--bd-primary)' }}>
                                            {metric.actionLabel} <ArrowUpRight className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default PerformanceMetricsWidget;
