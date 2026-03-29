import React, { useState, useCallback, useDeferredValue } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit2,
  PauseCircle,
  Archive,
  ExternalLink,
  FolderOpen,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCampaigns, useUpdateCampaignStatus } from '../../../features/campaigns/hooks/useCampaigns.js';
import { STATUS_TABS } from '../../../features/campaigns/types/index.js';

// ─── Constants ───────────────────────────────────────────────────

const STATUS_BADGE = {
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  paused:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  // capitalised variants from API
  Active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Draft:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Paused:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ─── Skeleton Rows ────────────────────────────────────────────────

const SkeletonRows = () =>
  Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100 dark:border-zinc-800/50">
      {Array.from({ length: 7 }).map((__, j) => (
        <td key={j} className="py-3.5 px-4">
          <div
            className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"
            style={{ width: `${[140, 80, 60, 55, 70, 80, 32][j]}px` }}
          />
        </td>
      ))}
    </tr>
  ));

// ─── Empty State ──────────────────────────────────────────────────

const EmptyState = ({ filtered, onClear }) => (
  <tr>
    <td colSpan={7}>
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-gray-900 dark:text-white font-semibold">
            {filtered ? 'No campaigns match' : 'No campaigns yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {filtered
              ? 'Try adjusting your search or filters'
              : 'Create your first campaign to get started'}
          </p>
        </div>
        {filtered && (
          <button
            onClick={onClear}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </td>
  </tr>
);

// ─── Progress Bar ─────────────────────────────────────────────────

const ProgressBar = ({ value = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="w-20 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    <span className="text-xs text-gray-400">{Math.round(value)}%</span>
  </div>
);

// ─── Actions Dropdown ─────────────────────────────────────────────

const ActionsMenu = ({ campaign, onStatusChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-lg py-1 overflow-hidden"
            >
              {[
                { icon: Edit2, label: 'Edit', action: 'edit' },
                { icon: ExternalLink, label: 'View Detail', action: 'view' },
                { icon: PauseCircle, label: 'Pause', action: 'pause' },
                { icon: Archive, label: 'Archive', action: 'archive' },
              ].map(({ icon: Icon, label, action }) => (
                <button
                  key={action}
                  onClick={() => { onStatusChange(campaign, action); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────

const CampaignListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search via useDeferredValue
  const search = useDeferredValue(searchInput);

  const { data, isLoading } = useCampaigns({ page, search, status: activeTab });
  const updateStatus = useUpdateCampaignStatus();

  const campaigns = data?.data ?? data?.campaigns ?? [];
  const pagination = data?.pagination;

  const isFiltered = !!(search || activeTab !== 'all');

  const handleClear = useCallback(() => {
    setSearchInput('');
    setActiveTab('all');
    setPage(1);
  }, []);

  const handleStatusChange = useCallback(
    (campaign, action) => {
      const statusMap = {
        pause: 'Paused',
        archive: 'Cancelled',
        edit: null,
        view: null,
      };
      const newStatus = statusMap[action];
      if (newStatus) {
        updateStatus.mutate({ id: campaign.id, status: newStatus });
      } else if (action === 'view' || action === 'edit') {
        navigate(`/admin/campaigns/${campaign.id}`);
      }
    },
    [updateStatus, navigate]
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Campaigns
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Manage all brand campaigns on the platform
          </p>
        </div>
        <button
          onClick={() => navigate('/brand/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-zinc-800">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top Bar: Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Search campaigns…"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          />
        </div>
        {isFiltered && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40">
                {['Campaign', 'Brand', 'Status', 'Creators', 'Budget', 'Progress', ''].map((col) => (
                  <th
                    key={col}
                    className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : campaigns.length === 0 ? (
                <EmptyState filtered={isFiltered} onClear={handleClear} />
              ) : (
                campaigns.map((campaign, idx) => {
                  const name = campaign.title || campaign.name || 'Untitled';
                  const brand = campaign.brand?.brandProfile?.companyName || campaign.brand?.name || '—';
                  const status = campaign.status;
                  const creatorsTotal = campaign._count?.collaborations ?? 0;
                  const budget = campaign.targetBudget
                    ? `$${Number(campaign.targetBudget).toLocaleString()}`
                    : '—';
                  const progress = campaign.progressPct ?? 0;

                  return (
                    <motion.tr
                      key={campaign.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02, duration: 0.2 }}
                      className="group border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                    >
                      {/* Campaign */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                          {name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {campaign.platformRequired || 'Any platform'}
                        </p>
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4">
                        <span className="text-gray-600 dark:text-zinc-400">{brand}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGE[status] || STATUS_BADGE.draft
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Creators */}
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-400">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {creatorsTotal}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-zinc-400">
                        {budget}
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4">
                        <ProgressBar value={progress} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionsMenu
                            campaign={campaign}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {pagination.total} campaigns
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500 dark:text-zinc-400">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 text-sm text-gray-600 dark:text-zinc-400 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignListPage;
