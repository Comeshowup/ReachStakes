import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Instagram, Youtube, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const TIER_COLORS = { None: 'bg-gray-100 text-gray-500', Silver: 'bg-slate-100 text-slate-600', Gold: 'bg-yellow-100 text-yellow-700', Black: 'bg-zinc-900 text-white' };
const PAYOUT_COLORS = { Active: 'bg-emerald-100 text-emerald-700', Pending: 'bg-amber-100 text-amber-700', Inactive: 'bg-gray-100 text-gray-400', Suspended: 'bg-red-100 text-red-600' };

const fetchCreators = async ({ page, pageSize, search, platform }) => {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set('search', search);
  if (platform) params.set('platform', platform);
  const { data } = await axios.get(`${API}/api/admin/creators?${params}`, { headers: authHeader() });
  return data;
};

const CreatorListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'creators', { page, search, platform }],
    queryFn: () => fetchCreators({ page, pageSize: 25, search, platform }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creators</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">Browse and manage all creators on the platform.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-gray-900 dark:text-white"
            placeholder="Search creators…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none"
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setPage(1); }}
        >
          <option value="">All Platforms</option>
          {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Twitch', 'Other'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Creator</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Platform</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Followers</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Campaigns</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Tier</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Payout</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-zinc-800/50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && data?.data?.map((creator) => {
                const profile = creator.creatorProfile;
                return (
                  <motion.tr
                    key={creator.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/creators/${creator.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {profile?.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            : creator.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{creator.name}</p>
                          <p className="text-xs text-gray-400">@{profile?.handle || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">{profile?.primaryPlatform || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                      {profile?.followersCount ? Number(profile.followersCount).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">{creator._count?.creatorCollabs ?? 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIER_COLORS[profile?.verificationTier] || TIER_COLORS.None}`}>
                        {profile?.verificationTier || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${PAYOUT_COLORS[profile?.payoutStatus] || PAYOUT_COLORS.Inactive}`}>
                        {profile?.payoutStatus || 'Inactive'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {!isLoading && data?.data?.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No creators found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
            <p className="text-sm text-gray-500">{data.pagination.total} creators</p>
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

export default CreatorListPage;
