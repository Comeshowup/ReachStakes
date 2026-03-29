import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, AlertTriangle, DollarSign, CheckSquare,
  TrendingUp, TrendingDown, Minus, Check, Zap,
  PlayCircle, Clock, ChevronRight, Users, Activity,
  CreditCard, MessageSquare, X, ArrowUpRight,
} from 'lucide-react';
import axios from 'axios';
import { useActivityFeed } from '../../../hooks/useActivityFeed';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── API helpers ────────────────────────────────────────────────────────────
const fetchOverview = async () => {
  const { data } = await axios.get(`${API}/api/admin/analytics/overview`, { headers: authHeader() });
  return data;
};

const fetchActionQueue = async () => {
  const { data } = await axios.get(`${API}/api/admin/action-queue`, { headers: authHeader() });
  return data;
};

// ─── Mock action queue for graceful degradation ─────────────────────────────
const MOCK_QUEUE = [
  { id: 'aq1', category: 'Urgent Issues', priority: 0, title: 'Payment dispute: Nike Summer campaign', subtitle: 'Brand filed dispute • $4,200 in escrow', action: 'Resolve', actionPath: '/admin/issues', color: 'red' },
  { id: 'aq2', category: 'Pending Payments', priority: 1, title: 'Release payout to Emma Wilson', subtitle: 'Content approved 3 days ago • $1,800', action: 'Release', actionPath: '/admin/payments', color: 'amber' },
  { id: 'aq3', category: 'Campaign Approvals', priority: 2, title: 'Adidas Collab needs review', subtitle: '14 creators submitted deliverables', action: 'Review', actionPath: '/admin/campaigns', color: 'blue' },
  { id: 'aq4', category: 'Pending Payments', priority: 3, title: 'Release payout to Jake Torres', subtitle: 'Milestone completed • $950', action: 'Release', actionPath: '/admin/payments', color: 'amber' },
  { id: 'aq5', category: 'Creator Deliverables', priority: 4, title: 'H&M Fall — 3 deliverables pending', subtitle: 'Deadline in 18 hours', action: 'View', actionPath: '/admin/campaigns', color: 'violet' },
];

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  red:    { bg: 'bg-red-500/10 dark:bg-red-500/10',    dot: 'bg-red-500',    text: 'text-red-600 dark:text-red-400',    btn: 'bg-red-500 hover:bg-red-600 text-white' },
  amber:  { bg: 'bg-amber-500/10 dark:bg-amber-500/10', dot: 'bg-amber-500',  text: 'text-amber-600 dark:text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
  blue:   { bg: 'bg-blue-500/10 dark:bg-blue-500/10',  dot: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400',   btn: 'bg-blue-500 hover:bg-blue-600 text-white' },
  violet: { bg: 'bg-violet-500/10',                     dot: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400', btn: 'bg-violet-500 hover:bg-violet-600 text-white' },
  green:  { bg: 'bg-emerald-500/10',                    dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
};

const EVENT_ICONS = {
  campaign_created: { icon: Target,       color: 'bg-blue-500/15 text-blue-500' },
  creator_joined:   { icon: Users,        color: 'bg-violet-500/15 text-violet-500' },
  payment_released: { icon: DollarSign,   color: 'bg-emerald-500/15 text-emerald-500' },
  issue_resolved:   { icon: Check,        color: 'bg-green-500/15 text-green-500' },
  issue_created:    { icon: AlertTriangle,color: 'bg-red-500/15 text-red-500' },
  default:          { icon: Activity,     color: 'bg-zinc-500/15 text-zinc-500' },
};

// ─── Skeleton loader ─────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`bg-zinc-800/60 rounded animate-pulse ${className}`} />
);

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KPICard = ({ title, value, icon: Icon, iconBg, trend, trendLabel, onClick, loading }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-zinc-500';

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group w-full text-left bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-3xl font-bold text-white mt-1.5 tabular-nums">{value ?? '—'}</p>
          )}
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trendLabel}</span>
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
        <span>View details</span>
        <ArrowUpRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
};

// ─── Action Queue Item ────────────────────────────────────────────────────────
const ActionItem = ({ item, onDismiss, loading }) => {
  const navigate = useNavigate();
  const c = PRIORITY_COLOR[item.color] || PRIORITY_COLOR.blue;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl ${c.bg} border border-white/5 group`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${c.dot} shadow-lg`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate(item.actionPath)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}
        >
          {item.action}
        </button>
        <button
          onClick={() => onDismiss(item.id)}
          className="p-1 text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Activity Event ───────────────────────────────────────────────────────────
const ActivityEvent = ({ event }) => {
  const schema = EVENT_ICONS[event.type] || EVENT_ICONS.default;
  const Icon = schema.icon;

  const elapsed = (() => {
    const diff = Date.now() - new Date(event.time).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 py-3 border-b border-zinc-800/60 last:border-0"
    >
      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${schema.color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 leading-snug">{event.message}</p>
        {event.actor && (
          <p className="text-xs text-zinc-600 mt-0.5">{event.actor}</p>
        )}
      </div>
      <span className="text-xs text-zinc-600 shrink-0 pt-0.5">{elapsed}</span>
    </motion.div>
  );
};

// ─── Mini Sparkline (pure CSS bar chart) ─────────────────────────────────────
const MiniBarChart = ({ values = [], color = 'bg-blue-500', label }) => {
  const max = Math.max(...values, 1);
  return (
    <div>
      {label && <p className="text-xs text-zinc-500 mb-2">{label}</p>}
      <div className="flex items-end gap-1 h-12">
        {values.map((v, i) => (
          <div
            key={i}
            className={`flex-1 ${color} rounded-sm opacity-70 hover:opacity-100 transition-opacity`}
            style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Performance Snapshot ─────────────────────────────────────────────────────
const PerformanceSnapshot = ({ data, loading }) => {
  const revenueData = data?.revenueTrend || [12000, 18000, 14500, 21000, 19500, 24800, 28000];
  const successData = data?.campaignSuccessRate ? [60, 65, 70, 72, 68, 75, Math.round(data.campaignSuccessRate)] : [60, 65, 70, 72, 68, 75, 79];
  const responseData = data?.creatorResponseRate ? [70, 74, 68, 80, 76, 82, Math.round(data.creatorResponseRate)] : [70, 74, 68, 80, 76, 82, 85];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white">Performance Snapshot</h2>
        <span className="text-xs text-zinc-500">Last 7 days</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          {loading ? <Skeleton className="h-12" /> : (
            <>
              <MiniBarChart values={revenueData} color="bg-emerald-500" label="Revenue Trend" />
              <p className="text-lg font-bold text-white mt-2">${Number(data?.last30dRevenue || 0).toLocaleString()}</p>
              <p className="text-xs text-zinc-600">30-day total</p>
            </>
          )}
        </div>
        <div>
          {loading ? <Skeleton className="h-12" /> : (
            <>
              <MiniBarChart values={successData} color="bg-blue-500" label="Campaign Success Rate" />
              <p className="text-lg font-bold text-white mt-2">{data?.campaignSuccessRate ?? 79}%</p>
              <p className="text-xs text-zinc-600">campaigns completed</p>
            </>
          )}
        </div>
        <div>
          {loading ? <Skeleton className="h-12" /> : (
            <>
              <MiniBarChart values={responseData} color="bg-violet-500" label="Creator Response Rate" />
              <p className="text-lg font-bold text-white mt-2">{data?.creatorResponseRate ?? 85}%</p>
              <p className="text-xs text-zinc-600">avg response rate</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const { events } = useActivityFeed();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: fetchOverview,
    staleTime: 30_000,
    retry: 1,
  });

  const { data: queueRaw, isLoading: queueLoading } = useQuery({
    queryKey: ['admin', 'action-queue'],
    queryFn: fetchActionQueue,
    staleTime: 15_000,
    retry: 1,
  });

  const queue = (queueRaw?.items || MOCK_QUEUE).filter(item => !dismissedIds.has(item.id));

  const dismiss = (id) => setDismissedIds(prev => new Set([...prev, id]));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const adminName = (() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo') || '{}').name?.split(' ')[0] || 'Admin';
    } catch { return 'Admin'; }
  })();

  return (
    <div className="space-y-6 max-w-[1280px]">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {adminName}</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {data?.escalatedIssues > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/admin/issues?status=Escalated')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            {data.escalatedIssues} escalated {data.escalatedIssues === 1 ? 'issue' : 'issues'}
          </motion.button>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Active Campaigns"
          value={data?.activeCampaigns}
          icon={Target}
          iconBg="bg-blue-600"
          trend="up"
          trendLabel={`${data?.totalCampaigns ?? '—'} total`}
          onClick={() => navigate('/admin/campaigns?status=Active')}
          loading={isLoading}
        />
        <KPICard
          title="Pending Approvals"
          value={data?.pendingApprovals ?? data?.pendingPayouts}
          icon={CheckSquare}
          iconBg="bg-amber-600"
          trend={data?.pendingApprovals > 5 ? 'up' : 'neutral'}
          trendLabel="awaiting action"
          onClick={() => navigate('/admin/campaigns?filter=pending')}
          loading={isLoading}
        />
        <KPICard
          title="Escrow Volume"
          value={data?.last30dRevenue ? `$${Number(data.last30dRevenue).toLocaleString()}` : '$0'}
          icon={DollarSign}
          iconBg="bg-emerald-600"
          trend="up"
          trendLabel="30-day volume"
          onClick={() => navigate('/admin/payments')}
          loading={isLoading}
        />
        <KPICard
          title="Issues Requiring Attention"
          value={data?.openIssues}
          icon={AlertTriangle}
          iconBg={data?.openIssues > 0 ? 'bg-red-600' : 'bg-zinc-600'}
          trend={data?.openIssues > 0 ? 'down' : 'neutral'}
          trendLabel={data?.escalatedIssues > 0 ? `${data.escalatedIssues} escalated` : 'all clear'}
          onClick={() => navigate('/admin/issues')}
          loading={isLoading}
        />
      </div>

      {/* Main grid: Action Queue + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* Action Queue */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Action Queue</h2>
              {queue.length > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded-md">{queue.length}</span>
              )}
            </div>
            <span className="text-xs text-zinc-600">Sorted by priority</span>
          </div>

          <div className="p-4 space-y-2.5">
            {queueLoading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 rounded-xl bg-zinc-800/40">
                <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}

            <AnimatePresence mode="popLayout">
              {!queueLoading && queue.map((item) => (
                <ActionItem key={item.id} item={item} onDismiss={dismiss} />
              ))}
            </AnimatePresence>

            {!queueLoading && queue.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-10 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">All clear</p>
                <p className="text-xs text-zinc-600 mt-1">No pending actions</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-white">Live Activity</h2>
            </div>
            <span className="text-xs text-zinc-600">Real-time</span>
          </div>
          <div className="px-4 overflow-y-auto max-h-[420px] custom-scrollbar">
            <AnimatePresence initial={false}>
              {events.slice(0, 20).map((event) => (
                <ActivityEvent key={event.id} event={event} />
              ))}
            </AnimatePresence>
            {events.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm text-zinc-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Snapshot */}
      <PerformanceSnapshot data={data} loading={isLoading} />
    </div>
  );
};

export default AdminDashboardHome;
