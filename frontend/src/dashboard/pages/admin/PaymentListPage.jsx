import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Clock, CheckCircle, XCircle, Lock, Unlock,
  RotateCcw, Filter, Download, Search, ChevronRight,
  TrendingUp, AlertCircle, ArrowUpRight, Coins,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetchPayments = async ({ page, type, status }) => {
  const params = new URLSearchParams({ page, pageSize: 20 });
  if (type) params.set('type', type);
  if (status) params.set('status', status);
  const { data } = await axios.get(`${API}/api/admin/payments?${params}`, { headers: authHeader() });
  return data;
};

const fetchSummary = async () => {
  const { data } = await axios.get(`${API}/api/admin/payments/summary`, { headers: authHeader() });
  return data;
};

// ─── Escrow lifecycle config ──────────────────────────────────────────────────
const ESCROW_STAGES = [
  { key: 'Funded',   icon: Coins,       color: 'text-blue-400',    bg: 'bg-blue-500/15 border-blue-500/30',   dot: 'bg-blue-500' },
  { key: 'Locked',   icon: Lock,        color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30', dot: 'bg-amber-500' },
  { key: 'Released', icon: Unlock,      color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-500' },
  { key: 'Refunded', icon: RotateCcw,   color: 'text-red-400',     bg: 'bg-red-500/15 border-red-500/30',     dot: 'bg-red-500' },
];

const STATUS_MAP = {
  Completed:  { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Completed' },
  Pending:    { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       label: 'Pending' },
  Failed:     { color: 'bg-red-500/15 text-red-400 border-red-500/30',             label: 'Failed' },
  Processing: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',          label: 'Processing' },
  Released:   { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Released' },
  Refunded:   { color: 'bg-red-500/15 text-red-400 border-red-500/30',             label: 'Refunded' },
};

// Mock data for offline/degraded mode
const MOCK_SUMMARY = { totalFunded: 284500, totalReleased: 198000, pendingPayouts: 12, failedPayouts: 2, escrowLocked: 86500 };
const MOCK_TXS = [
  { id: 1, user: { name: 'Emma Wilson' }, campaign: { title: 'Nike Summer Splash' }, type: 'Payment', amount: 1800, status: 'Released', transactionDate: new Date(Date.now() - 2 * 86400000).toISOString(), tazapayReferenceId: 'TZP-2024-001' },
  { id: 2, user: { name: 'Jake Torres' }, campaign: { title: 'Puma Run Campaign' }, type: 'Payment', amount: 950, status: 'Pending', transactionDate: new Date(Date.now() - 86400000).toISOString(), tazapayReferenceId: 'TZP-2024-002' },
  { id: 3, user: { name: 'Adidas Brand' }, campaign: { title: 'Adidas Fall Collection' }, type: 'Deposit', amount: 12000, status: 'Completed', transactionDate: new Date(Date.now() - 3 * 86400000).toISOString(), tazapayReferenceId: 'TZP-2024-003' },
  { id: 4, user: { name: 'Sofia Reyes' }, campaign: { title: 'H&M Style Drop' }, type: 'Payment', amount: 2400, status: 'Processing', transactionDate: new Date(Date.now() - 4 * 86400000).toISOString(), tazapayReferenceId: 'TZP-2024-004' },
  { id: 5, user: { name: 'Marcus Chen' }, campaign: { title: 'Nike Summer Splash' }, type: 'Refund', amount: 600, status: 'Refunded', transactionDate: new Date(Date.now() - 5 * 86400000).toISOString(), tazapayReferenceId: 'TZP-2024-005' },
];

const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 rounded animate-pulse ${className}`} />
);

const SummaryCard = ({ label, value, sub, icon: Icon, valueColor = 'text-white' }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
      <div className="p-1.5 bg-zinc-800 rounded-lg">
        <Icon className="w-3.5 h-3.5 text-zinc-500" />
      </div>
    </div>
    <p className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
    {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
  </div>
);

// Stripe-style transaction timeline row
const TransactionRow = ({ tx, onRelease, onRefund, releasing, refunding }) => {
  const s = STATUS_MAP[tx.status] || STATUS_MAP.Pending;
  const isActionable = tx.status === 'Pending' || tx.status === 'Processing';

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors group"
    >
      <td className="py-3.5 px-4">
        <div>
          <p className="text-sm font-medium text-white">{tx.user?.name || '—'}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{tx.campaign?.title || 'No campaign'}</p>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">{tx.type}</span>
      </td>
      <td className="py-3.5 px-4">
        <span className="text-sm font-bold text-white tabular-nums">
          ${Number(tx.amount).toLocaleString()}
        </span>
      </td>
      <td className="py-3.5 px-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
          {tx.status}
        </span>
      </td>
      <td className="py-3.5 px-4 text-xs text-zinc-500">
        {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="py-3.5 px-4">
        <span className="text-xs font-mono text-zinc-600 truncate block max-w-[120px]">{tx.tazapayReferenceId || '—'}</span>
      </td>
      <td className="py-3.5 px-4">
        {isActionable && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onRelease(tx.id)}
              disabled={releasing}
              className="text-xs px-3 py-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded-lg font-medium border border-emerald-500/30 transition-colors disabled:opacity-50"
            >
              Release
            </button>
            <button
              onClick={() => onRefund(tx.id)}
              disabled={refunding}
              className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-medium border border-red-500/20 transition-colors disabled:opacity-50"
            >
              Refund
            </button>
          </div>
        )}
      </td>
    </motion.tr>
  );
};

const PaymentListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', { page, type, status }],
    queryFn: () => fetchPayments({ page, type, status }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const { data: summary } = useQuery({
    queryKey: ['admin', 'payments', 'summary'],
    queryFn: fetchSummary,
    staleTime: 60_000,
    retry: 1,
  });

  const s = summary || MOCK_SUMMARY;
  const transactions = data?.data || MOCK_TXS;
  const filteredTxs = search
    ? transactions.filter(t => t.user?.name?.toLowerCase().includes(search.toLowerCase()) || t.campaign?.title?.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  const releaseMutation = useMutation({
    mutationFn: (id) => axios.post(`${API}/api/admin/payments/${id}/release`, {}, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'payments']),
  });

  const refundMutation = useMutation({
    mutationFn: (id) => axios.post(`${API}/api/admin/payments/${id}/refund`, {}, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'payments']),
  });

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Escrow lifecycle and transaction management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 rounded-xl text-sm transition-colors">
          <Download className="w-4 h-4" />Export
        </button>
      </div>

      {/* Escrow Lifecycle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">Escrow Lifecycle</p>
        <div className="flex items-center gap-0">
          {ESCROW_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${stage.bg} flex-1 justify-center`}>
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                  <span className={`text-xs font-semibold ${stage.color}`}>{stage.key}</span>
                </div>
                {i < ESCROW_STAGES.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0 mx-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard label="Total Funded" value={`$${Number(s.totalFunded || 0).toLocaleString()}`} icon={DollarSign} />
        <SummaryCard label="Total Released" value={`$${Number(s.totalReleased || 0).toLocaleString()}`} icon={CheckCircle} valueColor="text-emerald-400" />
        <SummaryCard label="Pending Payouts" value={s.pendingPayouts} sub="awaiting release" icon={Clock} valueColor="text-amber-400" />
        <SummaryCard label="Failed Payouts" value={s.failedPayouts} sub={s.failedPayouts > 0 ? 'requires attention' : 'all clear'} icon={AlertCircle} valueColor={s.failedPayouts > 0 ? 'text-red-400' : 'text-zinc-400'} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user or campaign..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <select
          className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none"
          value={type} onChange={e => { setType(e.target.value); setPage(1); }}
        >
          <option value="">All Types</option>
          {['Deposit', 'Payment', 'Withdrawal', 'Refund'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {['Pending', 'Completed', 'Failed', 'Processing', 'Released', 'Refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {['User / Campaign', 'Type', 'Amount', 'Status', 'Date', 'Reference', 'Actions'].map(col => (
                  <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="py-3.5 px-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && filteredTxs.map(tx => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  onRelease={(id) => releaseMutation.mutate(id)}
                  onRefund={(id) => refundMutation.mutate(id)}
                  releasing={releaseMutation.isPending}
                  refunding={refundMutation.isPending}
                />
              ))}
              {!isLoading && filteredTxs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-600 text-sm">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-800/20">
            <p className="text-sm text-zinc-500">{data.pagination.total} transactions</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-zinc-700 text-sm text-zinc-400 disabled:opacity-40 hover:border-zinc-600 hover:text-white transition-colors">← Prev</button>
              <span className="px-3 py-1 text-sm text-zinc-500">Page {page} of {data.pagination.totalPages}</span>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-zinc-700 text-sm text-zinc-400 disabled:opacity-40 hover:border-zinc-600 hover:text-white transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentListPage;
