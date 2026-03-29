/**
 * CreatorsTable.jsx — TanStack Table v8 implementation.
 * High-density, sortable, selectable, paginated creator table.
 */

import React, { useMemo, useCallback, memo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, ExternalLink, Copy, Ban } from 'lucide-react';
import {
  formatFollowers,
  formatEngagement,
  formatCurrency,
  formatRelativeTime,
  TIER_META,
  STATUS_META,
  PLATFORM_META,
} from '../utils/creatorUtils';

// ─── Platform Icons (SVG inline) ───────────────────────────────────────────────
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);

const TiktokIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const PlatformIcon = ({ platform, className = 'w-3.5 h-3.5' }) => {
  if (platform === 'instagram') return <InstagramIcon className={`${className} text-pink-400`} />;
  if (platform === 'youtube') return <YoutubeIcon className={`${className} text-red-400`} />;
  if (platform === 'tiktok') return <TiktokIcon className={`${className} text-cyan-400`} />;
  return null;
};

// ─── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = ({ sorted }) => {
  if (!sorted) return <ChevronsUpDown className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 ml-1 shrink-0" />;
  if (sorted === 'asc') return <ChevronUp className="w-3 h-3 text-zinc-300 ml-1 shrink-0" />;
  return <ChevronDown className="w-3 h-3 text-zinc-300 ml-1 shrink-0" />;
};

// ─── Action dropdown ───────────────────────────────────────────────────────────
const RowActions = memo(({ creator, onAction }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1">
          <button
            onClick={() => { onAction('view', creator); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Profile
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(creator.handle); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" /> Copy Handle
          </button>
          <div className="my-1 border-t border-zinc-800" />
          <button
            onClick={() => { onAction('suspend', creator); setOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
          >
            <Ban className="w-3.5 h-3.5" /> Suspend
          </button>
        </div>
      )}
    </div>
  );
});

// ─── Table skeleton ────────────────────────────────────────────────────────────
const TableSkeleton = ({ rows = 10 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="border-b border-zinc-800/40">
        <td className="py-2.5 px-4 w-10">
          <div className="w-4 h-4 bg-zinc-800 rounded animate-pulse" />
        </td>
        <td className="py-2.5 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-zinc-800/60 rounded animate-pulse" />
            </div>
          </div>
        </td>
        {Array.from({ length: 8 }).map((__, j) => (
          <td key={j} className="py-2.5 px-4">
            <div className="h-3 bg-zinc-800/60 rounded animate-pulse" style={{ width: `${40 + (j * 7) % 40}%` }} />
          </td>
        ))}
        <td className="py-2.5 px-4 w-10" />
      </tr>
    ))}
  </>
);

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters, onReset }) => (
  <tr>
    <td colSpan={12} className="py-20 text-center">
      <p className="text-sm font-medium text-zinc-400">
        {hasFilters ? 'No creators match your filters' : 'No creators found'}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
        >
          Clear filters
        </button>
      )}
    </td>
  </tr>
);

// ─── Error state ───────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <tr>
    <td colSpan={12} className="py-20 text-center">
      <p className="text-sm font-medium text-zinc-400">Failed to load creators</p>
      <button
        onClick={onRetry}
        className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
      >
        Try again
      </button>
    </td>
  </tr>
);

const columnHelper = createColumnHelper();

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (onRowAction, onOpenDrawer) => [
  // Checkbox
  columnHelper.display({
    id: 'select',
    size: 40,
    header: ({ table }) => (
      <input
        type="checkbox"
        className="w-3.5 h-3.5 rounded border border-zinc-600 bg-zinc-800 accent-zinc-300 cursor-pointer"
        checked={table.getIsAllPageRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomePageRowsSelected();
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="w-3.5 h-3.5 rounded border border-zinc-600 bg-zinc-800 accent-zinc-300 cursor-pointer"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
  }),

  // Creator (avatar + name + handle)
  columnHelper.accessor('name', {
    header: 'Creator',
    size: 220,
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-zinc-800">
            {c.avatar
              ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
              : <span className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-bold">{c.name[0]}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{c.name}</p>
            <p className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">{c.handle}</p>
          </div>
        </div>
      );
    },
  }),

  // Platforms
  columnHelper.accessor('platforms', {
    header: 'Platforms',
    size: 100,
    enableSorting: false,
    cell: ({ getValue }) => (
      <div className="flex items-center gap-1.5">
        {(getValue() || []).map(p => (
          <PlatformIcon key={p} platform={p} />
        ))}
      </div>
    ),
  }),

  // Followers
  columnHelper.accessor('followersTotal', {
    header: 'Followers',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-sm text-zinc-300 tabular-nums">{formatFollowers(getValue())}</span>
    ),
  }),

  // Engagement
  columnHelper.accessor('engagementRate', {
    header: 'Eng. Rate',
    size: 90,
    cell: ({ getValue }) => {
      const rate = getValue();
      const color = rate >= 5 ? 'text-emerald-400' : rate >= 2 ? 'text-zinc-300' : 'text-zinc-500';
      return <span className={`text-sm tabular-nums font-medium ${color}`}>{formatEngagement(rate)}</span>;
    },
  }),

  // Campaigns
  columnHelper.accessor('activeCampaigns', {
    header: 'Campaigns',
    size: 90,
    cell: ({ row }) => (
      <span className="text-sm text-zinc-300 tabular-nums">
        <span className="text-white font-medium">{row.original.activeCampaigns}</span>
        <span className="text-zinc-600"> / {row.original.totalCampaigns}</span>
      </span>
    ),
  }),

  // Lifetime Earnings
  columnHelper.accessor('lifetimeEarnings', {
    header: 'Earnings',
    size: 110,
    cell: ({ getValue }) => (
      <span className="text-sm text-zinc-300 tabular-nums">{formatCurrency(getValue())}</span>
    ),
  }),

  // Pending Payout
  columnHelper.accessor('pendingPayout', {
    header: 'Pending',
    size: 100,
    cell: ({ getValue }) => {
      const v = getValue();
      return (
        <span className={`text-sm tabular-nums ${v > 0 ? 'text-amber-400' : 'text-zinc-600'}`}>
          {v > 0 ? formatCurrency(v) : '—'}
        </span>
      );
    },
  }),

  // Tier
  columnHelper.accessor('tier', {
    header: 'Tier',
    size: 80,
    cell: ({ getValue }) => {
      const tier = getValue();
      const meta = TIER_META[tier] || { label: tier, className: 'bg-zinc-800 text-zinc-400 border border-zinc-700' };
      return (
        <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
          {meta.label}
        </span>
      );
    },
  }),

  // Status
  columnHelper.accessor('status', {
    header: 'Status',
    size: 90,
    cell: ({ getValue }) => {
      const status = getValue();
      const meta = STATUS_META[status] || STATUS_META.inactive;
      return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
          {meta.label}
        </span>
      );
    },
  }),

  // Last Active
  columnHelper.accessor('lastActiveAt', {
    header: 'Last Active',
    size: 100,
    cell: ({ getValue }) => (
      <span className="text-xs text-zinc-500">{formatRelativeTime(getValue())}</span>
    ),
  }),

  // Actions
  columnHelper.display({
    id: 'actions',
    size: 50,
    header: '',
    cell: ({ row }) => (
      <RowActions creator={row.original} onAction={onRowAction} />
    ),
    enableSorting: false,
  }),
];

// ─── Main Table Component ──────────────────────────────────────────────────────
const CreatorsTable = ({
  data = [],
  isLoading,
  isError,
  pagination,
  onPageChange,
  sorting,
  onSortChange,
  rowSelection,
  onRowSelectionChange,
  onRowClick,
  onRowAction,
  onRetry,
  onResetFilters,
  activeFilterCount = 0,
}) => {
  const handleRowAction = useCallback((action, creator) => {
    if (action === 'view') onRowClick?.(creator);
    else onRowAction?.(action, creator);
  }, [onRowClick, onRowAction]);

  const columns = useMemo(
    () => buildColumns(handleRowAction, onRowClick),
    [handleRowAction, onRowClick]
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortChange?.(newSorting);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: pagination?.totalPages ?? -1,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  return (
    <div className="border border-zinc-800/60 rounded-xl bg-zinc-900/30 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-zinc-800/60">
                {headerGroup.headers.map(header => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={`py-2.5 px-4 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-900/60 whitespace-nowrap first:rounded-tl-xl last:rounded-tr-xl ${
                        canSort ? 'cursor-pointer select-none group hover:text-zinc-300 transition-colors' : ''
                      }`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && <SortIcon sorted={sorted} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading && <TableSkeleton rows={10} />}
            {isError && !isLoading && <ErrorState onRetry={onRetry} />}
            {!isLoading && !isError && data.length === 0 && (
              <EmptyState hasFilters={activeFilterCount > 0} onReset={onResetFilters} />
            )}
            {!isLoading && !isError && table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`group border-b border-zinc-800/30 transition-colors cursor-pointer ${
                  row.getIsSelected()
                    ? 'bg-zinc-800/40'
                    : 'hover:bg-zinc-800/20'
                }`}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="py-2.5 px-4 whitespace-nowrap"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/40">
          <p className="text-xs text-zinc-500 tabular-nums">
            Showing{' '}
            <span className="text-zinc-300 font-medium">
              {((pagination.page - 1) * pagination.pageSize) + 1}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            of <span className="text-zinc-300 font-medium">{pagination.total}</span> creators
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="h-7 px-2.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="px-2 text-xs text-zinc-500 tabular-nums">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="h-7 px-2.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(CreatorsTable);
