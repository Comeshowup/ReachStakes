import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity,
    UserPlus,
    FileCheck,
    DollarSign,
    TrendingUp,
    MessageSquare,
    Bell,
    AlertCircle
} from 'lucide-react';
import { useActivityFeed } from '../../../data/hooks/useDashboardWidgets';

// --- Skeleton ---
const Skeleton = ({ className = '' }) => (
    <div className={`bd-skeleton ${className}`} />
);

const ActivitySkeleton = () => (
    <div className="bd-card p-6 space-y-4">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
            </div>
        </div>
        {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 py-3">
                <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

// --- Error Fallback ---
const ErrorFallback = ({ onRetry }) => (
    <div className="bd-card p-8 text-center">
        <AlertCircle className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--bd-danger)' }} />
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--bd-text-primary)' }}>
            Failed to load activity feed
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
    application: { bg: 'var(--bd-info-muted)', color: 'var(--bd-info)', border: 'var(--bd-info-border)' },
    submission: { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)', border: 'var(--bd-success-border)' },
    content: { bg: 'var(--bd-success-muted)', color: 'var(--bd-success)', border: 'var(--bd-success-border)' },
    financial: { bg: 'var(--bd-teal-muted)', color: 'var(--bd-teal)', border: 'var(--bd-teal-border)' },
    payment: { bg: 'var(--bd-teal-muted)', color: 'var(--bd-teal)', border: 'var(--bd-teal-border)' },
    campaign: { bg: 'var(--bd-purple-muted)', color: 'var(--bd-purple)', border: 'var(--bd-purple-border)' },
    message: { bg: 'var(--bd-orange-muted)', color: 'var(--bd-orange)', border: 'var(--bd-orange-border)' },
    creator: { bg: 'var(--bd-purple-muted)', color: 'var(--bd-purple)', border: 'var(--bd-purple-border)' },
};

const iconMap = {
    application: UserPlus,
    submission: FileCheck,
    content: FileCheck,
    financial: DollarSign,
    payment: DollarSign,
    campaign: TrendingUp,
    message: MessageSquare,
    creator: UserPlus,
};

// --- Main Component ---
const LiveActivityWidget = React.memo(function LiveActivityWidget({ className = '' }) {
    const { data: activities, isLoading, isError, refetch } = useActivityFeed(10);

    if (isLoading) return <ActivitySkeleton />;
    if (isError) return <ErrorFallback onRetry={refetch} />;

    const items = activities || [];
    const hasActivity = items.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`h-full ${className}`}
        >
            <div className="bd-card h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="p-2.5 rounded-2xl"
                                style={{ background: 'var(--bd-success-muted)', border: '1px solid var(--bd-success-border)' }}>
                                <Activity className="h-5 w-5" style={{ color: 'var(--bd-success)' }} />
                            </div>
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2"
                                style={{
                                    background: 'var(--bd-success)',
                                    borderColor: 'var(--bd-bg-primary)',
                                    animation: 'pulse 2s infinite'
                                }} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight"
                                style={{ color: 'var(--bd-text-primary)' }}>
                                Live Activity
                            </h3>
                            <p className="text-sm mt-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                Recent platform events
                            </p>
                        </div>
                    </div>
                    {hasActivity && (
                        <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg"
                            style={{
                                background: 'var(--bd-surface-overlay)',
                                border: '1px solid var(--bd-border-strong)',
                                color: 'var(--bd-text-primary)'
                            }}>
                            <Bell className="h-3 w-3" />
                            {items.length} new
                        </span>
                    )}
                </div>

                {/* Timeline */}
                <div className="flex-1 min-h-0 px-6 pb-6 overflow-y-auto"
                    aria-live="polite"
                    aria-label="Live activity timeline">
                    {hasActivity ? (
                        <div className="space-y-0 pl-1">
                            {items.slice(0, 8).map((activity, index) => {
                                const type = activity.type || 'campaign';
                                const style = iconStyles[type] || iconStyles.campaign;
                                const Icon = iconMap[type] || TrendingUp;

                                return (
                                    <div key={activity.id || index}
                                        className="relative flex items-start gap-4 pb-8 last:pb-0 group">
                                        {/* Timeline connector */}
                                        {index < items.length - 1 && index < 7 && (
                                            <div className="absolute left-[19px] top-[40px] w-0.5 h-[calc(100%-8px)] transition-colors"
                                                style={{ background: 'var(--bd-border-subtle)' }} />
                                        )}

                                        <div className="relative z-10 p-2.5 rounded-2xl shrink-0 border transition-transform group-hover:scale-105 duration-200"
                                            style={{
                                                background: 'var(--bd-surface)',
                                                borderColor: style.border,
                                                boxShadow: 'var(--bd-shadow-sm)'
                                            }}>
                                            <Icon className="h-4 w-4" style={{ color: style.color }} />
                                        </div>

                                        <div className="flex-1 min-w-0 pt-1 group-hover:translate-x-1 transition-transform duration-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                <p className="font-semibold text-sm leading-tight"
                                                    style={{ color: 'var(--bd-text-value)' }}>
                                                    {activity.message || activity.title}
                                                </p>
                                                <span className="text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: 'var(--bd-bg-tertiary)',
                                                        color: 'var(--bd-text-secondary)'
                                                    }}>
                                                    {activity.relativeTime || activity.time}
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-sm leading-tight"
                                                    style={{ color: 'var(--bd-text-secondary)' }}>
                                                    {activity.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="p-4 rounded-full mx-auto mb-4 inline-block"
                                style={{ background: 'var(--bd-bg-tertiary)' }}>
                                <Activity className="h-8 w-8" style={{ color: 'var(--bd-text-secondary)' }} />
                            </div>
                            <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                                No recent activity
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--bd-text-muted)' }}>
                                New events will appear in real time
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

export default LiveActivityWidget;
