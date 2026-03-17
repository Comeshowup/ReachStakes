import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    AreaChart,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

// ─── Config ─────────────────────────────────────────────────────────────────
const METRICS = [
    { key: 'views',       label: 'Views',       color: '#6366f1' },
    { key: 'engagements', label: 'Engagements', color: '#10b981' },
    { key: 'videos',      label: 'Videos',      color: '#f59e0b' },
];

const TIME_RANGES = [
    { key: '7d',  label: '7D'  },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' },
    { key: '12m', label: '12M' },
];

// ─── Format helpers ──────────────────────────────────────────────────────────
const fmtNum = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n ?? 0);
};

const fmtDate = (dateStr, range) => {
    const d = new Date(dateStr);
    if (range === '12m') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (range === '90d') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, range }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-xl px-4 py-3 shadow-xl text-sm"
            style={{
                background: 'var(--bd-surface-overlay)',
                border: '1px solid var(--bd-border-subtle)',
                color: 'var(--bd-text-primary)',
            }}
        >
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--bd-text-secondary)' }}>
                {fmtDate(label, range)}
            </p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    <span className="font-semibold">{fmtNum(entry.value)}</span>
                    <span style={{ color: 'var(--bd-text-secondary)' }}>{entry.name}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const ChartSkeleton = () => (
    <div
        className="rounded-2xl p-6 animate-pulse"
        style={{
            background: 'var(--bd-surface-overlay)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-40 rounded-full" style={{ background: 'var(--bd-border-muted)' }} />
            <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-12 rounded-lg" style={{ background: 'var(--bd-border-muted)' }} />
                ))}
            </div>
        </div>
        <div className="h-64 rounded-xl" style={{ background: 'var(--bd-border-muted)' }} />
    </div>
);

// ─── Empty ───────────────────────────────────────────────────────────────────
const ChartEmpty = () => (
    <div
        className="rounded-2xl p-10 flex flex-col items-center justify-center gap-3"
        style={{
            background: 'var(--bd-surface-overlay)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <BarChart3 className="w-10 h-10" style={{ color: 'var(--bd-text-muted)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
            No performance data for this time range yet
        </p>
    </div>
);

// ─── PerformanceChart ────────────────────────────────────────────────────────
/**
 * @param {{
 *   timeline: Array<{date, views, engagements, videos}>,
 *   loading: boolean,
 *   timeRange: string,
 *   setTimeRange: Function,
 *   selectedMetric: string,
 *   setSelectedMetric: Function,
 * }} props
 */
const PerformanceChart = ({
    timeline,
    loading,
    timeRange,
    setTimeRange,
    selectedMetric,
    setSelectedMetric,
}) => {
    const metric = METRICS.find((m) => m.key === selectedMetric) ?? METRICS[0];

    // Check if there's any non-zero data
    const hasData = useMemo(
        () => (timeline ?? []).some((d) => d[selectedMetric] > 0),
        [timeline, selectedMetric]
    );

    if (loading) return <ChartSkeleton />;

    return (
        <div
            className="rounded-2xl p-6"
            style={{
                background: 'var(--bd-surface-overlay)',
                border: '1px solid var(--bd-border-subtle)',
            }}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {/* Metric toggle */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bd-bg-primary)' }}>
                    {METRICS.map((m) => (
                        <button
                            key={m.key}
                            onClick={() => setSelectedMetric(m.key)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={
                                selectedMetric === m.key
                                    ? {
                                          background: 'var(--bd-surface-overlay)',
                                          color: m.color,
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                      }
                                    : { color: 'var(--bd-text-secondary)' }
                            }
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Time range selector */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bd-bg-primary)' }}>
                    {TIME_RANGES.map((r) => (
                        <button
                            key={r.key}
                            onClick={() => setTimeRange(r.key)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={
                                timeRange === r.key
                                    ? {
                                          background: 'var(--bd-surface-overlay)',
                                          color: 'var(--bd-text-primary)',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                      }
                                    : { color: 'var(--bd-text-secondary)' }
                            }
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            {!hasData ? (
                <ChartEmpty />
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={timeline} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`grad-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor={metric.color} stopOpacity={0.15} />
                                <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--bd-border-muted)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(v) => fmtDate(v, timeRange)}
                            tick={{ fontSize: 11, fill: 'var(--bd-text-muted)' }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tickFormatter={fmtNum}
                            tick={{ fontSize: 11, fill: 'var(--bd-text-muted)' }}
                            axisLine={false}
                            tickLine={false}
                            width={40}
                        />
                        <Tooltip
                            content={<CustomTooltip range={timeRange} />}
                            cursor={{ stroke: 'var(--bd-border-muted)', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={metric.key}
                            name={metric.label}
                            stroke={metric.color}
                            strokeWidth={2}
                            fill={`url(#grad-${metric.key})`}
                            dot={false}
                            activeDot={{ r: 4, fill: metric.color }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PerformanceChart;
