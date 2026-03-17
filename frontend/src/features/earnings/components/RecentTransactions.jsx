/**
 * RecentTransactions — Last 5 transactions used on the Overview page.
 * Includes a "View All" link to the full Transactions ledger.
 */
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Receipt, ArrowUpRight, Inbox } from 'lucide-react';
import TransactionStatusBadge from './TransactionStatusBadge';
import TransactionTypeBadge from './TransactionTypeBadge';

const fmt$ = (v) =>
  `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* Skeleton */
const RowSkeleton = () => (
  <div className="flex items-center justify-between py-3 px-4 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="h-3 w-12 rounded" style={{ background: 'var(--bd-surface-input)' }} />
      <div className="h-5 w-20 rounded-full" style={{ background: 'var(--bd-surface-input)' }} />
      <div className="h-3 w-24 rounded" style={{ background: 'var(--bd-surface-input)' }} />
    </div>
    <div className="flex items-center gap-3">
      <div className="h-5 w-14 rounded-full" style={{ background: 'var(--bd-surface-input)' }} />
      <div className="h-4 w-16 rounded" style={{ background: 'var(--bd-surface-input)' }} />
    </div>
  </div>
);

/**
 * @param {{
 *   transactions: import('../types/earnings.types').Transaction[];
 *   loading?: boolean;
 * }} props
 */
const RecentTransactions = memo(({ transactions = [], loading = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    className="rounded-2xl overflow-hidden"
    style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
      <div className="flex items-center gap-2">
        <Receipt size={14} style={{ color: 'var(--bd-text-secondary)' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>Recent Transactions</h3>
      </div>
      <Link
        to="/creator/earnings/transactions"
        className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
        style={{ color: '#818cf8' }}
      >
        View All
        <ArrowUpRight size={11} />
      </Link>
    </div>

    {/* Column headers */}
    <div
      className="grid px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        gridTemplateColumns: '80px 110px 1fr 90px 90px',
        color: 'var(--bd-text-secondary)',
        borderBottom: '1px solid var(--bd-border-subtle)',
        background: 'rgba(148,163,184,0.03)',
      }}
    >
      <span>Date</span>
      <span>Type</span>
      <span>Campaign</span>
      <span className="text-center">Status</span>
      <span className="text-right">Amount</span>
    </div>

    {/* Rows */}
    {loading ? (
      Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
    ) : transactions.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center px-6">
        <Inbox size={28} style={{ color: 'var(--bd-text-secondary)', opacity: 0.35, marginBottom: 8 }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--bd-text-primary)' }}>No transactions yet</p>
        <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>Complete a campaign to start earning.</p>
      </div>
    ) : (
      <div style={{ borderBottom: '1px solid transparent' }}>
        {transactions.slice(0, 5).map((txn, idx) => {
          const isEarning = txn.type !== 'PAYOUT';
          return (
            <div
              key={txn.id ?? idx}
              className="grid px-5 py-3 items-center transition-colors"
              style={{
                gridTemplateColumns: '80px 110px 1fr 90px 90px',
                borderBottom: idx < Math.min(transactions.length, 5) - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148,163,184,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>{fmtDate(txn.created_at)}</span>
              <span><TransactionTypeBadge type={txn.type} /></span>
              <span
                className="text-xs truncate pr-4"
                style={{ color: 'var(--bd-text-primary)' }}
                title={txn.campaign_name ?? '—'}
              >
                {txn.campaign_name ?? <span style={{ color: 'var(--bd-text-secondary)' }}>—</span>}
              </span>
              <span className="flex justify-center"><TransactionStatusBadge status={txn.status} /></span>
              <span
                className="text-xs font-bold text-right tabular-nums"
                style={{ color: isEarning ? '#34d399' : 'var(--bd-text-primary)' }}
              >
                {isEarning ? '+' : '-'}{fmt$(txn.amount)}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </motion.div>
));

RecentTransactions.displayName = 'RecentTransactions';
export default RecentTransactions;
