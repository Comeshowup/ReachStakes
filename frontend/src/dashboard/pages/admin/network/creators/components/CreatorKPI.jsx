/**
 * CreatorKPI.jsx — 5-metric KPI strip for the Creators page.
 * Minimal cards, skeleton states, formatted numbers.
 */

import React from 'react';
import { useCreatorStats } from '../hooks/useCreators';
import { formatCurrency, formatCount } from '../utils/creatorUtils';
import { Users, Activity, Target, DollarSign, AlertTriangle } from 'lucide-react';

const KPI_CONFIG = [
  {
    key: 'total',
    label: 'Total Creators',
    icon: Users,
    iconColor: 'text-zinc-400',
    format: (v) => formatCount(v),
  },
  {
    key: 'active',
    label: 'Active',
    icon: Activity,
    iconColor: 'text-emerald-400',
    format: (v) => formatCount(v),
  },
  {
    key: 'inCampaigns',
    label: 'In Campaigns',
    icon: Target,
    iconColor: 'text-blue-400',
    format: (v) => formatCount(v),
  },
  {
    key: 'pendingPayout',
    label: 'Pending Payout',
    icon: DollarSign,
    iconColor: 'text-amber-400',
    format: (v) => formatCurrency(v),
  },
  {
    key: 'flagged',
    label: 'Flagged',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    format: (v) => formatCount(v),
    highlight: (v) => v > 0,
  },
];

const KpiCardSkeleton = () => (
  <div className="flex flex-col gap-2 px-5 py-4 min-w-0">
    <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
    <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse mt-1" />
  </div>
);

const KpiCard = ({ config, value }) => {
  const Icon = config.icon;
  const isHighlighted = config.highlight?.(value);

  return (
    <div className="flex items-center gap-3 px-5 py-4 min-w-0">
      <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${isHighlighted ? 'bg-red-900/30' : 'bg-zinc-800/60'}`}>
        <Icon className={`w-3.5 h-3.5 ${isHighlighted ? 'text-red-400' : config.iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider leading-none">
          {config.label}
        </p>
        <p className={`text-lg font-semibold tabular-nums mt-0.5 leading-tight tracking-tight ${isHighlighted ? 'text-red-400' : 'text-white'}`}>
          {config.format(value)}
        </p>
      </div>
    </div>
  );
};

const CreatorKPI = () => {
  const { data, isLoading } = useCreatorStats();
  const stats = data?.data;

  return (
    <div className="flex items-stretch border border-zinc-800/60 rounded-xl bg-zinc-900/30 divide-x divide-zinc-800/60 overflow-hidden">
      {KPI_CONFIG.map((config, i) => (
        <div key={config.key} className="flex-1 min-w-0">
          {isLoading ? (
            <KpiCardSkeleton />
          ) : (
            <KpiCard config={config} value={stats?.[config.key] ?? 0} />
          )}
        </div>
      ))}
    </div>
  );
};

export default CreatorKPI;
