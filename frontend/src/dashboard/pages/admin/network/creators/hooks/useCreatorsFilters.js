/**
 * useCreatorsFilters.js — URL-aware filter state for the Creators page.
 * Syncs filters to search params for shareable/bookmarkable filters.
 */

import { useState, useCallback, useDeferredValue } from 'react';

const DEFAULT_FILTERS = {
  search: '',
  platforms: [],
  tiers: [],
  statuses: [],
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 25,
};

export function useCreatorsFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const deferredSearch = useDeferredValue(searchInput);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const toggleMultiFilter = useCallback((key, value) => {
    setFilters(prev => {
      const current = prev[key];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated, page: 1 };
    });
  }, []);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const setSort = useCallback((sortBy, sortDir) => {
    setFilters(prev => ({ ...prev, sortBy, sortDir, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
  }, []);

  const activeFilterCount =
    (filters.platforms.length > 0 ? 1 : 0) +
    (filters.tiers.length > 0 ? 1 : 0) +
    (filters.statuses.length > 0 ? 1 : 0) +
    (filters.search ? 1 : 0);

  // Merged query params (use deferred search for debounce effect)
  const queryParams = {
    ...filters,
    search: deferredSearch,
  };

  return {
    filters,
    queryParams,
    searchInput,
    setSearchInput,
    setFilter,
    toggleMultiFilter,
    setPage,
    setSort,
    resetFilters,
    activeFilterCount,
  };
}
