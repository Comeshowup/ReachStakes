/**
 * EarningsSummaryCards — Three metric cards answering "How much have I earned?"
 * Cards: Available Balance | Pending Earnings | Lifetime Earnings
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, TrendingUp, Info } from 'lucide-react';

const fmt = (val) =>
  `$${Number(val ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Skeleton ───────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div
    className="rounded-2xl p-5 animate-pulse"
    style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="h-3 w-24 rounded" style={{ background: 'var(--bd-surface-input)' }} />
      <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--bd-surface-input)' }} />
    </div>
    <div className="h-8 w-32 rounded mb-1" style={{ background: 'var(--bd-surface-input)' }} />
    <div className="h-2.5 w-20 rounded" style={{ background: 'var(--bd-surface-input)' }} />
  </div>
);

// ─── Tooltip ────────────────────────────────────────────────────────────────
const Tooltip = ({ text, children }) => (
  <div className="relative group inline-flex">
    {children}
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl text-xs leading-relaxed pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20"
      style={{
        background: 'var(--bd-surface-elevated, #1e293b)',
        border: '1px solid var(--bd-border-subtle)',
        color: 'var(--bd-text-secondary)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent" style={{ borderTopColor: 'var(--bd-border-subtle)' }} />
    </div>
  </div>
);

// ─── Single Card ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, subtitle, accentColor, Icon, delay, tooltip }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="rounded-2xl p-5 relative overflow-hidden group"
    style={{
      background: 'var(--bd-surface-card)',
      border: '1px solid var(--bd-border-subtle)',
    }}
  >
    {/* Subtle hover glow */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(ellipse at top right, ${accentColor}08 0%, transparent 70%)` }}
    />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium" style={{ color: 'var(--bd-text-secondary)' }}>{label}</p>
          {tooltip && (
            <Tooltip text={tooltip}>
              <Info size={11} style={{ color: 'var(--bd-text-secondary)', cursor: 'help', opacity: 0.6 }} />
            </Tooltip>
          )}
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          <Icon size={14} style={{ color: accentColor }} />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1 tabular-nums" style={{ color: 'var(--bd-text-primary)' }}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>{subtitle}</p>
      )}
    </div>
  </motion.div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
/**
 * @param {{
 *   availableBalance: number;
 *   pendingBalance: number;
 *   lifetimeEarnings: number;
 *   loading?: boolean;
 * }} props
 */
const EarningsSummaryCards = memo(({ availableBalance = 0, pendingBalance = 0, lifetimeEarnings = 0, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <MetricCard
        label="Available Balance"
        value={fmt(availableBalance)}
        subtitle="Ready to withdraw"
        accentColor="#10b981"
        Icon={DollarSign}
        delay={0}
        tooltip="Funds that have been approved and are ready for withdrawal to your connected bank account."
      />
      <MetricCard
        label="Pending Earnings"
        value={fmt(pendingBalance)}
        subtitle="Awaiting approval"
        accentColor="#f59e0b"
        Icon={Clock}
        delay={0.08}
        tooltip="Campaign earnings that are pending brand approval. These will move to Available Balance once approved."
      />
      <MetricCard
        label="Lifetime Earnings"
        value={fmt(lifetimeEarnings)}
        subtitle="Total across all campaigns"
        accentColor="#818cf8"
        Icon={TrendingUp}
        delay={0.16}
      />
    </div>
  );
});

EarningsSummaryCards.displayName = 'EarningsSummaryCards';
export default EarningsSummaryCards;
