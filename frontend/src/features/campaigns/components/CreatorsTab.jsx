import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  MoreHorizontal,
  RefreshCw,
  XCircle,
  CheckCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import { useCampaignCreators, useCreatorInviteAction } from '../hooks/useCampaigns.js';
import InviteCreatorsModal from './InviteCreatorsModal.jsx';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────

const STATUS_CONFIG = {
  invited:  { label: 'Invited',  cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  Invited:  { label: 'Invited',  cls: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  Approved: { label: 'Accepted', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'In Progress': { label: 'Active', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  Rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  Applied:  { label: 'Applied',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
};

const formatFollowers = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

// ─── Row Actions ──────────────────────────────────────────────────

const RowActions = ({ collab, campaignId }) => {
  const [open, setOpen] = useState(false);
  const action = useCreatorInviteAction(campaignId);

  const handleAction = (type) => {
    setOpen(false);
    if (type === 'view') {
      // TODO: Navigate to creator profile
      return;
    }
    
    action.mutate(
      { collaborationId: collab.id, action: type },
      {
        onSuccess: () => {
          const msgs = {
            resend: 'Invite resent',
            cancel: 'Invite cancelled',
            accept: 'Application accepted',
            reject: 'Application rejected'
          };
          toast.success(msgs[type] || 'Action successful');
        },
        onError: () => toast.error('Action failed'),
      }
    );
  };

  const getActions = () => {
    const status = collab.status?.toLowerCase();
    if (status === 'applied') {
      return [
        { icon: CheckCircle, label: 'Accept Application', action: 'accept' },
        { icon: XCircle, label: 'Reject Application', action: 'reject' },
        { icon: ExternalLink, label: 'View Profile', action: 'view' },
      ];
    }
    if (status === 'invited') {
      return [
        { icon: RefreshCw, label: 'Resend Invite', action: 'resend' },
        { icon: XCircle, label: 'Cancel Invite', action: 'cancel' },
        { icon: ExternalLink, label: 'View Profile', action: 'view' },
      ];
    }
    // Default actions for other statuses
    return [
      { icon: ExternalLink, label: 'View Profile', action: 'view' },
    ];
  };

  const actions = getActions();

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-40 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            {actions.map(({ icon: Icon, label, action: type }) => (
              <button
                key={type}
                onClick={() => handleAction(type)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                   type === 'reject' || type === 'cancel' 
                     ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                     : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${type === 'reject' || type === 'cancel' ? '' : 'text-gray-400'}`} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-gray-50 dark:border-zinc-800/50">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-28" />
            <div className="h-3 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse w-20" />
          </div>
        </div>
      </td>
      {[60, 70, 100, 60, 32].map((w, j) => (
        <td key={j} className="py-3.5 px-4">
          <div className="h-4 bg-gray-100 dark:bg-zinc-800 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  ));

// ─── Empty State ──────────────────────────────────────────────────

const EmptyState = ({ onInvite }) => (
  <tr>
    <td colSpan={6}>
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
          <Users className="w-7 h-7 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900 dark:text-white">No creators invited yet</p>
          <p className="text-sm text-gray-400 mt-1">Start building your creator pipeline</p>
        </div>
        <button
          onClick={onInvite}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Creators
        </button>
      </div>
    </td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'invited', 'accepted', 'rejected'];

const CreatorsTab = ({ campaignId }) => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useCampaignCreators({
    campaignId,
    status: statusFilter === 'all' ? '' : statusFilter,
  });

  const creators = data?.data ?? data?.collaborations ?? [];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Invite CTA */}
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" /> Invite Creators
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40">
                {['Creator', 'Platform', 'Audience', 'Offer', 'Status', ''].map((col, i) => (
                  <th
                    key={col}
                    className={`text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wide border-b border-gray-100 dark:border-zinc-800 ${
                      i === 0 ? 'rounded-tl-xl' : i === 5 ? 'rounded-tr-xl' : ''
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : creators.length === 0 ? (
                <EmptyState onInvite={() => setInviteOpen(true)} />
              ) : (
                creators.map((collab, idx) => {
                  const creator = collab.creator;
                  const profile = creator?.creatorProfile;
                  const status = collab.status;
                  const statusCfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
                  const initials = creator?.name?.charAt(0)?.toUpperCase() ?? '?';
                  const offer = collab.offer || {};

                  return (
                    <motion.tr
                      key={collab.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Creator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                            {profile?.avatarUrl ? (
                              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {creator?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{profile?.handle || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-zinc-400 text-sm">
                        {profile?.primaryPlatform || '—'}
                      </td>

                      {/* Audience */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-zinc-400 text-sm">
                        {formatFollowers(profile?.followersCount)}
                      </td>

                      {/* Offer */}
                      <td className="py-3.5 px-4">
                        {collab.agreedPrice || offer.amount ? (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${Number(collab.agreedPrice || offer.amount || 0).toLocaleString()}
                            </p>
                            {offer.deliverables?.length > 0 && (
                              <p className="text-xs text-gray-400">
                                {offer.deliverables.slice(0, 2).join(', ')}
                                {offer.deliverables.length > 2 && ` +${offer.deliverables.length - 2}`}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <RowActions collab={collab} campaignId={campaignId} />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <InviteCreatorsModal
        campaignId={campaignId}
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
};

export default CreatorsTab;
