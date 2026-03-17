/**
 * EarningsGraph — Area chart with time-range filter pills.
 * Filters are applied client-side on the earningsTimeseries data.
 */
import React, { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const FILTERS = [
  { label: '30d', days: 30 },
  { label: '3m',  days: 90 },
  { label: '12m', days: 365 },
  { label: 'All', days: Infinity },
];

const fmt$ = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bd-surface-elevated, #0f172a)',
        border: '1px solid var(--bd-border-subtle)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
      }}
    >
      <p style={{ color: 'var(--bd-text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#a78bfa', fontWeight: 700 }}>{fmt$(payload[0].value)}</p>
    </div>
  );
};

/* Skeleton */
const GraphSkeleton = () => (
  <div
    className="rounded-2xl p-6 animate-pulse"
    style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)', height: 280 }}
  >
    <div className="flex justify-between items-center mb-6">
      <div className="h-4 w-28 rounded" style={{ background: 'var(--bd-surface-input)' }} />
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <div key={f.label} className="h-6 w-10 rounded-full" style={{ background: 'var(--bd-surface-input)' }} />
        ))}
      </div>
    </div>
    <div className="h-40 rounded-xl" style={{ background: 'var(--bd-surface-input)' }} />
  </div>
);

/**
 * @param {{
 *   timeseries: import('../types/earnings.types').TimeseriesPoint[];
 *   loading?: boolean;
 * }} props
 */
const EarningsGraph = memo(({ timeseries = [], loading = false }) => {
  const [activeFilter, setActiveFilter] = useState('30d');

  const chartData = useMemo(() => {
    const filter = FILTERS.find((f) => f.label === activeFilter) ?? FILTERS[3];
    const cutoff = filter.days === Infinity
      ? new Date(0)
      : new Date(Date.now() - filter.days * 86_400_000);

    // Aggregate by week for larger ranges to reduce chart noise
    const aggregateBy = filter.days <= 30 ? 'day' : filter.days <= 90 ? 'week' : 'month';

    const filtered = timeseries.filter((p) => new Date(p.date) >= cutoff);

    if (aggregateBy === 'day') {
      return filtered.map((p) => ({
        name: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: p.amount,
      }));
    }

    // Aggregate into buckets
    const buckets = {};
    filtered.forEach((p) => {
      const d = new Date(p.date);
      let key;
      if (aggregateBy === 'week') {
        const week = Math.floor(d.getDate() / 7);
        key = `${d.toLocaleDateString('en-US', { month: 'short' })} W${week + 1}`;
      } else {
        key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      buckets[key] = (buckets[key] ?? 0) + p.amount;
    });

    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [timeseries, activeFilter]);

  if (loading) return <GraphSkeleton />;

  const isEmpty = chartData.length === 0 || chartData.every((d) => d.value === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
    >
      {/* Subtle glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top center, rgba(139,92,246,0.04) 0%, transparent 65%)' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 size={15} style={{ color: '#a78bfa' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>Earnings Over Time</h3>
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.label;
              return (
                <button
                  key={f.label}
                  onClick={() => setActiveFilter(f.label)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(139,92,246,0.18)' : 'transparent',
                    color: isActive ? '#a78bfa' : 'var(--bd-text-secondary)',
                    border: `1px solid ${isActive ? 'rgba(139,92,246,0.35)' : 'transparent'}`,
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-44 text-center">
            <BarChart2 size={32} style={{ color: 'var(--bd-text-secondary)', opacity: 0.4, marginBottom: 8 }} />
            <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>No earnings data for this period</p>
          </div>
        ) : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.07)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--bd-text-secondary, #64748b)', fontSize: 11 }}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--bd-text-secondary, #64748b)', fontSize: 11 }}
                  tickFormatter={fmt$}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#earningsGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
});

EarningsGraph.displayName = 'EarningsGraph';
export default EarningsGraph;
