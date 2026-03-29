import React, { useEffect, useCallback } from 'react';
import { X, Building2, Megaphone, Users2, Clock, TrendingUp, AlertTriangle, Globe, Mail } from 'lucide-react';
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
  return `${Math.floor(days / 30)}mo ago`;
}

function riskColor(score) {
  if (score >= 70) return 'text-red-400';
  if (score >= 45) return 'text-amber-400';
  return 'text-emerald-400';
}
function riskBg(score) {
  if (score >= 70) return 'bg-red-500';
  if (score >= 45) return 'bg-amber-400';
  return 'bg-emerald-500';
}

const TABS = ['Overview', 'Campaigns', 'Financials', 'Activity Log', 'Notes'];

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function OverviewTab({ brand }) {
  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="30d Spend" value={fmt(brand.spend_30d)} sub="last 30 days" />
        <StatCard icon={Megaphone} label="Campaigns" value={brand.active_campaigns} sub="currently active" />
        <StatCard icon={Users2} label="Creators" value={brand.creators_count} sub="engaged" />
        <StatCard icon={Clock} label="Last Active" value={timeAgo(brand.last_activity_at)} sub={brand.last_activity_at ? new Date(brand.last_activity_at).toLocaleDateString() : 'Unknown'} />
      </div>

      {/* Risk score */}
      <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Risk Score</span>
          </div>
          <span className={`text-lg font-bold tabular-nums ${riskColor(brand.risk_score)}`}>{brand.risk_score}</span>
        </div>
        <div className="h-2 bg-zinc-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${riskBg(brand.risk_score)}`}
            style={{ width: `${brand.risk_score}%` }}
          />
        </div>
        <p className="text-[11px] text-zinc-600 mt-2">
          {brand.risk_score >= 70 ? 'High risk — review needed.' : brand.risk_score >= 45 ? 'Moderate risk — monitor closely.' : 'Low risk — healthy account.'}
        </p>
      </div>

      {/* Brand details */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">Details</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-zinc-400">{brand.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-zinc-400">{brand.industry || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-zinc-400">Joined {new Date(brand.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-zinc-800/60 flex items-center justify-center mb-3">
        <Building2 className="w-5 h-5 text-zinc-600" />
      </div>
      <p className="text-sm font-semibold text-zinc-400">{label}</p>
      <p className="text-xs text-zinc-600 mt-1">Data will appear here soon.</p>
    </div>
  );
}

/**
 * @param {{ brand: import('../types').Brand | null, onClose: () => void }} props
 */
export default function BrandDrawer({ brand, onClose }) {
  const [tab, setTab] = React.useState('Overview');
  const isOpen = !!brand;

  // Reset tab when brand changes
  useEffect(() => { setTab('Overview'); }, [brand?.id]);

  // ESC key close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!brand) return null;

  const hue = (brand.name?.charCodeAt(0) ?? 0) * 37 % 360;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[460px] max-w-full bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: `hsl(${hue} 60% 12%)`, color: `hsl(${hue} 80% 65%)` }}
            >
              {brand.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{brand.name}</p>
              <p className="text-xs text-zinc-500 truncate">{brand.email}</p>
            </div>
            <StatusBadge status={brand.status} />
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-zinc-800/60 shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                tab === t
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'Overview' && <OverviewTab brand={brand} />}
          {tab !== 'Overview' && <PlaceholderTab label={tab} />}
        </div>

        {/* Footer actions */}
        <div className="shrink-0 p-4 border-t border-zinc-800/60 flex gap-2">
          <button className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
            Edit Brand
          </button>
          <button className="flex-1 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
            Create Campaign
          </button>
          {brand.status !== 'suspended' && (
            <button className="px-4 py-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors">
              Suspend
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
