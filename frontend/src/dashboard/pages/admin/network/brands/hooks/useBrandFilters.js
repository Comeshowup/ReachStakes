import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '../../../../../../hooks/useDebounce';

const DEFAULT_FILTERS = {
  status: '',
  industry: '',
  spendRange: '',
  campaignStatus: '',
};

/**
 * Manages all brand filter state with debounced search.
 * Exposes stable reset / setter callbacks and an activeCount.
 */
export function useBrandFilters() {
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  // Debounce search so we don't fire on every keystroke
  const debouncedSearch = useDebounce(searchInput, 300);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchInput('');
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const activeCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== '').length + (searchInput ? 1 : 0);
  }, [filters, searchInput]);

  // Resolve spend range into min/max numbers
  const spendMin = filters.spendRange === '0-10000' ? 0 : filters.spendRange === '10000-50000' ? 10000 : filters.spendRange === '50000-100000' ? 50000 : filters.spendRange === '100000+' ? 100000 : undefined;
  const spendMax = filters.spendRange === '0-10000' ? 10000 : filters.spendRange === '10000-50000' ? 50000 : filters.spendRange === '50000-100000' ? 100000 : undefined;

  const queryFilters = useMemo(() => ({
    page,
    pageSize: 25,
    search: debouncedSearch,
    status: filters.status,
    industry: filters.industry,
    spendMin,
    spendMax,
    campaignStatus: filters.campaignStatus,
  }), [page, debouncedSearch, filters, spendMin, spendMax]);

  return {
    searchInput,
    setSearchInput: handleSearchChange,
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    activeCount,
    queryFilters,
  };
}
