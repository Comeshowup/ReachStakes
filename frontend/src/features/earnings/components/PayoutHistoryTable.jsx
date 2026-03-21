/**
 * PayoutHistoryTable — Paginated table of payout history with status badges.
 */
import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight, ChevronsLeft, ChevronsRight, Wallet } from 'lucide-react';
import payoutService from '../../../api/payoutService';
import { useQuery } from '@tanstack/react-query';

const fmt$ = (v) =>
  `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const fmtTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Status Badge ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: { icon: Clock, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Pending' },
  Processing: { icon: Loader2, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Processing', animate: true },
  Completed: { icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Completed' },
  Failed: { icon: XCircle, color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Failed' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = config.icon;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      background: config.bg, color: config.color,
      fontSize: '0.7rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.03em',
    }}>
      <Icon style={{ width: 11, height: 11 }} className={config.animate ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse" style={{ padding: '0.75rem 0' }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.85rem 1rem', borderBottom: '1px solid var(--bd-border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: 'var(--bd-surface-input)' }} />
          <div>
            <div style={{ width: 80, height: 10, borderRadius: 4, background: 'var(--bd-surface-input)', marginBottom: 6 }} />
            <div style={{ width: 120, height: 8, borderRadius: 4, background: 'var(--bd-surface-input)' }} />
          </div>
        </div>
        <div style={{ width: 60, height: 10, borderRadius: 4, background: 'var(--bd-surface-input)' }} />
      </div>
    ))}
  </div>
);

// ── Empty State ──────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{
    textAlign: 'center', padding: '2.5rem 1rem',
    color: 'var(--bd-text-muted)',
  }}>
    <Wallet style={{ width: 32, height: 32, margin: '0 auto 0.75rem', opacity: 0.3 }} />
    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bd-text-secondary)', marginBottom: '0.25rem' }}>
      No payouts yet
    </p>
    <p style={{ fontSize: '0.8125rem' }}>
      Your payout history will appear here once you make your first withdrawal.
    </p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────
const PayoutHistoryTable = memo(() => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payout-history', page],
    queryFn: () => payoutService.getPayoutHistory(page, limit),
    staleTime: 30_000,
    retry: 1,
  });

  const payouts = data?.data?.payouts ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bd-surface-card)',
        border: '1px solid var(--bd-border-subtle)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--bd-border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--bd-text-primary)', margin: 0 }}>
            Payout History
          </h3>
          {pagination.total > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', margin: 0, marginTop: '0.15rem' }}>
              {pagination.total} total payouts
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>Failed to load payout history</p>
          <button
            onClick={() => refetch()}
            style={{
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--bd-primary)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : payouts.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Table rows */}
          <div>
            {payouts.map((payout, i) => (
              <div
                key={payout.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderBottom: i < payouts.length - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
                    background: STATUS_CONFIG[payout.status]?.bg || 'var(--bd-surface-input)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Wallet style={{ width: 16, height: 16, color: STATUS_CONFIG[payout.status]?.color || 'var(--bd-text-muted)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--bd-text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Withdrawal
                      {payout.payoutType && <span style={{ fontWeight: 400, color: 'var(--bd-text-muted)', marginLeft: 4, fontSize: '0.75rem' }}>({payout.payoutType})</span>}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--bd-text-muted)', margin: 0, marginTop: '0.1rem' }}>
                      {fmtDate(payout.initiatedAt)} {fmtTime(payout.initiatedAt)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <StatusBadge status={payout.status} />
                  <p style={{
                    fontSize: '0.875rem', fontWeight: 700,
                    color: payout.status === 'Completed' ? '#10b981' : payout.status === 'Failed' ? '#f87171' : 'var(--bd-text-primary)',
                    margin: 0, fontVariantNumeric: 'tabular-nums', minWidth: 70, textAlign: 'right',
                  }}>
                    {fmt$(payout.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '0.75rem', borderTop: '1px solid var(--bd-border-subtle)',
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{
                  padding: '0.35rem 0.6rem', borderRadius: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: page <= 1 ? 'var(--bd-surface-input)' : 'var(--bd-primary)',
                  color: page <= 1 ? 'var(--bd-text-muted)' : 'var(--bd-primary-fg)',
                  border: 'none', cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}
              >
                <ChevronsLeft style={{ width: 12, height: 12 }} /> Prev
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--bd-text-muted)' }}>
                Page {page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                style={{
                  padding: '0.35rem 0.6rem', borderRadius: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: page >= pagination.totalPages ? 'var(--bd-surface-input)' : 'var(--bd-primary)',
                  color: page >= pagination.totalPages ? 'var(--bd-text-muted)' : 'var(--bd-primary-fg)',
                  border: 'none', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                }}
              >
                Next <ChevronsRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
});

PayoutHistoryTable.displayName = 'PayoutHistoryTable';
export default PayoutHistoryTable;
