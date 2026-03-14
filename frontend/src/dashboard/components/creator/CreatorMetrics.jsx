import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Mail, DollarSign, Target } from 'lucide-react';

const METRICS_CONFIG = [
    {
        key: 'activeCampaigns',
        label: 'Active Campaigns',
        icon: Briefcase,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        format: (v) => String(v ?? 0),
    },
    {
        key: 'pendingInvites',
        label: 'Pending Invites',
        icon: Mail,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        format: (v) => String(v ?? 0),
    },
    {
        key: 'totalEarnings',
        label: 'Total Earnings',
        icon: DollarSign,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        format: (v) => `$${Number(v ?? 0).toLocaleString()}`,
    },
    {
        key: 'matchScore',
        label: 'Match Score',
        icon: Target,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        format: (v) => `${v ?? 0}%`,
    },
];

const MetricSkeleton = () => (
    <div className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
);

const CreatorMetrics = memo(({ stats, loading = false }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" aria-busy="true">
                {[1, 2, 3, 4].map(i => <MetricSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            role="list"
            aria-label="Key metrics"
        >
            {METRICS_CONFIG.map((metric, index) => {
                const Icon = metric.icon;
                const value = stats?.[metric.key];

                return (
                    <motion.div
                        key={metric.key}
                        role="listitem"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06, duration: 0.4 }}
                        className="rounded-[14px] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
                        tabIndex={0}
                        aria-label={`${metric.label}: ${metric.format(value)}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl ${metric.bg} group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-4.5 h-4.5 ${metric.color}`} style={{ width: 18, height: 18 }} />
                            </div>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                                {metric.label}
                            </p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {metric.format(value)}
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
});

CreatorMetrics.displayName = 'CreatorMetrics';
export default CreatorMetrics;
