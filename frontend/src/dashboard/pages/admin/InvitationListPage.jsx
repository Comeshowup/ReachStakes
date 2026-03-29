import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Send, XCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const STATUS_COLORS = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Declined: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Expired: 'bg-gray-100 text-gray-500',
  Revoked: 'bg-gray-100 text-gray-500',
};

const fetchInvitations = async ({ page, status }) => {
  const params = new URLSearchParams({ page, pageSize: 25 });
  if (status) params.set('status', status);
  const { data } = await axios.get(`${API}/api/admin/invitations?${params}`, { headers: authHeader() });
  return data;
};

const InvitationListPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invitations', { page, status }],
    queryFn: () => fetchInvitations({ page, status }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const revoke = useMutation({
    mutationFn: (id) => axios.put(`${API}/api/admin/invitations/${id}/revoke`, {}, { headers: authHeader() }),
    onSuccess: () => queryClient.invalidateQueries(['admin', 'invitations']),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invitations</h1>
          <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Manage campaign invitations sent to creators.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <select className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none"
          value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['Pending', 'Accepted', 'Declined', 'Expired', 'Revoked'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Creator</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Campaign</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Sent By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Expires</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-zinc-800/50">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && data?.data?.map((inv) => (
                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-white">{inv.creator?.name}</p>
                    <p className="text-xs text-gray-400">@{inv.creator?.creatorProfile?.handle || '—'}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400 text-xs">{inv.campaign?.title || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                    {inv.agreedRate ? `$${Number(inv.agreedRate).toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-zinc-500 text-xs">{inv.invitedBy?.name || '—'}</td>
                  <td className="py-3 px-4 text-xs text-gray-400">
                    {new Date(inv.expiresAt) < Date.now()
                      ? <span className="text-red-400">Expired</span>
                      : new Date(inv.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {inv.status === 'Pending' && (
                      <button
                        onClick={() => revoke.mutate(inv.id)}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />Revoke
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {!isLoading && data?.data?.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No invitations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
            <p className="text-sm text-gray-500">{data.pagination.total} invitations</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-zinc-700 text-sm disabled:opacity-40">← Prev</button>
              <span className="px-3 py-1 text-sm text-gray-500">Page {page} of {data.pagination.totalPages}</span>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-gray-200 dark:border-zinc-700 text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationListPage;
