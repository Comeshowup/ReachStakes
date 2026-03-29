/**
 * AdminControlCenter.jsx — Decision-first Admin Overview (Control Center).
 * Replaces AdminDashboardHome. Uses real API with realistic mock data fallback.
 *
 * Layout:
 *   [SystemHealthBar – full width]
 *   [AttentionRequired (main)] [FinancialSnapshot + OperationsPipeline (right)]
 *   [InsightsAlerts (2/3)]     [LiveActivity (1/3)]
 */
import React, { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Command } from 'lucide-react';
import axios from 'axios';

// Section components
import SystemHealthBar    from './controlCenter/SystemHealthBar';
import AttentionRequired  from './controlCenter/AttentionRequired';
import FinancialSnapshot  from './controlCenter/FinancialSnapshot';
import OperationsPipeline from './controlCenter/OperationsPipeline';
import InsightsAlerts     from './controlCenter/InsightsAlerts';
import LiveActivity       from './controlCenter/LiveActivity';
import CommandBar         from './controlCenter/CommandBar';

// Mock data (fallback)
import {
  MOCK_ATTENTION_ITEMS,
  MOCK_SYSTEM_HEALTH,
  MOCK_FINANCIAL,
  MOCK_PIPELINE,
  MOCK_INSIGHTS,
  MOCK_ACTIVITY,
} from './controlCenter/mockData';

// Activity feed hook (real-time)
import { useActivityFeed } from '../../../hooks/useActivityFeed';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── API fetchers ─────────────────────────────────────────────────────────────
const fetchOverview = async () => {
  const { data } = await axios.get(`${API}/api/admin/analytics/overview`, { headers: authHeader() });
  return data;
};

const fetchActionQueue = async () => {
  const { data } = await axios.get(`${API}/api/admin/action-queue`, { headers: authHeader() });
  return data;
};

// ─── Data adapters (API → component shape, falls back to mock) ───────────────
const deriveHealth = (apiData) => {
  if (!apiData) return MOCK_SYSTEM_HEALTH;
  return {
    paymentSuccessRate: {
      value:  apiData.paymentSuccessRate ?? MOCK_SYSTEM_HEALTH.paymentSuccessRate.value,
      prev:   MOCK_SYSTEM_HEALTH.paymentSuccessRate.prev,
      unit:   '%',
      status: (apiData.paymentSuccessRate ?? 97) >= 98 ? 'healthy' : (apiData.paymentSuccessRate ?? 97) >= 95 ? 'warning' : 'critical',
    },
    escrowLocked: {
      value:  apiData.escrowTotal ?? MOCK_SYSTEM_HEALTH.escrowLocked.value,
      prev:   MOCK_SYSTEM_HEALTH.escrowLocked.prev,
      unit:   '$',
      status: 'healthy',
    },
    disputeRate: {
      value:  apiData.disputeRate ?? MOCK_SYSTEM_HEALTH.disputeRate.value,
      prev:   MOCK_SYSTEM_HEALTH.disputeRate.prev,
      unit:   '%',
      status: (apiData.disputeRate ?? 3) < 1 ? 'healthy' : (apiData.disputeRate ?? 3) < 3 ? 'warning' : 'critical',
    },
    avgApprovalHrs: {
      value:  apiData.avgApprovalHrs ?? MOCK_SYSTEM_HEALTH.avgApprovalHrs.value,
      prev:   MOCK_SYSTEM_HEALTH.avgApprovalHrs.prev,
      unit:   'h',
      status: (apiData.avgApprovalHrs ?? 12) <= 8 ? 'healthy' : (apiData.avgApprovalHrs ?? 12) <= 24 ? 'warning' : 'critical',
    },
  };
};

const deriveFinancial = (apiData) => {
  if (!apiData) return MOCK_FINANCIAL;
  return {
    totalEscrow:    apiData.escrowTotal      ?? MOCK_FINANCIAL.totalEscrow,
    released7d:     apiData.last7dReleased   ?? MOCK_FINANCIAL.released7d,
    pendingPayouts: apiData.pendingPayouts   ?? MOCK_FINANCIAL.pendingPayouts,
    atRiskFunds:    apiData.disputedAmount   ?? MOCK_FINANCIAL.atRiskFunds,
  };
};

const derivePipeline = (apiData) => {
  if (!apiData) return MOCK_PIPELINE;
  return [
    {
      id: 'del',
      label: 'Deliverables Pending Review',
      count: apiData.pendingDeliverables ?? MOCK_PIPELINE[0].count,
      path: '/admin/campaigns/deliverables',
      slaBreached: (apiData.pendingDeliverables ?? 0) > 20,
    },
    {
      id: 'app',
      label: 'Approvals Pending',
      count: apiData.pendingApprovals ?? MOCK_PIPELINE[1].count,
      path: '/admin/campaigns/approvals',
      slaBreached: false,
    },
    {
      id: 'pay',
      label: 'Payouts Pending Release',
      count: apiData.pendingPayouts ?? MOCK_PIPELINE[2].count,
      path: '/admin/finance/payouts',
      slaBreached: false,
    },
  ];
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminControlCenter = () => {
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const { events: liveEvents } = useActivityFeed();

  // Keyboard shortcut ⌘K / Ctrl+K
  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Data queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
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

  // Resolved data with fallbacks
  const health    = deriveHealth(overview);
  const financial = deriveFinancial(overview);
  const pipeline  = derivePipeline(overview);
  const attention = queueRaw?.items || MOCK_ATTENTION_ITEMS;
  const activity  = liveEvents?.length > 0 ? liveEvents : MOCK_ACTIVITY;

  const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.22, delay, ease: 'easeOut' },
  });

  return (
    <>
      {/* Command Bar */}
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <div className="space-y-5 max-w-[1400px]">

        {/* ── Page header (minimal) ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white tracking-tight">Control Center</h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            id="command-bar-trigger"
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-all duration-150"
            aria-label="Open command bar"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Quick actions</span>
            <span className="text-zinc-700 font-mono ml-1">⌘K</span>
          </button>
        </div>

        {/* ── §2 System Health Bar (full width) ────────────────────────── */}
        <motion.div {...fadeIn(0)}>
          <SystemHealthBar health={health} loading={overviewLoading} />
        </motion.div>

        {/* ── Main grid: Primary + Right rail ──────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* §1 Attention Required (primary block) */}
          <motion.div {...fadeIn(0.06)}>
            <AttentionRequired items={attention} loading={queueLoading} />
          </motion.div>

          {/* Right rail: Financial + Operations */}
          <div className="flex flex-col gap-5">
            <motion.div {...fadeIn(0.08)}>
              <FinancialSnapshot financial={financial} loading={overviewLoading} />
            </motion.div>
            <motion.div {...fadeIn(0.10)}>
              <OperationsPipeline pipeline={pipeline} loading={overviewLoading} />
            </motion.div>
          </div>
        </div>

        {/* ── Bottom grid: Insights + Activity ─────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
          <motion.div {...fadeIn(0.12)}>
            <InsightsAlerts insights={MOCK_INSIGHTS} loading={false} />
          </motion.div>
          <motion.div {...fadeIn(0.14)}>
            <LiveActivity events={activity} />
          </motion.div>
        </div>

      </div>
    </>
  );
};

export default AdminControlCenter;
