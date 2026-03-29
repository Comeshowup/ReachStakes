import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Target, DollarSign,
  BarChart3, Activity,
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const fetchAnalytics = async () => {
  const { data } = await axios.get(`${API}/api/admin/analytics/overview`, { headers: authHeader() });
  return data;
};

// ─── Minimal sparkline (pure CSS bar chart) ────────────────────────────────
const BarChart = ({ values = [], color = 'bg-blue-500', height = 'h-16' }) => {
  const max = Math.max(...values, 1);
  return (
    <div className={`flex items-end gap-1 ${height}`}>
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer`}
          style={{ height: `${(v / max) * 100}%`, minHeight: 3 }}
          title={v.toLocaleString()}
        />
      ))}
    </div>
  );
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, trend, icon: Icon, color, chartData, chartColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white tabular-nums mt-1.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    {chartData && <BarChart values={chartData} color={chartColor} />}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        <TrendingUp className={`w-3.5 h-3.5 ${trend < 0 ? 'rotate-180' : ''}`} />
        {Math.abs(trend)}% vs last month
      </div>
    )}
  </motion.div>
);

// ─── Breakdown row ─────────────────────────────────────────────────────────
const BreakdownRow = ({ label, value, percent, color }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-400">{label}</span>
      <span className="text-white font-medium tabular-nums">{value}</span>
    </div>
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  </div>
);

// ─── Mock data ─────────────────────────────────────────────────────────────
const MOCK_DATA = {
  activeCampaigns: 12,
  totalCampaigns: 47,
  totalCreators: 284,
  totalBrands: 38,
  openIssues: 6,
  escalatedIssues: 2,
  pendingPayouts: 9,
  last30dRevenue: 284000,
  last30dPlatformFee: 34080,
};

const REVENUE_TREND = [18000, 24500, 19000, 31000, 27000, 38000, 42000, 35000, 47000, 52000, 48000, 61000];
const CAMPAIGN_TREND = [3, 5, 4, 7, 6, 9, 8, 11, 10, 14, 12, 15];
const CREATOR_TREND = [180, 195, 210, 225, 235, 244, 252, 259, 265, 272, 278, 284];

const AdminAnalyticsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAnalytics,
    staleTime: 60_000,
    retry: 1,
  });

  const d = data || MOCK_DATA;

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Platform performance at a glance</p>
        </div>
        <select className="px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 focus:outline-none">
          {['Last 30 days', 'Last 90 days', 'This year'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard label="Total Revenue" value={`$${Number(d.last30dRevenue || 0).toLocaleString()}`} sub="30-day gross" icon={DollarSign} color="bg-emerald-600" chartData={REVENUE_TREND} chartColor="bg-emerald-500" trend={23} delay={0} />
        <MetricCard label="Platform Fees" value={`$${Number(d.last30dPlatformFee || 0).toLocaleString()}`} sub="30-day net" icon={BarChart3} color="bg-teal-600" chartData={REVENUE_TREND.map(v => Math.round(v * 0.12))} chartColor="bg-teal-500" trend={18} delay={0.05} />
        <MetricCard label="Total Creators" value={d.totalCreators} sub="registered on platform" icon={Users} color="bg-violet-600" chartData={CREATOR_TREND} chartColor="bg-violet-500" trend={12} delay={0.1} />
        <MetricCard label="Total Brands" value={d.totalBrands} sub="active advertisers" icon={Target} color="bg-blue-600" chartData={CAMPAIGN_TREND} chartColor="bg-blue-500" trend={8} delay={0.15} />
      </div>

      {/* Campaign + Issue Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Campaign Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Campaign Status</h2>
            <span className="text-xs text-zinc-600">{d.totalCampaigns} total</span>
          </div>
          <div className="space-y-3">
            <BreakdownRow label="Active" value={d.activeCampaigns} percent={Math.round(d.activeCampaigns / d.totalCampaigns * 100)} color="bg-blue-500" />
            <BreakdownRow label="Completed" value={Math.round(d.totalCampaigns * 0.55)} percent={55} color="bg-emerald-500" />
            <BreakdownRow label="Draft" value={Math.round(d.totalCampaigns * 0.19)} percent={19} color="bg-zinc-600" />
            <BreakdownRow label="Paused" value={Math.round(d.totalCampaigns * 0.07)} percent={7} color="bg-amber-500" />
          </div>
        </motion.div>

        {/* Issue Resolution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Issue Resolution</h2>
            <span className="text-xs text-zinc-600">{d.openIssues} open</span>
          </div>
          <div className="space-y-3">
            <BreakdownRow label="Open" value={d.openIssues} percent={Math.min(d.openIssues * 8, 100)} color="bg-zinc-500" />
            <BreakdownRow label="Escalated" value={d.escalatedIssues} percent={Math.min(d.escalatedIssues * 5, 100)} color="bg-red-500" />
            <BreakdownRow label="In Progress" value={3} percent={25} color="bg-blue-500" />
            <BreakdownRow label="Resolved (30d)" value={24} percent={80} color="bg-emerald-500" />
          </div>
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Avg resolution time</span>
              <span className="text-zinc-300 font-medium">6.2 hours</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue + Creator success metrics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Revenue Trend (12 months)</h2>
            <span className="text-xs text-emerald-400">+23% YoY</span>
          </div>
          <BarChart values={REVENUE_TREND} color="bg-emerald-500" height="h-28" />
          <div className="flex gap-6 pt-1 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-600">Peak Month</p>
              <p className="text-sm font-semibold text-white">${Math.max(...REVENUE_TREND).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Avg Monthly</p>
              <p className="text-sm font-semibold text-white">${Math.round(REVENUE_TREND.reduce((a, b) => a + b, 0) / REVENUE_TREND.length).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">YTD Total</p>
              <p className="text-sm font-semibold text-white">${REVENUE_TREND.reduce((a, b) => a + b, 0).toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-white">Key Rates</h2>
          <div className="space-y-5">
            {[
              { label: 'Campaign Success Rate', value: '79%', percent: 79, color: 'bg-blue-500' },
              { label: 'Creator Response Rate', value: '85%', percent: 85, color: 'bg-violet-500' },
              { label: 'Payment Success Rate', value: '97%', percent: 97, color: 'bg-emerald-500' },
              { label: 'Issue Resolution Rate', value: '92%', percent: 92, color: 'bg-teal-500' },
            ].map(r => (
              <div key={r.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">{r.label}</span>
                  <span className="text-white font-semibold">{r.value}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.percent}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
                    className={`h-full ${r.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
