import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, CheckCircle, ArrowUp, ArrowDown, Minus,
  Filter, Search, ChevronRight, User, MessageSquare, CreditCard, AlertCircle,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const PRIORITY = {
  Low:      { color: 'text-zinc-400',    bg: 'bg-zinc-700/30 border-zinc-700/50',         dot: 'bg-zinc-500' },
  Medium:   { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',          dot: 'bg-blue-500' },
  High:     { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',        dot: 'bg-amber-500' },
  Critical: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',            dot: 'bg-red-500' },
};

const STATUS = {
  Open:       { color: 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50' },
  InProgress: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  Escalated:  { color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  Resolved:   { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Closed:     { color: 'bg-zinc-800/50 text-zinc-600 border-zinc-800/50' },
};

const TYPE_ICONS = {
  Payment:       CreditCard,
  Content:       CheckCircle,
  Communication: MessageSquare,
  default:       AlertCircle,
};

const MOCK_ISSUES = [
  { id: 1, title: 'Payment not received after content approval', category: 'Payment', priority: 'Critical', status: 'Escalated', campaign: { title: 'Nike Summer Splash' }, assignedTo: null, slaDeadline: new Date(Date.now() + 2 * 3600000).toISOString(), reportedBy: 'Emma Wilson' },
  { id: 2, title: 'Brand rejected content without feedback', category: 'Content', priority: 'High', status: 'Open', campaign: { title: 'Adidas Fall Collection' }, assignedTo: { name: 'Admin' }, slaDeadline: new Date(Date.now() + 8 * 3600000).toISOString(), reportedBy: 'Jake Torres' },
  { id: 3, title: 'Creator not responding to messages', category: 'Communication', priority: 'Medium', status: 'InProgress', campaign: { title: 'H&M Style Drop' }, assignedTo: { name: 'Support Team' }, slaDeadline: new Date(Date.now() + 24 * 3600000).toISOString(), reportedBy: 'H&M Brand' },
  { id: 4, title: 'Duplicate campaign invitation sent', category: 'Communication', priority: 'Low', status: 'Resolved', campaign: { title: 'Puma Run Campaign' }, assignedTo: { name: 'Admin' }, slaDeadline: null, reportedBy: 'System' },
];

const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 rounded animate-pulse ${className}`} />
);

const SLATimer = ({ deadline }) => {
  if (!deadline) return <span className="text-zinc-600">—</span>;
  const diff = new Date(deadline) - Date.now();
  const hours = Math.floor(Math.abs(diff) / 3600000);
  if (diff < 0) return (
    <span className="flex items-center gap-1 text-red-400 font-semibold text-xs">
      <AlertTriangle className="w-3 h-3" />Breached
    </span>
  );
  if (hours < 4) return <span className="text-amber-400 font-semibold text-xs">{hours}h left</span>;
  return <span className="text-zinc-500 text-xs">{hours}h</span>;
};

const ResolveModal = ({ issueId, onClose, onResolve }) => {
  const [notes, setNotes] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md mx-4"
      >
        <h3 className="text-base font-semibold text-white mb-4">Resolve Issue</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter resolution notes..."
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm rounded-xl border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">Cancel</button>
          <button
            onClick={() => { onResolve(issueId, notes); onClose(); }}
            disabled={!notes.trim()}
            className="flex-1 px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-40 transition-colors"
          >
            Mark Resolved
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const IssueListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [resolveModal, setResolveModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'issues', { page, status, priority }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, pageSize: 25 });
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);
      const { data } = await axios.get(`${API}/api/admin/issues?${params}`, { headers: authHeader() });
      return data;
    },
    staleTime: 20_000,
    placeholderData: (prev) => prev,
    retry: 1,
  });

  const issues = (data?.data || MOCK_ISSUES).filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase())
  );

  const escalate = useMutation({
    mutationFn: (id) => axios.put(`${API}/api/admin/issues/${id}/escalate`, {}, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'issues']),
  });

  const resolve = useMutation({
    mutationFn: ({ id, resolution }) => axios.put(`${API}/api/admin/issues/${id}/resolve`, { resolution }, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'issues']),
  });

  const criticalCount = issues.filter(i => i.priority === 'Critical' && !['Resolved', 'Closed'].includes(i.status)).length;
  const escalatedCount = issues.filter(i => i.status === 'Escalated').length;

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Issues</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Track and resolve disputes across all campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          {escalatedCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5" />{escalatedCount} escalated
            </span>
          )}
          {criticalCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              {criticalCount} critical
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 text-sm text-white rounded-xl placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
        <select
          className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none"
          value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {['Open', 'InProgress', 'Escalated', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none"
          value={priority} onChange={e => { setPriority(e.target.value); setPage(1); }}
        >
          <option value="">All Priorities</option>
          {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/30">
                {['Issue', 'Type', 'Priority', 'Status', 'Campaign', 'Assigned', 'SLA', 'Actions'].map(col => (
                  <th key={col} className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="py-3.5 px-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && issues.map((issue) => {
                const p = PRIORITY[issue.priority] || PRIORITY.Medium;
                const s = STATUS[issue.status] || STATUS.Open;
                const TypeIcon = TYPE_ICONS[issue.category] || TYPE_ICONS.default;
                const isJustCreated = !['Escalated', 'Resolved', 'Closed'].includes(issue.status);
                const isResolvable = !['Resolved', 'Closed'].includes(issue.status);

                return (
                  <motion.tr
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/20 ${
                      issue.status === 'Escalated' ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-6 rounded-full shrink-0 ${p.dot}`} />
                        <div>
                          <p className="font-medium text-white text-sm max-w-[200px] truncate">{issue.title}</p>
                          {issue.reportedBy && <p className="text-xs text-zinc-600 mt-0.5">by {issue.reportedBy}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <TypeIcon className="w-3.5 h-3.5" />
                        {issue.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${p.bg} ${p.color}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${s.color}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500 max-w-[140px] truncate">{issue.campaign?.title || '—'}</td>
                    <td className="py-3.5 px-4 text-xs text-zinc-500">{issue.assignedTo?.name || <span className="text-zinc-700">Unassigned</span>}</td>
                    <td className="py-3.5 px-4"><SLATimer deadline={issue.slaDeadline} /></td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {isJustCreated && (
                          <button
                            onClick={() => escalate.mutate(issue.id)}
                            disabled={escalate.isPending}
                            className="text-xs px-2.5 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors font-medium"
                          >
                            Escalate
                          </button>
                        )}
                        {isResolvable && (
                          <button
                            onClick={() => setResolveModal(issue.id)}
                            className="text-xs px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-colors font-medium"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {!isLoading && issues.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-600 text-sm">
                    {search ? 'No issues match your search.' : 'No issues found. 🎉'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-800/20">
            <p className="text-sm text-zinc-500">{data.pagination.total} issues</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-zinc-700 text-sm text-zinc-400 disabled:opacity-40 hover:border-zinc-600 hover:text-white transition-colors">← Prev</button>
              <span className="px-3 py-1 text-sm text-zinc-500">Page {page} of {data.pagination.totalPages}</span>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-zinc-700 text-sm text-zinc-400 disabled:opacity-40 hover:border-zinc-600 hover:text-white transition-colors">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Resolve modal */}
      <AnimatePresence>
        {resolveModal && (
          <ResolveModal
            issueId={resolveModal}
            onClose={() => setResolveModal(null)}
            onResolve={(id, resolution) => resolve.mutate({ id, resolution })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssueListPage;
