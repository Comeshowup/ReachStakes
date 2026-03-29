import React from 'react';
import { useBrandKpis } from '../hooks/useBrands';
import {
  Building2, TrendingUp, Megaphone, Users2, AlertTriangle,
  Plus, Upload, Download, ChevronDown,
} from 'lucide-react';

function fmt(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function KpiCard({ label, value, icon: Icon, color, loading }) {
  return (
    <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-5 py-4 min-w-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-0.5 truncate">{label}</p>
        {loading
          ? <div className="h-5 w-14 bg-zinc-800 rounded animate-pulse" />
          : <p className="text-lg font-bold text-white tabular-nums">{value}</p>}
      </div>
    </div>
  );
}

/**
 * @param {{ onAddBrand?: () => void, onImport?: () => void, onExport?: () => void }} props
 */
export default function BrandsHeader({ onAddBrand, onImport, onExport }) {
  const { data: kpis, isLoading } = useBrandKpis();

  return (
    <div className="space-y-4">
      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Brands</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Manage and monitor all brand accounts on the platform.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 rounded-lg hover:bg-zinc-700/80 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 rounded-lg hover:bg-zinc-700/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={onAddBrand}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Brand
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Brands" value={kpis?.total ?? 0} icon={Building2} color="bg-indigo-500/15 text-indigo-400" loading={isLoading} />
        <KpiCard label="Active Brands" value={kpis?.active ?? 0} icon={TrendingUp} color="bg-emerald-500/15 text-emerald-400" loading={isLoading} />
        <KpiCard label="Monthly Spend" value={fmt(kpis?.monthlySpend ?? 0)} icon={TrendingUp} color="bg-sky-500/15 text-sky-400" loading={isLoading} />
        <KpiCard label="Active Campaigns" value={kpis?.activeCampaigns ?? 0} icon={Megaphone} color="bg-violet-500/15 text-violet-400" loading={isLoading} />
        <KpiCard label="Churn Risk %" value={`${kpis?.churnRisk ?? 0}%`} icon={AlertTriangle} color="bg-rose-500/15 text-rose-400" loading={isLoading} />
      </div>
    </div>
  );
}
