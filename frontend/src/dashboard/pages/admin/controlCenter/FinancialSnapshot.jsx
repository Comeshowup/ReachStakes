/**
 * FinancialSnapshot.jsx — §3 Four key financial metrics.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowDownRight, Clock, AlertTriangle } from 'lucide-react';
import { SectionCard, CardHeader, Skeleton } from './primitives';

const fmtCurrency = (n) =>
  typeof n === 'number'
    ? `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—';

const METRICS = [
  {
    key: 'totalEscrow',
    label: 'Total Escrow',
    sub: 'Live · across all campaigns',
    icon: DollarSign,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    path: '/admin/finance/escrow',
    valueColor: 'text-white',
  },
  {
    key: 'released7d',
    label: 'Released',
    sub: 'Last 7 days',
    icon: ArrowDownRight,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    path: '/admin/finance/payouts',
    valueColor: 'text-white',
  },
  {
    key: 'pendingPayouts',
    label: 'Pending Payouts',
    sub: 'Awaiting release',
    icon: Clock,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    path: '/admin/finance/payouts',
    valueColor: 'text-amber-400',
  },
  {
    key: 'atRiskFunds',
    label: 'At-Risk Funds',
    sub: 'In active disputes',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
    path: '/admin/finance/disputes',
    valueColor: 'text-red-400',
  },
];

const MetricRow = ({ metric, value, loading }) => {
  const navigate = useNavigate();
  const Icon = metric.icon;

  return (
    <button
      onClick={() => navigate(metric.path)}
      className="w-full flex items-center gap-3.5 px-5 py-4 border-b border-zinc-800/60 last:border-b-0 hover:bg-zinc-800/30 transition-colors duration-150 text-left group"
    >
      <div className={`p-2 rounded-xl ${metric.iconBg} shrink-0`}>
        <Icon className={`w-4 h-4 ${metric.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 font-medium">{metric.label}</p>
        <p className="text-[11px] text-zinc-700 mt-0.5">{metric.sub}</p>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <p className={`text-lg font-bold tabular-nums ${metric.valueColor} group-hover:opacity-80 transition-opacity`}>
          {fmtCurrency(value)}
        </p>
      )}
    </button>
  );
};

const FinancialSnapshot = ({ financial, loading = false }) => {
  return (
    <SectionCard>
      <CardHeader
        icon={DollarSign}
        iconColor="text-emerald-400"
        title="Financial Snapshot"
        right="Live"
      />
      <div>
        {METRICS.map((m) => (
          <MetricRow
            key={m.key}
            metric={m}
            value={financial?.[m.key]}
            loading={loading}
          />
        ))}
      </div>
    </SectionCard>
  );
};

export default FinancialSnapshot;
