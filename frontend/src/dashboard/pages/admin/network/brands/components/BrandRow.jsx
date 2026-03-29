import React, { memo, useRef, useState, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit2, Megaphone, MessageSquare, Ban } from 'lucide-react';
import StatusBadge from './StatusBadge';

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  const days = Math.floor(secs / 86400);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function riskColor(score) {
  if (score >= 70) return 'bg-red-500';
  if (score >= 45) return 'bg-amber-400';
  return 'bg-emerald-500';
}

function BrandAvatar({ name, logo }) {
  const [imgError, setImgError] = useState(false);
  const initials = name?.slice(0, 2).toUpperCase() || '??';

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgError(true)}
        className="w-8 h-8 rounded-lg object-cover shrink-0"
      />
    );
  }

  // Letter avatar with deterministic hue
  const hue = (name?.charCodeAt(0) ?? 0) * 37 % 360;
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
      style={{ background: `hsl(${hue} 60% 15%)`, color: `hsl(${hue} 80% 70%)` }}
    >
      {initials}
    </div>
  );
}

function ActionsMenu({ brand, onView, onSuspend }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const items = [
    { label: 'View Details', icon: Eye, action: () => { onView(brand); setOpen(false); } },
    { label: 'Edit', icon: Edit2, action: () => setOpen(false) },
    { label: 'Create Campaign', icon: Megaphone, action: () => setOpen(false) },
    { label: 'Message', icon: MessageSquare, action: () => setOpen(false) },
    { label: 'Suspend Brand', icon: Ban, action: () => { onSuspend?.(brand); setOpen(false); }, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
          {items.map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                danger
                  ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @param {{ brand: import('../types').Brand, onView: (b:object)=>void, onSuspend?: (b:object)=>void, selected: boolean, onSelect: (id:string)=>void }} props
 */
const BrandRow = memo(function BrandRow({ brand, onView, onSuspend, selected, onSelect }) {
  return (
    <tr
      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group cursor-pointer"
      onClick={() => onView(brand)}
    >
      {/* Checkbox */}
      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(brand.id)}
          className="w-3.5 h-3.5 accent-indigo-500 cursor-pointer"
        />
      </td>

      {/* Brand */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <BrandAvatar name={brand.name} logo={brand.logo} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{brand.name}</p>
            <p className="text-xs text-zinc-500 truncate">{brand.email}</p>
          </div>
          {brand.industry && (
            <span className="ml-1 text-[10px] font-medium text-zinc-500 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full shrink-0 hidden lg:inline-flex">
              {brand.industry}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4">
        <StatusBadge status={brand.status} />
      </td>

      {/* Spend 30d */}
      <td className="py-3 px-4 text-sm font-semibold text-white tabular-nums">
        {fmt(brand.spend_30d)}
      </td>

      {/* Active campaigns */}
      <td className="py-3 px-4 text-sm text-zinc-300 tabular-nums">{brand.active_campaigns}</td>

      {/* Creators */}
      <td className="py-3 px-4 text-sm text-zinc-300 tabular-nums">{brand.creators_count}</td>

      {/* Last activity */}
      <td className="py-3 px-4 text-xs text-zinc-500 whitespace-nowrap">
        {timeAgo(brand.last_activity_at)}
      </td>

      {/* Risk score */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${riskColor(brand.risk_score)}`}
              style={{ width: `${brand.risk_score}%` }}
            />
          </div>
          <span className="text-[11px] tabular-nums text-zinc-500">{brand.risk_score}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
        <ActionsMenu brand={brand} onView={onView} onSuspend={onSuspend} />
      </td>
    </tr>
  );
});

export default BrandRow;
