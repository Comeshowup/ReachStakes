import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatValue = (value, type) => {
    if (value === null || value === undefined) return '—';
    if (type === 'rate') return `${Number(value).toFixed(1)}%`;
    if (type === 'count') return String(value);
    // Large number formatting (views, engagements)
    const n = Number(value);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
};

// ─── Skeleton ───────────────────────────────────────────────────────────────
export const MetricCardSkeleton = () => (
    <div
        className="rounded-2xl p-5 animate-pulse"
        style={{
            background: 'var(--bd-surface-overlay)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-24 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
            <div className="h-5 w-14 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
        </div>
        <div className="h-8 w-28 rounded-lg mb-2" style={{ background: 'var(--bd-border-muted)' }} />
        <div className="h-3 w-20 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
    </div>
);

// ─── MetricCard ─────────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {string}  props.label         - e.g. "Views (30d)"
 * @param {number}  props.value         - raw numeric value
 * @param {number}  props.change        - percentage change vs prior period
 * @param {string}  [props.valueType]   - "number" | "rate" | "count" (default "number")
 * @param {React.ElementType} props.icon
 * @param {string}  props.iconColor     - Tailwind text color class
 * @param {string}  props.iconBg        - Tailwind bg color class
 * @param {number}  [props.index]       - stagger delay
 */
const MetricCard = ({
    label,
    value,
    change,
    valueType = 'number',
    icon: Icon,
    iconColor,
    iconBg,
    index = 0,
}) => {
    const isPositive = change > 0;
    const isNeutral  = change === 0;
    const TrendIcon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

    const trendColor = isNeutral
        ? 'var(--bd-text-muted)'
        : isPositive
        ? '#10b981'  // emerald-500
        : '#ef4444'; // red-500

    const trendBg = isNeutral
        ? 'var(--bd-surface-overlay)'
        : isPositive
        ? 'rgba(16,185,129,0.1)'
        : 'rgba(239,68,68,0.1)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl p-5 group transition-all duration-200 hover:shadow-lg"
            style={{
                background: 'var(--bd-surface-overlay)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>

                {/* % change badge */}
                <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ color: trendColor, background: trendBg }}
                >
                    <TrendIcon className="w-3 h-3" />
                    {isNeutral ? '0%' : `${isPositive ? '+' : ''}${change}%`}
                </span>
            </div>

            {/* Value */}
            <p
                className="text-2xl font-bold tracking-tight mb-1"
                style={{ color: 'var(--bd-text-primary)' }}
            >
                {formatValue(value, valueType)}
            </p>

            {/* Label */}
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--bd-text-secondary)' }}>
                {label}
            </p>
        </motion.div>
    );
};

export default MetricCard;
