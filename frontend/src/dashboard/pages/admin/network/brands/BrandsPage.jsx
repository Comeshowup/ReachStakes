import React, { useState, useCallback, useMemo } from 'react';
import BrandsHeader from './components/BrandsHeader';
import BrandsFilters from './components/BrandsFilters';
import BrandsTable from './components/BrandsTable';
import BrandDrawer from './components/BrandDrawer';
import { useBrandFilters } from './hooks/useBrandFilters';

/**
 * BrandsPage — Production-grade brands operational dashboard.
 * Route: /admin/network/brands
 */
export default function BrandsPage() {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const {
    searchInput,
    setSearchInput,
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    activeCount,
    queryFilters,
  } = useBrandFilters();

  const handleViewBrand = useCallback((brand) => {
    setSelectedBrand(brand);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedBrand(null);
  }, []);

  const handleSelectId = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Passed into BrandsTable so pagination buttons can call setPage
  const tableQueryFilters = useMemo(() => ({
    ...queryFilters,
    _setPage: setPage,
  }), [queryFilters, setPage]);

  return (
    <div className="space-y-5">
      {/* KPI header strip + actions */}
      <BrandsHeader />

      {/* Filter bar */}
      <BrandsFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeCount={activeCount}
      />

      {/* Core table */}
      <BrandsTable
        queryFilters={tableQueryFilters}
        onViewBrand={handleViewBrand}
        selected={selectedIds}
        onSelect={handleSelectId}
        onSelectAll={() => {}}
        activeCount={activeCount}
        onReset={resetFilters}
      />

      {/* Right-side detail drawer */}
      <BrandDrawer brand={selectedBrand} onClose={handleCloseDrawer} />
    </div>
  );
}
