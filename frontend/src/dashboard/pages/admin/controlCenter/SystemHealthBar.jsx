/**
 * SystemHealthBar.jsx — §2 Horizontal KPI strip.
 * Four equal-width segments replacing top metric cards.
 */
import React from 'react';
import { TrendArrow, StatusDot, Skeleton } from './primitives';

const fmt = (value, unit) => {
  if (unit === '$') return `$${Number(value).toLocaleString()}`;
  if (unit === '%') return `${value}%`;
  if (unit === 'h') return `${value}h`;
  return String(value);
};

const STATUS_BG = {
  healthy: 'border-emerald-500/20 hover:bg-emerald-900/10',
  warning: 'border-amber-500/20  hover:bg-amber-900/10',
  critical:'border-red-500/20    hover:bg-red-900/10',
};

const STATUS_VALUE_COLOR = {
  healthy: 'text-white',
  warning: 'text-amber-400',
  critical:'text-red-400',
};

const KPI_META = [
  { key: 'paymentSuccessRate', label: 'Payment Success',  inverted: false, description: 'Last 7 days' },
  { key: 'escrowLocked',       label: 'Escrow Locked',    inverted: false, description: 'Live total' },
  { key: 'disputeRate',        label: 'Dispute Rate',     inverted: true,  description: 'Last 24h' },
  { key: 'avgApprovalHrs',     label: 'Avg Approval',     inverted: true,  description: 'Current cycle' },
];

const KPISegment = ({ meta, kpi, isLast }) => {
  const valStr = fmt(kpi.value, kpi.unit);
  const statusBg = STATUS_BG[kpi.status] || STATUS_BG.healthy;
  const valColor = STATUS_VALUE_COLOR[kpi.status] || 'text-white';

  return (
    <div
      className={`relative flex-1 flex flex-col gap-1.5 px-5 py-4 border-r border-zinc-800/60 transition-colors duration-150 cursor-default
        ${!isLast ? 'border-r' : 'border-r-0'}
        ${statusBg}
      `}
    >
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <StatusDot status={kpi.status} />
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{meta.label}</span>
      </div>

      {/* Value */}
      <p className={`text-xl font-bold tabular-nums ${valColor}`}>{valStr}</p>

      {/* Trend + description */}
      <div className="flex items-center gap-2">
        <TrendArrow value={kpi.value} prev={kpi.prev} inverted={meta.inverted} />
        <span className="text-[10px] text-zinc-700">{meta.description}</span>
      </div>
    </div>
  );
};

const SystemHealthBar = ({ health, loading = false }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex divide-x divide-zinc-800/60">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 px-5 py-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            ))
          : KPI_META.map((meta, idx) => (
              <KPISegment
                key={meta.key}
                meta={meta}
                kpi={health?.[meta.key] || { value: 0, prev: 0, unit: '', status: 'healthy' }}
                isLast={idx === KPI_META.length - 1}
              />
            ))
        }
      </div>
    </div>
  );
};

export default SystemHealthBar;
