import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetchBrands = async ({ page, pageSize, search }) => {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set('search', search);
  const { data } = await axios.get(`${API}/api/admin/brands?${params}`, { headers: authHeader() });
  return data;
};

const BrandListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'brands', { page, search }],
    queryFn: () => fetchBrands({ page, pageSize: 25, search }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1">All brand accounts on the platform.</p>
      </div>

      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm w-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search brands…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Brand</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Industry</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Campaigns</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Onboarded</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-zinc-400">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-zinc-800/50">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="py-3 px-4"><div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))}
              {!isLoading && data?.data?.map((brand) => {
                const profile = brand.brandProfile;
                return (
                  <motion.tr
                    key={brand.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/brands/${brand.id}`)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold">
                          {profile?.logoUrl
                            ? <img src={profile.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            : (profile?.companyName || brand.name)?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{profile?.companyName || brand.name}</p>
                          <p className="text-xs text-gray-400">{brand.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">{profile?.industry || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">{profile?.companySize || '—'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">{brand._count?.brandCampaigns ?? 0}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${profile?.onboardingCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                        {profile?.onboardingCompleted ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-zinc-500 text-xs">
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                );
              })}
              {!isLoading && data?.data?.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {data?.pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/30">
            <p className="text-sm text-gray-500">{data.pagination.total} brands</p>
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

export default BrandListPage;
