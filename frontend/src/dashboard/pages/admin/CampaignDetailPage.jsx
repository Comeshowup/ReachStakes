import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BarChart2,
  Users,
  FileText,
  Settings,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckSquare,
  MessageSquare,
  Edit3,
  PauseCircle,
  Archive,
  Clock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCampaign, useUpdateCampaignStatus } from '../../../features/campaigns/hooks/useCampaigns.js';
import CreatorsTab from '../../../features/campaigns/components/CreatorsTab.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── Status Config ─────────────────────────────────────────────────

const STATUS_BADGE = {
  Active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Draft:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Paused:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft:     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ─── Overview Tab ──────────────────────────────────────────────────

const OverviewTab = ({ campaign, campaignId }) => {
  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['admin', 'campaigns', campaignId, 'timeline', 'recent'],
    queryFn: () =>
      axios
        .get(`${API}/api/admin/campaigns/${campaignId}/timeline?pageSize=5`, { headers: authHeader() })
        .then((r) => r.data),
    staleTime: 30_000,
    enabled: !!campaignId,
  });

  const kpis = [
    {
      label: 'Total Budget',
      value: campaign.targetBudget
        ? `$${Number(campaign.targetBudget).toLocaleString()}`
        : '—',
      icon: DollarSign,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
    {
      label: 'Active Creators',
      value: campaign._count?.collaborations ?? 0,
      icon: Users,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      label: 'Open Issues',
      value: campaign._count?.issues ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      label: 'Tasks',
      value: campaign._count?.tasks ?? 0,
      icon: CheckSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`${kpi.bg} rounded-xl p-4 border border-transparent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">{kpi.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Description */}
      {campaign.description && (
        <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Description</h4>
          <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
            {campaign.description}
          </p>
        </div>
      )}

      {/* Escrow */}
      {campaign.campaignEscrow && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/40">
          <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3">Escrow Status</h4>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Funded', value: campaign.campaignEscrow.fundedAmount },
              { label: 'Released', value: campaign.campaignEscrow.releasedAmount },
              { label: 'Remaining', value: campaign.campaignEscrow.remainingAmount },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-0.5">{label}</p>
                <p className="font-bold text-indigo-900 dark:text-indigo-200">
                  ${Number(value || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-3">Recent Activity</h4>
        {timelineLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-zinc-700 mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-48 mb-1" />
                  <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (timeline?.data ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <div className="space-y-0">
            {(timeline?.data ?? []).map((event, i, arr) => (
              <div key={event.id} className="flex gap-3 pb-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 z-10" />
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 dark:bg-zinc-700 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    {event.description || event.type}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Deliverables Tab ──────────────────────────────────────────────

const DeliverablesTab = ({ campaignId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns', campaignId, 'deliverables'],
    queryFn: () =>
      axios
        .get(`${API}/api/admin/campaigns/${campaignId}/deliverables`, { headers: authHeader() })
        .then((r) => r.data),
    staleTime: 30_000,
    enabled: !!campaignId,
  });

  const items = data?.data ?? data ?? [];

  const COLLAB_STATUS = {
    'Under Review': 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-red-100 text-red-700',
    'In Progress': 'bg-indigo-100 text-indigo-700',
    Applied: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-3">
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="space-y-1.5">
              <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-40" />
              <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-24" />
            </div>
            <div className="h-6 bg-gray-100 dark:bg-zinc-800 rounded-full animate-pulse w-20" />
          </div>
        ))}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">No deliverables submitted yet</p>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start justify-between py-3.5 border-b border-gray-100 dark:border-zinc-800 last:border-0"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.creator?.name}
            </p>
            {item.submissionTitle && (
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{item.submissionTitle}</p>
            )}
            {item.submissionUrl && (
              <a
                href={item.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-500 hover:underline"
              >
                View submission →
              </a>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {item.payoutReleased && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Paid</span>
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                COLLAB_STATUS[item.status] || 'bg-gray-100 text-gray-500'
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Settings Tab ──────────────────────────────────────────────────

const SettingsTab = ({ campaign }) => (
  <div className="space-y-5">
    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-5 space-y-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">Campaign Details</h4>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Platform', value: campaign.platformRequired || 'Any' },
          { label: 'Status', value: campaign.status },
          { label: 'Created', value: new Date(campaign.createdAt).toLocaleDateString() },
          { label: 'Deadline', value: campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
    <p className="text-sm text-gray-400 text-center">Full settings editor coming soon</p>
  </div>
);

// ─── Tabs Config ───────────────────────────────────────────────────

const TABS = [
  { key: 'overview',     label: 'Overview',     icon: BarChart2 },
  { key: 'creators',     label: 'Creators',     icon: Users },
  { key: 'deliverables', label: 'Deliverables', icon: FileText },
  { key: 'settings',     label: 'Settings',     icon: Settings },
  // Legacy tabs preserved
  { key: 'timeline',     label: 'Timeline',     icon: Activity },
  { key: 'payments',     label: 'Payments',     icon: DollarSign },
  { key: 'issues',       label: 'Issues',       icon: AlertTriangle },
  { key: 'tasks',        label: 'Tasks',        icon: CheckSquare },
  { key: 'messages',     label: 'Messages',     icon: MessageSquare },
];

// Legacy tabs (re-exported from original file to avoid breaking existing data)
const LegacyTab = ({ campaignId, endpoint, emptyText }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns', campaignId, endpoint],
    queryFn: () =>
      axios.get(`${API}/api/admin/campaigns/${campaignId}/${endpoint}`, { headers: authHeader() }).then((r) => r.data),
    staleTime: 30_000,
    enabled: !!campaignId,
  });
  if (isLoading) return <p className="text-gray-400 text-sm py-4">Loading…</p>;
  return (
    <div className="py-4">
      <p className="text-gray-400 text-sm">{emptyText}</p>
    </div>
  );
};

// ─── Page Skeleton ─────────────────────────────────────────────────

const PageSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse w-64" />
    <div className="h-5 bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse w-40" />
    <div className="h-40 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────

const CampaignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const { data: campaign, isLoading } = useCampaign(id);
  const updateStatus = useUpdateCampaignStatus();

  if (isLoading) return <PageSkeleton />;
  if (!campaign) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertTriangle className="w-8 h-8 text-gray-400" />
      <p className="text-gray-400">Campaign not found.</p>
    </div>
  );

  const status = campaign.status;
  const brandName = campaign.brand?.brandProfile?.companyName || campaign.brand?.name || '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors mt-0.5 text-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {campaign.title || campaign.name}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                STATUS_BADGE[status] || STATUS_BADGE.draft
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 dark:text-zinc-400 flex-wrap">
            <span>{brandName}</span>
            {campaign.targetBudget && (
              <>
                <span>·</span>
                <span>${Number(campaign.targetBudget).toLocaleString()} budget</span>
              </>
            )}
            {campaign.deadline && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(campaign.deadline).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {[
            { icon: Edit3, label: 'Edit', action: 'edit' },
            { icon: PauseCircle, label: 'Pause', action: 'pause' },
            { icon: Archive, label: 'Archive', action: 'archive' },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={action}
              onClick={() => {
                if (action === 'pause') updateStatus.mutate({ id, status: 'Paused' });
                else if (action === 'archive') updateStatus.mutate({ id, status: 'Cancelled' });
              }}
              title={label}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200 dark:border-zinc-800">
        <div className="flex gap-0.5 overflow-x-auto pb-px scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab campaign={campaign} campaignId={id} />
          )}
          {activeTab === 'creators' && (
            <CreatorsTab campaignId={id} />
          )}
          {activeTab === 'deliverables' && (
            <DeliverablesTab campaignId={id} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab campaign={campaign} />
          )}
          {/* Legacy tabs */}
          {activeTab === 'timeline' && (
            <LegacyTab campaignId={id} endpoint="timeline" emptyText="No timeline events yet." />
          )}
          {activeTab === 'payments' && (
            <LegacyTab campaignId={id} endpoint="payments" emptyText="No payment transactions yet." />
          )}
          {activeTab === 'issues' && (
            <LegacyTab campaignId={id} endpoint="issues" emptyText="No issues for this campaign." />
          )}
          {activeTab === 'tasks' && (
            <LegacyTab campaignId={id} endpoint="tasks" emptyText="No tasks for this campaign." />
          )}
          {activeTab === 'messages' && (
            <LegacyTab campaignId={id} endpoint="messages" emptyText="No messages yet." />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CampaignDetailPage;
