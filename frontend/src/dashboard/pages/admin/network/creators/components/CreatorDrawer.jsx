/**
 * CreatorDrawer.jsx — Right-side slide panel for creator details.
 * Tabs: Overview | Campaigns | Payouts | Activity
 * Accessible: closes on ESC and outside click.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Copy, Check,
  Activity, DollarSign, Briefcase, Clock,
  Instagram, Youtube, TrendingUp, Users,
} from 'lucide-react';
import {
  useCreatorDetail,
  useCreatorCampaigns,
  useCreatorPayouts,
  useCreatorActivity,
} from '../hooks/useCreators';
import {
  formatFollowers,
  formatCurrency,
  formatEngagement,
  formatRelativeTime,
  TIER_META,
  STATUS_META,
} from '../utils/creatorUtils';

// ─── Platform Icons ─────────────────────────────────────────────────────────────
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);
const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);
const TiktokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PlatformIconSmall = ({ platform }) => {
  if (platform === 'instagram') return <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />;
  if (platform === 'youtube') return <YoutubeIcon className="w-3.5 h-3.5 text-red-400" />;
  if (platform === 'tiktok') return <TiktokIcon className="w-3.5 h-3.5 text-cyan-400" />;
  return null;
};

// ─── Tabs config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',   icon: Users },
  { id: 'campaigns',  label: 'Campaigns',  icon: Briefcase },
  { id: 'payouts',    label: 'Payouts',    icon: DollarSign },
  { id: 'activity',   label: 'Activity',   icon: Activity },
];

// ─── Copy handle button ─────────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// ─── Stat card ──────────────────────────────────────────────────────────────────
const StatItem = ({ label, value, sub }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
    <p className="text-base font-semibold text-white tabular-nums leading-tight">{value}</p>
    {sub && <p className="text-[11px] text-zinc-600">{sub}</p>}
  </div>
);

// ─── Overview tab ────────────────────────────────────────────────────────────────
const OverviewTab = ({ creator }) => {
  const { data, isLoading } = useCreatorDetail(creator?.id);
  const c = data?.data || creator;

  if (!c) return null;

  const tierMeta = TIER_META[c.tier] || { label: c.tier, className: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  const statusMeta = STATUS_META[c.status] || STATUS_META.inactive;

  return (
    <div className="p-4 space-y-5">
      {/* Avatar + identity */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 shrink-0">
          {c.avatar
            ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-400">{c.name[0]}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-base leading-tight">{c.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-zinc-500">{c.handle}</p>
            <CopyButton text={c.handle} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tierMeta.className}`}>
              {tierMeta.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusMeta.className}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Platforms */}
      {c.platforms?.length > 0 && (
        <div className="flex items-center gap-2">
          {c.platforms.map(p => (
            <div key={p} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/60 border border-zinc-800">
              <PlatformIconSmall platform={p} />
              <span className="text-[11px] text-zinc-300 capitalize">{p}</span>
            </div>
          ))}
        </div>
      )}

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-3 border border-zinc-800/60 rounded-xl bg-zinc-900/40 p-4">
        <StatItem label="Followers" value={formatFollowers(c.followersTotal)} />
        <StatItem label="Engagement" value={formatEngagement(c.engagementRate)} />
        <StatItem
          label="Lifetime Earnings"
          value={formatCurrency(c.lifetimeEarnings)}
          sub={`${c.totalCampaigns} campaigns total`}
        />
        <StatItem
          label="Pending Payout"
          value={c.pendingPayout > 0 ? formatCurrency(c.pendingPayout) : '—'}
          sub={c.activeCampaigns > 0 ? `${c.activeCampaigns} active now` : 'No active campaigns'}
        />
      </div>

      {/* Last active */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Clock className="w-3.5 h-3.5" />
        Last active {formatRelativeTime(c.lastActiveAt)}
      </div>
    </div>
  );
};

// ─── Campaigns tab ───────────────────────────────────────────────────────────────
const CAMPAIGN_STATUS_COLOR = {
  Active:    'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  Completed: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  Pending:   'bg-amber-900/40 text-amber-400 border-amber-800/40',
  Paused:    'bg-orange-900/40 text-orange-400 border-orange-800/40',
};

const CampaignsTab = ({ creatorId }) => {
  const { data, isLoading } = useCreatorCampaigns(creatorId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const campaigns = data?.data || [];
  if (!campaigns.length) {
    return <p className="text-center text-sm text-zinc-500 py-12">No campaigns yet</p>;
  }

  return (
    <div className="p-4 space-y-2">
      {campaigns.map(camp => {
        const statusClass = CAMPAIGN_STATUS_COLOR[camp.status] || CAMPAIGN_STATUS_COLOR.Pending;
        return (
          <div key={camp.id} className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{camp.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{camp.brand}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusClass}`}>
                {camp.status}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">{formatCurrency(camp.earnings)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Payouts tab ─────────────────────────────────────────────────────────────────
const PAYOUT_STATUS_COLOR = {
  Paid:       'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
  Pending:    'bg-amber-900/40 text-amber-400 border-amber-800/40',
  Processing: 'bg-blue-900/40 text-blue-400 border-blue-800/40',
};

const PayoutsTab = ({ creatorId }) => {
  const { data, isLoading } = useCreatorPayouts(creatorId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const payouts = data?.data || [];
  if (!payouts.length) {
    return <p className="text-center text-sm text-zinc-500 py-12">No payouts yet</p>;
  }

  const pending = payouts.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-4 space-y-3">
      {pending > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-900/20 border border-amber-800/30">
          <span className="text-xs text-amber-300 font-medium">Total Pending</span>
          <span className="text-sm font-bold text-amber-400 tabular-nums">{formatCurrency(pending)}</span>
        </div>
      )}
      <div className="space-y-1.5">
        {payouts.map(payout => {
          const statusClass = PAYOUT_STATUS_COLOR[payout.status] || PAYOUT_STATUS_COLOR.Pending;
          return (
            <div key={payout.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white tabular-nums">{formatCurrency(payout.amount)}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{payout.campaign} · {formatRelativeTime(payout.date)}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusClass} shrink-0`}>
                {payout.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Activity tab ────────────────────────────────────────────────────────────────
const ACTIVITY_ICON = {
  joined:            '🎉',
  campaign_assigned: '📋',
  payout_processed:  '💰',
  tier_changed:      '⬆️',
  flagged:           '🚩',
};

const ActivityTab = ({ creatorId }) => {
  const { data, isLoading } = useCreatorActivity(creatorId);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 bg-zinc-800 rounded-full animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <div className="h-3 w-3/4 bg-zinc-800 rounded animate-pulse" />
              <div className="h-2.5 w-1/2 bg-zinc-800/60 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const events = data?.data || [];
  if (!events.length) {
    return <p className="text-center text-sm text-zinc-500 py-12">No activity yet</p>;
  }

  return (
    <div className="p-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-3 bottom-3 w-px bg-zinc-800" aria-hidden="true" />
        <div className="space-y-4 pl-8">
          {events.map((event) => (
            <div key={event.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px]">
                {ACTIVITY_ICON[event.type] || '•'}
              </div>
              <p className="text-sm font-medium text-zinc-300">{event.label}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{event.detail}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{formatRelativeTime(event.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Drawer ─────────────────────────────────────────────────────────────────
const CreatorDrawer = ({ creator, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isOpen = !!creator;

  // Reset tab when a new creator is opened
  useEffect(() => {
    if (creator) setActiveTab('overview');
  }, [creator?.id]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl shadow-black"
            role="dialog"
            aria-modal="true"
            aria-label={`Creator: ${creator?.name}`}
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
              <p className="text-sm font-semibold text-zinc-300">Creator Details</p>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800 shrink-0 px-4">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-1 py-3 mr-4 text-xs font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'text-white border-white'
                        : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.12 }}
                >
                  {activeTab === 'overview' && <OverviewTab creator={creator} />}
                  {activeTab === 'campaigns' && <CampaignsTab creatorId={creator?.id} />}
                  {activeTab === 'payouts' && <PayoutsTab creatorId={creator?.id} />}
                  {activeTab === 'activity' && <ActivityTab creatorId={creator?.id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatorDrawer;
