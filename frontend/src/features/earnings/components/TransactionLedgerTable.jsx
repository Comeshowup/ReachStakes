/**
 * TransactionLedgerTable — Full paginated + filtered transaction ledger.
 * Used on the Transactions page. Supports status, type, campaign search, and date range.
 */
import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, Inbox, Loader2, X } from 'lucide-react';
import { useTransactions } from '../hooks/useEarnings';
import TransactionStatusBadge from './TransactionStatusBadge';
import TransactionTypeBadge from './TransactionTypeBadge';

const PAGE_SIZE = 20;

const fmt$ = (v) =>
  `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'FAILED'];
const TYPE_OPTIONS   = ['', 'CAMPAIGN_EARNING', 'PAYOUT', 'REFUND', 'BONUS', 'ADJUSTMENT'];

const SelectFilter = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-xs rounded-lg px-3 py-2 outline-none transition-colors"
    style={{
      background: 'var(--bd-surface-input)',
      border: '1px solid var(--bd-border-subtle)',
      color: value ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)',
    }}
  >
    <option value="">{placeholder}</option>
    {options.filter(Boolean).map((o) => (
      <option key={o} value={o}>
        {o.replace(/_/g, ' ')}
      </option>
    ))}
  </select>
);

const TransactionLedgerTable = memo(() => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filters = { page, limit: PAGE_SIZE, status, type, campaignId, from, to };
  const { data, isLoading, isError, isFetching, refetch } = useTransactions(filters);

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / PAGE_SIZE);

  const resetFilters = useCallback(() => {
    setStatus('');
    setType('');
    setCampaignId('');
    setFrom('');
    setTo('');
    setPage(1);
  }, []);

  const hasActiveFilters = status || type || campaignId || from || to;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bd-surface-card)', border: '1px solid var(--bd-border-subtle)' }}>
      {/* Filter bar */}
      <div
        className="flex flex-wrap items-center gap-2 p-4"
        style={{ borderBottom: '1px solid var(--bd-border-subtle)', background: 'rgba(148,163,184,0.02)' }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Filter size={13} style={{ color: 'var(--bd-text-secondary)', flexShrink: 0 }} />
          <p className="text-xs font-semibold" style={{ color: 'var(--bd-text-secondary)', whiteSpace: 'nowrap' }}>Filters</p>
        </div>

        <SelectFilter value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUS_OPTIONS} placeholder="All Statuses" />
        <SelectFilter value={type}   onChange={(v) => { setType(v);   setPage(1); }} options={TYPE_OPTIONS}   placeholder="All Types" />

        {/* Campaign search */}
        <div className="relative flex items-center">
          <Search size={11} className="absolute left-2.5" style={{ color: 'var(--bd-text-secondary)' }} />
          <input
            type="text"
            placeholder="Campaign ID…"
            value={campaignId}
            onChange={(e) => { setCampaignId(e.target.value); setPage(1); }}
            className="text-xs pl-7 pr-3 py-2 rounded-lg outline-none"
            style={{
              background: 'var(--bd-surface-input)',
              border: '1px solid var(--bd-border-subtle)',
              color: 'var(--bd-text-primary)',
              width: 130,
            }}
          />
        </div>

        {/* Date range */}
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className="text-xs px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
          title="From date"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className="text-xs px-3 py-2 rounded-lg outline-none"
          style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
          title="To date"
        />

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs px-2.5 py-2 rounded-lg transition-colors"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <X size={10} /> Clear
          </button>
        )}

        {isFetching && !isLoading && (
          <Loader2 size={13} className="animate-spin ml-auto" style={{ color: 'var(--bd-text-secondary)' }} />
        )}
      </div>

      {/* Column headers */}
      <div
        className="grid px-5 py-3 text-[10px] font-bold uppercase tracking-wider hidden sm:grid"
        style={{
          gridTemplateColumns: '100px 120px 1fr 110px 100px',
          color: 'var(--bd-text-secondary)',
          borderBottom: '1px solid var(--bd-border-subtle)',
          background: 'rgba(148,163,184,0.025)',
        }}
      >
        <span>Date</span>
        <span>Type</span>
        <span>Campaign</span>
        <span className="text-center">Status</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--bd-text-secondary)' }} />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--bd-text-primary)' }}>Failed to load transactions</p>
          <button
            onClick={() => refetch()}
            className="text-xs px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)' }}
          >
            Retry
          </button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
          <Inbox size={28} style={{ color: 'var(--bd-text-secondary)', opacity: 0.35, marginBottom: 8 }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--bd-text-primary)' }}>
            {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
          </p>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs mt-2" style={{ color: '#818cf8' }}>
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <motion.div key={`${page}-${status}-${type}`} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {transactions.map((txn, idx) => {
            const isEarning = txn.type !== 'PAYOUT';
            return (
              <div
                key={txn.id ?? idx}
                className="grid sm:grid px-5 py-3.5 items-center transition-colors"
                style={{
                  gridTemplateColumns: '100px 120px 1fr 110px 100px',
                  borderBottom: idx < transactions.length - 1 ? '1px solid var(--bd-border-subtle)' : 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(148,163,184,0.04)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>{fmtDate(txn.created_at)}</span>
                <span><TransactionTypeBadge type={txn.type} /></span>
                <span
                  className="text-xs truncate pr-4"
                  style={{ color: 'var(--bd-text-primary)' }}
                  title={txn.campaign_name ?? ''}
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
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: '1px solid var(--bd-border-subtle)', background: 'rgba(148,163,184,0.02)' }}
        >
          <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
            {total} transaction{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
              style={{ background: 'var(--bd-surface-input)' }}
            >
              <ChevronLeft size={13} style={{ color: 'var(--bd-text-primary)' }} />
            </button>
            <span className="text-xs tabular-nums" style={{ color: 'var(--bd-text-secondary)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
              style={{ background: 'var(--bd-surface-input)' }}
            >
              <ChevronRight size={13} style={{ color: 'var(--bd-text-primary)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

TransactionLedgerTable.displayName = 'TransactionLedgerTable';
export default TransactionLedgerTable;
