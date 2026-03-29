import { useQuery } from '@tanstack/react-query';
import { fetchBrands, fetchBrandKpis } from '../api/brands.api';

/**
 * Main brands query hook — server-side pagination + all filters.
 * @param {{ page: number, pageSize: number, search: string, status: string, industry: string, spendMin?: number, spendMax?: number, campaignStatus: string }} filters
 */
export function useBrands(filters) {
  const { page = 1, pageSize = 25 } = filters;

  return useQuery({
    queryKey: ['admin', 'brands', filters],
    queryFn: () => fetchBrands(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
}

/**
 * KPI strip query.
 */
export function useBrandKpis() {
  return useQuery({
    queryKey: ['admin', 'brands', 'kpis'],
    queryFn: fetchBrandKpis,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}
