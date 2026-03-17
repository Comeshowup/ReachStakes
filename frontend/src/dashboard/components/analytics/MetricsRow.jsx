import React from 'react';
import MetricCard, { MetricCardSkeleton } from './MetricCard';
import { Eye, Zap, Target, Video } from 'lucide-react';

const METRICS_CONFIG = [
    {
        key: 'views',
        label: 'Views (30d)',
        icon: Eye,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-500/10',
        valueType: 'number',
    },
    {
        key: 'engagements',
        label: 'Engagements',
        icon: Zap,
        iconColor: 'text-violet-500',
        iconBg: 'bg-violet-500/10',
        valueType: 'number',
    },
    {
        key: 'engagementRate',
        label: 'Engagement Rate',
        icon: Target,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-500/10',
        valueType: 'rate',
    },
    {
        key: 'videosPublished',
        label: 'Videos Published',
        icon: Video,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-500/10',
        valueType: 'count',
    },
];

/**
 * MetricsRow — top KPI strip
 * @param {{ metrics: object|null, loading: boolean }} props
 */
const MetricsRow = ({ metrics, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => <MetricCardSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS_CONFIG.map((cfg, i) => {
                const metric = metrics?.[cfg.key] ?? { value: 0, change: 0 };
                return (
                    <MetricCard
                        key={cfg.key}
                        label={cfg.label}
                        value={metric.value}
                        change={metric.change}
                        valueType={cfg.valueType}
                        icon={cfg.icon}
                        iconColor={cfg.iconColor}
                        iconBg={cfg.iconBg}
                        index={i}
                    />
                );
            })}
        </div>
    );
};

export default MetricsRow;
