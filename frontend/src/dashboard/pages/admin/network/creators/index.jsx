/**
 * index.jsx — Creators Management Page
 *
 * Route: /admin/network/creators
 * Layout hierarchy:
 *   CreatorsPage
 *    ├── Header (sticky) — page title + search + filters + actions
 *    ├── KPI Strip
 *    ├── Creators Table
 *    ├── Bulk Action Bar (conditional)
 *    └── Creator Drawer (right side)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Users } from 'lucide-react';
import CreatorKPI from './components/CreatorKPI';
import CreatorFilters from './components/CreatorFilters';
import CreatorsTable from './components/CreatorsTable';
import BulkActionBar from './components/BulkActionBar';
import CreatorDrawer from './components/CreatorDrawer';
import { useCreatorList } from './hooks/useCreators';
import { useCreatorsFilters } from './hooks/useCreatorsFilters';

const CreatorsPage = () => {
  // ── Filter state ─────────────────────────────────────────────────────────────
  const {
    filters,
    queryParams,
    searchInput,
    setSearchInput,
    toggleMultiFilter,
    setFilter,
    setPage,
    setSort,
    resetFilters,
    activeFilterCount,
  } = useCreatorsFilters();

  // ── Table state ───────────────────────────────────────────────────────────────
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([]);

  // ── Drawer state ──────────────────────────────────────────────────────────────
  const [activeCreator, setActiveCreator] = useState(null);

  // ── React Query ───────────────────────────────────────────────────────────────
  const sortBy = sorting[0]?.id;
  const sortDir = sorting[0]?.desc ? 'desc' : 'asc';

  const { data, isLoading, isError, refetch } = useCreatorList({
    ...queryParams,
    ...(sortBy ? { sortBy, sortDir } : {}),
  });

  const creators = data?.data || [];
  const pagination = data?.pagination;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleRowClick = useCallback((creator) => {
    setActiveCreator(creator);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setActiveCreator(null);
  }, []);

  const handleSortChange = useCallback((newSorting) => {
    setSorting(newSorting);
  }, []);

  const handleBulkAction = useCallback((action) => {
    const selectedIds = Object.keys(rowSelection);
    if (action === 'export') {
      // Stub: export selected rows
      const selected = creators.filter(c => selectedIds.includes(c.id));
      const csv = [
        'Name,Handle,Tier,Status,Followers,Earnings',
        ...selected.map(c => `"${c.name}",${c.handle},${c.tier},${c.status},${c.followersTotal},${c.lifetimeEarnings}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'creators.csv'; a.click();
      URL.revokeObjectURL(url);
    }
    // Other actions: campaign, tier, suspend — stub
    console.log(`Bulk action: ${action}`, selectedIds);
  }, [rowSelection, creators]);

  const handleExportAll = useCallback(() => {
    if (!creators.length) return;
    const csv = [
      'Name,Handle,Tier,Status,Followers,Earnings',
      ...creators.map(c => `"${c.name}",${c.handle},${c.tier},${c.status},${c.followersTotal},${c.lifetimeEarnings}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'creators-export.csv'; a.click();
    URL.revokeObjectURL(url);
  }, [creators]);

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-white tracking-tight">Creators</h1>
          {!isLoading && pagination?.total != null && (
            <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full tabular-nums">
              {pagination.total}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-500 hidden md:block">
          Manage and monitor all creators on the platform
        </p>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <CreatorKPI />

      {/* ── Filters bar ─────────────────────────────────────────────────────── */}
      <CreatorFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filters={filters}
        toggleMultiFilter={toggleMultiFilter}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
        onExport={handleExportAll}
        onInvite={() => console.log('Invite creator modal TBD')}
      />

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <CreatorsTable
        data={creators}
        isLoading={isLoading}
        isError={isError}
        pagination={pagination}
        onPageChange={setPage}
        sorting={sorting}
        onSortChange={handleSortChange}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowClick={handleRowClick}
        onRowAction={(action, creator) => console.log('Row action:', action, creator.id)}
        onRetry={refetch}
        onResetFilters={resetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* ── Bulk Action Bar ──────────────────────────────────────────────────── */}
      <BulkActionBar
        selectedCount={selectedCount}
        onClear={() => setRowSelection({})}
        onAction={handleBulkAction}
      />

      {/* ── Creator Drawer ───────────────────────────────────────────────────── */}
      <CreatorDrawer
        creator={activeCreator}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default CreatorsPage;
