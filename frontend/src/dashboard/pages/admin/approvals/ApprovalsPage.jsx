import React, { useCallback } from 'react';
import { Shield } from 'lucide-react';
import { useApprovals } from './api/approvals-api';
import { useApprovalsStore } from './store/approvals-store';
import KpiStrip from './components/kpi-strip';
import FiltersSidebar from './components/filters-sidebar';
import ApprovalsTable from './components/approvals-table';
import ReviewPanel from './components/review-panel';
import BatchToolbar from './components/batch-toolbar';

/**
 * ApprovalsPage — 3-panel layout for the admin approvals queue.
 *
 * Layout:
 *   [KPI Strip]
 *   [Filters Sidebar] | [Approvals Table] | [Review Panel]
 *
 * State:
 *   - React Query → server/data state (items, kpi)
 *   - Zustand → UI state (filters, selectedApprovalId, selectedRows)
 */
export default function ApprovalsPage() {
  const filters = useApprovalsStore(s => s.filters);

  const { data, isLoading, isError, refetch } = useApprovals(filters);

  const items = data?.items ?? [];
  const kpi = data?.kpi;

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <h1 className="text-base font-semibold text-slate-100">Approvals</h1>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <KpiStrip kpi={kpi} loading={isLoading} />
        </div>
      </div>

      {/* ── 3-Panel Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0 rounded-xl border border-white/[0.06] overflow-hidden bg-[#0d0d14]">

        {/* LEFT: Filters Sidebar */}
        <div className="w-52 shrink-0 border-r border-white/[0.06] p-4 overflow-y-auto custom-scrollbar hidden lg:block">
          <FiltersSidebar />
        </div>

        {/* CENTER: Approvals Table */}
        <div className="flex-1 min-w-0 flex flex-col">
          <ApprovalsTable
            items={items}
            loading={isLoading}
            error={isError}
            onRetry={refetch}
          />
        </div>

        {/* RIGHT: Review Panel */}
        <div className="w-[380px] shrink-0 border-l border-white/[0.06] hidden xl:flex flex-col">
          <ReviewPanel items={items} />
        </div>
      </div>

      {/* Batch action floating toolbar */}
      <BatchToolbar />
    </div>
  );
}
