import React, { useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useBrands } from '../hooks/useBrands';
import BrandRow from './BrandRow';
import TableSkeleton from './TableSkeleton';
import EmptyState from './EmptyState';
import { ChevronLeft, ChevronRight, Building2, AlertCircle, RefreshCw } from 'lucide-react';

const COLUMNS = [
  { id: 'select', header: '', width: 'w-8' },
  { id: 'brand', header: 'Brand', width: 'min-w-[220px]' },
  { id: 'status', header: 'Status', width: 'w-28' },
  { id: 'spend_30d', header: 'Spend (30d)', width: 'w-28' },
  { id: 'active_campaigns', header: 'Campaigns', width: 'w-24' },
  { id: 'creators_count', header: 'Creators', width: 'w-20' },
  { id: 'last_activity_at', header: 'Last Activity', width: 'w-28' },
  { id: 'risk_score', header: 'Risk Score', width: 'w-32' },
  { id: 'actions', header: '', width: 'w-10' },
];

/**
 * @param {{ queryFilters: object, onViewBrand: (b:object)=>void, selected: Set<string>, onSelect: (id:string)=>void, onSelectAll: ()=>void, activeCount: number, onReset: ()=>void }} props
 */
export default function BrandsTable({ queryFilters, onViewBrand, selected, onSelect, onSelectAll, activeCount, onReset }) {
  const { data, isLoading, isError, refetch, isFetching } = useBrands(queryFilters);

  const brands = data?.data ?? [];
  const pagination = data?.pagination;
  const page = queryFilters.page ?? 1;
  const setPage = queryFilters._setPage;

  const allSelected = brands.length > 0 && brands.every(b => selected.has(b.id));

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-semibold text-white">Failed to load brands</p>
        <p className="text-xs text-zinc-500">Something went wrong while fetching data.</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors mt-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-600/10 border-b border-indigo-500/20">
          <span className="text-xs font-semibold text-indigo-400">{selected.size} selected</span>
          <button className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">Bulk Suspend</button>
          <button className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">Export CSV</button>
          <button className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors">Send Message</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800/80">
              <th className="py-2.5 px-4">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-3.5 h-3.5 accent-indigo-500 cursor-pointer"
                />
              </th>
              {COLUMNS.slice(1).map(col => (
                <th
                  key={col.id}
                  className={`py-2.5 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap ${col.width}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={8} />
            ) : brands.length === 0 ? (
              <EmptyState
                variant={activeCount > 0 ? 'no-results' : 'no-brands'}
                onReset={onReset}
              />
            ) : (
              brands.map(brand => (
                <BrandRow
                  key={brand.id}
                  brand={brand}
                  onView={onViewBrand}
                  selected={selected.has(brand.id)}
                  onSelect={onSelect}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !isLoading && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-300 font-medium">{pagination.total}</span> brands
              {isFetching && <span className="ml-2 text-indigo-400 animate-pulse">Refreshing…</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => queryFilters._setPage(p => p - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-zinc-500 tabular-nums">
              {page} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => queryFilters._setPage(p => p + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
