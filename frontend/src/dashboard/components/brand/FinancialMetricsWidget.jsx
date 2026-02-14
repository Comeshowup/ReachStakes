import React from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    Lock,
    PiggyBank,
    Calendar,
    TrendingUp,
    DollarSign,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { useFinancialStrip } from '../../../data/hooks/useDashboardWidgets';

// --- Skeleton Loader ---
const Skeleton = ({ className = '' }) => (
    <div className={`bd-skeleton ${className}`} />
);

const FinancialMetricsSkeleton = () => (
    <div className="bd-card p-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--bd-border-default)' }}>
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
            </div>
        </div>
        <div className="grid grid-cols-2 divide-x" style={{ borderColor: 'var(--bd-border-default)' }}>
            {[1, 2].map(i => (
                <div key={i} className="p-6 space-y-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-36" />
                </div>
            ))}
        </div>
    </div>
);

// --- Error Fallback ---
const ErrorFallback = ({ onRetry }) => (
    <div className="bd-card p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--bd-danger-muted)' }}>
            <AlertCircle className="w-6 h-6" style={{ color: 'var(--bd-danger)' }} />
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--bd-text-primary)' }}>
            Failed to load financial data
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--bd-text-secondary)' }}>
            There was an error fetching your financial metrics
        </p>
        <button
            onClick={onRetry}
            className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            style={{
                background: 'var(--bd-secondary)',
                color: 'var(--bd-secondary-fg)'
            }}
        >
            Try again
        </button>
    </div>
);

// --- Icon Color Map (semantic tokens) ---
const iconStyles = {
    green: { background: 'var(--bd-success-muted)', color: 'var(--bd-success)' },
    amber: { background: 'var(--bd-warning-muted)', color: 'var(--bd-warning)' },
    blue: { background: 'var(--bd-info-muted)', color: 'var(--bd-info)' },
    purple: { background: 'var(--bd-purple-muted)', color: 'var(--bd-purple)' },
};

// --- Metric Config ---
const metricConfig = [
    { key: 'available', label: 'Available Balance', icon: Wallet, color: 'green', showTrend: true },
    { key: 'locked', label: 'In Escrow', icon: Lock, color: 'amber', description: 'Funds held for active campaigns' },
    { key: 'totalBalance', label: 'Total Committed', icon: PiggyBank, color: 'blue', showTrend: true },
    { key: 'pendingPayouts', label: 'Upcoming Payouts', icon: Calendar, color: 'purple', description: 'Due within 7 days' },
];

// --- Main Component ---
const FinancialMetricsWidget = React.memo(function FinancialMetricsWidget({ className = '' }) {
    const { data: escrow, isLoading, isError, refetch } = useFinancialStrip();

    if (isLoading) return <FinancialMetricsSkeleton />;
    if (isError) return <ErrorFallback onRetry={refetch} />;

    const metrics = metricConfig.map(m => ({
        ...m,
        value: escrow?.[m.key] || 0,
    }));

    const renderLargeMetric = (metric, index) => {
        const Icon = metric.icon;
        const style = iconStyles[metric.color];
        return (
            <div
                key={metric.key}
                className="p-6 lg:p-8 flex-1 flex flex-col justify-center transition-colors group"
                style={{ cursor: 'default' }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl" style={style}>
                        <Icon className="h-5 w-5" />
                    </div>
                    {metric.showTrend && (
                        <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{
                                background: 'var(--bd-success-muted)',
                                color: 'var(--bd-success)',
                                border: '1px solid var(--bd-success-border)'
                            }}>
                            <TrendingUp className="h-3 w-3" />
                            —
                        </div>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: 'var(--bd-text-secondary)' }}>
                        {metric.label}
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight"
                        style={{ color: 'var(--bd-text-value)' }}>
                        ${metric.value.toLocaleString()}
                    </p>
                </div>
            </div>
        );
    };

    const renderCompactMetric = (metric) => {
        const Icon = metric.icon;
        const style = iconStyles[metric.color];
        return (
            <div
                key={metric.key}
                className="p-6 flex items-center justify-between transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg shrink-0" style={style}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider"
                            style={{ color: 'var(--bd-text-secondary)' }}>
                            {metric.label}
                        </p>
                        <p className="text-xl font-bold tracking-tight"
                            style={{ color: 'var(--bd-text-value)' }}>
                            ${metric.value.toLocaleString()}
                        </p>
                    </div>
                </div>
                {metric.description && (
                    <p className="text-xs hidden sm:block"
                        style={{ color: 'var(--bd-text-secondary)' }}>
                        {metric.description}
                    </p>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={className}
        >
            <div className="bd-card overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b"
                    style={{ borderColor: 'var(--bd-border-default)', background: 'var(--bd-surface-header)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl" style={iconStyles.green}>
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold tracking-tight"
                                style={{ color: 'var(--bd-text-primary)' }}>
                                Financial Overview
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                                Real-time cash flow metrics
                            </p>
                        </div>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
                        style={{ color: 'var(--bd-text-secondary)' }}
                        aria-label="View financial statement">
                        View Statement
                        <ArrowRight className="h-3.5 w-3.5 opacity-50" />
                    </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1"
                    style={{ borderColor: 'var(--bd-border-default)' }}>
                    <div className="flex flex-col"
                        style={{ borderRight: '1px solid var(--bd-border-default)' }}>
                        {renderLargeMetric(metrics[0], 0)}
                        <div style={{ borderTop: '1px solid var(--bd-border-default)' }}>
                            {renderCompactMetric(metrics[1])}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {renderLargeMetric(metrics[2], 2)}
                        <div style={{ borderTop: '1px solid var(--bd-border-default)' }}>
                            {renderCompactMetric(metrics[3])}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export default FinancialMetricsWidget;
