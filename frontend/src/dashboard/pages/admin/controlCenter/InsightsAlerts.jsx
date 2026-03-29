/**
 * InsightsAlerts.jsx — §5 Logic-generated smart insights layer.
 * Shows up to 5 insights derived from metric deltas. No fake AI text.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, TrendingUp, AlertTriangle, Info, ChevronRight, Lightbulb } from 'lucide-react';
import { SectionCard, CardHeader, Skeleton } from './primitives';

const SEVERITY_STYLES = {
  critical: {
    bg:      'bg-red-500/8 hover:bg-red-500/12',
    border:  'border-red-500/20',
    icon:    AlertTriangle,
    iconColor:'text-red-400',
    deltaBg: 'bg-red-500/10 text-red-400',
  },
  warning: {
    bg:      'bg-amber-500/8 hover:bg-amber-500/12',
    border:  'border-amber-500/20',
    icon:    TrendingDown,
    iconColor:'text-amber-400',
    deltaBg: 'bg-amber-500/10 text-amber-400',
  },
  info: {
    bg:      'bg-zinc-800/50 hover:bg-zinc-800/80',
    border:  'border-zinc-700/40',
    icon:    Info,
    iconColor:'text-blue-400',
    deltaBg: 'bg-blue-500/10 text-blue-400',
  },
  healthy: {
    bg:      'bg-emerald-500/5 hover:bg-emerald-500/10',
    border:  'border-emerald-500/15',
    icon:    TrendingUp,
    iconColor:'text-emerald-400',
    deltaBg: 'bg-emerald-500/10 text-emerald-400',
  },
};

const InsightCard = ({ insight }) => {
  const navigate = useNavigate();
  const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 border-b border-zinc-800/50 last:border-b-0 transition-colors duration-150
        ${insight.actionPath ? 'cursor-pointer group' : 'cursor-default'}
        ${style.bg}
      `}
      onClick={insight.actionPath ? () => navigate(insight.actionPath) : undefined}
      role={insight.actionPath ? 'button' : undefined}
      tabIndex={insight.actionPath ? 0 : undefined}
      onKeyDown={insight.actionPath ? (e) => e.key === 'Enter' && navigate(insight.actionPath) : undefined}
    >
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 bg-opacity-20 ${style.iconColor} bg-zinc-800`}>
        <Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 leading-snug">{insight.message}</p>
        {insight.deltaLabel && (
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${style.deltaBg}`}>
            {insight.deltaLabel}
          </span>
        )}
      </div>
      {insight.actionPath && (
        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0 mt-0.5" />
      )}
    </div>
  );
};

const InsightsAlerts = ({ insights = [], loading = false }) => {
  const capped = insights.slice(0, 5);

  return (
    <SectionCard>
      <CardHeader
        icon={Lightbulb}
        iconColor="text-yellow-400"
        title="Insights & Alerts"
        right={`${capped.length} signals`}
      />
      {loading ? (
        <div className="p-5 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : capped.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-zinc-600">No significant changes detected</p>
        </div>
      ) : (
        <div>
          {capped.map(insight => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default InsightsAlerts;
