import React from 'react';
import { Clock, AlertTriangle, ShieldAlert, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function KpiPill({ icon: Icon, label, value, variant = 'default', loading }) {
  const variants = {
    default: 'text-slate-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    success: 'text-emerald-400',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] min-w-0">
      <Icon className={cn('w-3.5 h-3.5 shrink-0', variants[variant])} />
      <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
      {loading ? (
        <Skeleton className="h-3.5 w-8 rounded-sm" />
      ) : (
        <span className={cn('text-xs font-semibold tabular-nums', variants[variant])}>
          {value}
        </span>
      )}
    </div>
  );
}

/**
 * KpiStrip — compact horizontal KPI row at the top of the approvals page.
 */
export default function KpiStrip({ kpi, loading }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <KpiPill
        icon={Clock}
        label="Pending"
        value={kpi?.pending ?? '—'}
        variant={kpi?.pending > 10 ? 'warning' : 'default'}
        loading={loading}
      />
      <KpiPill
        icon={ShieldAlert}
        label="High Risk"
        value={kpi?.highRisk ?? '—'}
        variant={kpi?.highRisk > 0 ? 'danger' : 'default'}
        loading={loading}
      />
      <KpiPill
        icon={AlertTriangle}
        label="SLA Breached"
        value={kpi?.slaBreached ?? '—'}
        variant={kpi?.slaBreached > 0 ? 'danger' : 'default'}
        loading={loading}
      />
      <KpiPill
        icon={Timer}
        label="Avg Review"
        value={kpi?.avgReviewTime ?? '—'}
        variant="default"
        loading={loading}
      />
    </div>
  );
}
