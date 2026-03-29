/**
 * creatorUtils.js — Pure formatting utilities for the Creators module.
 */

/** Format follower counts: 1234567 → 1.2M, 12345 → 12.3K */
export function formatFollowers(n) {
  if (!n && n !== 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Format currency: 24500 → $24,500, 1200.5 → $1,200 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '—';
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `$${Math.round(amount).toLocaleString()}`;
  return `$${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/** Format percentage: 4.5 → 4.5% */
export function formatEngagement(rate) {
  if (!rate && rate !== 0) return '—';
  return `${rate.toFixed(1)}%`;
}

/** Format relative time: "3 days ago", "just now" */
export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Tier display metadata */
export const TIER_META = {
  nano:  { label: 'Nano',  className: 'bg-zinc-800 text-zinc-300 border border-zinc-700' },
  micro: { label: 'Micro', className: 'bg-blue-900/50 text-blue-300 border border-blue-800/50' },
  macro: { label: 'Macro', className: 'bg-violet-900/50 text-violet-300 border border-violet-800/50' },
  elite: { label: 'Elite', className: 'bg-amber-900/50 text-amber-300 border border-amber-700/50' },
};

/** Status display metadata */
export const STATUS_META = {
  active:   { label: 'Active',   className: 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40', dot: 'bg-emerald-400' },
  inactive: { label: 'Inactive', className: 'bg-zinc-800 text-zinc-400 border border-zinc-700', dot: 'bg-zinc-500' },
  flagged:  { label: 'Flagged',  className: 'bg-red-900/40 text-red-400 border border-red-800/40', dot: 'bg-red-400' },
};

/** Platform display metadata */
export const PLATFORM_META = {
  instagram: { label: 'Instagram', color: '#E1306C' },
  youtube:   { label: 'YouTube',   color: '#FF0000' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0' },
};

/** Format a number with K shorthand as counts: 1200 → 1.2K */
export function formatCount(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
