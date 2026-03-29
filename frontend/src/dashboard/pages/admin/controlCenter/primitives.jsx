/**
 * primitives.jsx — Shared low-level UI building blocks for the Control Center.
 * SectionCard, Badge, SLATimer, PrimaryBtn, SecondaryBtn, Skeleton
 */
import React, { useEffect, useState } from 'react';

// ─── Skeleton ────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 animate-pulse rounded-lg ${className}`} />
);

// ─── SectionCard ─────────────────────────────────────────────────────────────
export const SectionCard = ({ children, className = '' }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ icon: Icon, iconColor = 'text-zinc-400', title, badge, right, pulse = false }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/70">
    <div className="flex items-center gap-2.5">
      {pulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
      {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />}
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {badge != null && badge > 0 && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-700 text-zinc-300 rounded-md tabular-nums">
          {badge}
        </span>
      )}
    </div>
    {right && <div className="text-xs text-zinc-500">{right}</div>}
  </div>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
const BADGE_VARIANTS = {
  critical:      'bg-red-500/15 text-red-400 border border-red-500/25',
  time_sensitive:'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  operational:   'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  warning:       'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  healthy:       'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  info:          'bg-zinc-700/60 text-zinc-300 border border-zinc-700',
};

export const Badge = ({ variant = 'info', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.info} ${className}`}>
    {children}
  </span>
);

// ─── Severity dot ────────────────────────────────────────────────────────────
const DOT_COLOR = {
  critical:      'bg-red-500 shadow-red-500/50 shadow-sm',
  time_sensitive:'bg-amber-500',
  operational:   'bg-blue-500',
};

export const SeverityDot = ({ severity }) => (
  <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLOR[severity] || 'bg-zinc-500'}`} />
);

// ─── SLATimer ────────────────────────────────────────────────────────────────
const formatDuration = (ms) => {
  if (ms <= 0) return 'Overdue';
  const totalMins = Math.floor(ms / 60_000);
  if (totalMins < 60) return `${totalMins}m`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const SLATimer = ({ deadline }) => {
  const [remaining, setRemaining] = useState(deadline - Date.now());

  useEffect(() => {
    const t = setInterval(() => setRemaining(deadline - Date.now()), 30_000);
    return () => clearInterval(t);
  }, [deadline]);

  const isOverdue  = remaining <= 0;
  const isCritical = remaining > 0 && remaining < 2 * 3600_000;

  return (
    <span
      className={`text-[11px] font-semibold tabular-nums whitespace-nowrap ${
        isOverdue ? 'text-red-400 animate-pulse' : isCritical ? 'text-amber-400' : 'text-zinc-500'
      }`}
    >
      {formatDuration(remaining)}
    </span>
  );
};

// ─── Buttons ─────────────────────────────────────────────────────────────────
const SEVERITY_BTN = {
  critical:      'bg-red-600 hover:bg-red-500 text-white',
  time_sensitive:'bg-amber-500 hover:bg-amber-400 text-black font-semibold',
  operational:   'bg-blue-600 hover:bg-blue-500 text-white',
  default:       'bg-zinc-700 hover:bg-zinc-600 text-white',
};

export const PrimaryBtn = ({ severity = 'default', onClick, children, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap ${SEVERITY_BTN[severity] || SEVERITY_BTN.default}`}
  >
    {children}
  </button>
);

export const SecondaryBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap"
  >
    {children}
  </button>
);

// ─── Status dot for KPI ─────────────────────────────────────────────────────
const KPI_STATUS_COLOR = {
  healthy: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical:'bg-red-400',
};

export const StatusDot = ({ status }) => (
  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${KPI_STATUS_COLOR[status] || 'bg-zinc-500'}`} />
);

// ─── Trend indicator ─────────────────────────────────────────────────────────
export const TrendArrow = ({ value, prev, inverted = false }) => {
  if (prev == null || value == null) return null;
  const delta = ((value - prev) / (prev || 1)) * 100;
  const up = delta >= 0;
  // For metrics where up is bad (e.g. dispute rate), invert color logic
  const isGood = inverted ? !up : up;
  const color = Math.abs(delta) < 0.1 ? 'text-zinc-500' : isGood ? 'text-emerald-400' : 'text-red-400';
  const arrow = up ? '↑' : '↓';

  return (
    <span className={`text-[11px] font-medium tabular-nums ${color}`}>
      {arrow}{Math.abs(delta).toFixed(1)}%
    </span>
  );
};

// ─── Elapsed time ────────────────────────────────────────────────────────────
export const Elapsed = ({ ts }) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return <span className="text-xs text-zinc-600">just now</span>;
  if (mins < 60) return <span className="text-xs text-zinc-600">{mins}m ago</span>;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return <span className="text-xs text-zinc-600">{hrs}h ago</span>;
  return <span className="text-xs text-zinc-600">{Math.floor(hrs / 24)}d ago</span>;
};
