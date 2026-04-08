import React, { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import ApprovalRow from './approval-row';
import { useApprovalsStore } from '../store/approvals-store';

const ROW_HEIGHT = 56; // px — fixed for virtualizer

const COLUMNS = [
  { key: 'select', label: '', width: 'w-8' },
  { key: 'priority', label: '', width: 'w-3' },
  { key: 'thumbnail', label: '', width: 'w-10' },
  { key: 'creator', label: 'Creator', width: 'w-36 shrink-0', sortable: false },
  { key: 'campaign', label: 'Campaign', width: 'flex-1 hidden md:block' },
  { key: 'brand', label: 'Brand', width: 'w-24 shrink-0 hidden lg:block' },
  { key: 'submittedAt', label: 'Submitted', width: 'w-24 shrink-0 hidden lg:block', sortable: true },
  { key: 'riskScore', label: 'Risk', width: 'shrink-0', sortable: true },
  { key: 'status', label: 'Status', width: 'w-20 shrink-0' },
  { key: 'actions', label: '', width: 'w-16 shrink-0' },
];

function SortIcon({ field, currentSort, direction }) {
  if (currentSort !== field) return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
  return direction === 'desc'
    ? <ArrowDown className="w-3 h-3 text-violet-400" />
    : <ArrowUp className="w-3 h-3 text-violet-400" />;
}

function SkeletonRow({ style }) {
  return (
    <div style={style} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04]">
      <Skeleton className="h-4 w-4 rounded-sm" />
      <Skeleton className="h-1.5 w-1.5 rounded-full" />
      <Skeleton className="h-9 w-9 rounded-md" />
      <div className="flex items-center gap-2 w-36 shrink-0">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-3 w-32 rounded flex-1 hidden md:block" />
      <Skeleton className="h-3 w-16 rounded hidden lg:block" />
      <Skeleton className="h-3 w-20 rounded hidden lg:block" />
      <Skeleton className="h-5 w-10 rounded-md" />
      <Skeleton className="h-5 w-16 rounded-md" />
      <div className="w-16 shrink-0" />
    </div>
  );
}

function EmptyState({ hasFilters, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
        <Search className="w-7 h-7 text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">
        {hasFilters ? 'No approvals match your filters' : 'No approvals found'}
      </p>
      <p className="text-xs text-slate-600 mb-5">
        {hasFilters
          ? 'Try adjusting your filter criteria.'
          : 'When creators submit content for review, it will appear here.'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Filters
        </button>
      )}
    </div>
  );
}

/**
 * ApprovalsTable — virtualized, sortable, multi-select table.
 * Uses @tanstack/react-virtual for high-performance rendering with large datasets.
 */
export default function ApprovalsTable({ items = [], loading, error, onRetry }) {
  const parentRef = useRef(null);
  const selectedRows = useApprovalsStore(s => s.selectedRows);
  const selectedApprovalId = useApprovalsStore(s => s.selectedApprovalId);
  const selectAllRows = useApprovalsStore(s => s.selectAllRows);
  const clearSelectedRows = useApprovalsStore(s => s.clearSelectedRows);
  const filters = useApprovalsStore(s => s.filters);
  const toggleSort = useApprovalsStore(s => s.toggleSort);
  const resetFilters = useApprovalsStore(s => s.resetFilters);

  const hasFilters = useMemo(() => {
    const f = filters;
    return !!(f.search || f.status !== 'all' || f.priority !== 'all' ||
      f.campaign !== 'all' || f.brand !== 'all' || f.creator ||
      f.contentType !== 'all' || f.flags.length);
  }, [filters]);

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: loading ? 8 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const allSelected = items.length > 0 && items.every(it => selectedRows.has(it.id));
  const someSelected = !allSelected && items.some(it => selectedRows.has(it.id));

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      clearSelectedRows();
    } else {
      selectAllRows(items.map(it => it.id));
    }
  }, [allSelected, items, clearSelectedRows, selectAllRows]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
        {/* Select-all checkbox */}
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          ref={node => {
            if (node) node.indeterminate = someSelected;
          }}
          className="border-white/20 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
        />
        <span className="w-3" />
        <span className="w-10" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 w-36 shrink-0">
          Creator
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 flex-1 hidden md:block">
          Campaign
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 w-24 shrink-0 hidden lg:block">
          Brand
        </span>
        {/* Sortable: Submitted */}
        <button
          onClick={() => toggleSort('submittedAt')}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors w-24 shrink-0 hidden lg:flex"
        >
          Submitted
          <SortIcon field="submittedAt" currentSort={filters.sortBy} direction={filters.sortDir} />
        </button>
        {/* Sortable: Risk */}
        <button
          onClick={() => toggleSort('riskScore')}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors shrink-0"
        >
          Risk
          <SortIcon field="riskScore" currentSort={filters.sortBy} direction={filters.sortDir} />
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 w-20 shrink-0">
          Status
        </span>
        <span className="w-16 shrink-0" />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm text-red-400 mb-2">Failed to load approvals</p>
            <button
              onClick={onRetry}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-slate-200"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <EmptyState hasFilters={hasFilters} onReset={resetFilters} />
      )}

      {/* Virtualized rows */}
      {!error && (loading || items.length > 0) && (
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto custom-scrollbar"
          style={{ contain: 'strict' }}
        >
          <div
            style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
          >
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              if (loading) {
                return (
                  <SkeletonRow
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                );
              }

              const item = items[virtualRow.index];
              if (!item) return null;

              return (
                <ApprovalRow
                  key={item.id}
                  item={item}
                  isSelected={selectedRows.has(item.id)}
                  isActive={item.id === selectedApprovalId}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Footer — result count */}
      {!loading && !error && items.length > 0 && (
        <div className="px-4 py-2 border-t border-white/[0.06] shrink-0 flex items-center justify-between">
          <span className="text-[10px] text-slate-600 tabular-nums">
            {items.length} result{items.length !== 1 ? 's' : ''}
            {selectedRows.size > 0 && ` · ${selectedRows.size} selected`}
          </span>
        </div>
      )}
    </div>
  );
}
