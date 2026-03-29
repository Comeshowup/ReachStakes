/**
 * useCreators.js — React Query hooks for the Creators module.
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchCreators,
  fetchCreatorById,
  fetchCreatorStats,
  fetchCreatorCampaigns,
  fetchCreatorPayouts,
  fetchCreatorActivity,
} from '../api/creatorsApi';

// Query keys factory
export const creatorsKeys = {
  all: ['admin', 'creators'],
  list: (params) => ['admin', 'creators', 'list', params],
  detail: (id) => ['admin', 'creators', 'detail', id],
  stats: () => ['admin', 'creators', 'stats'],
  campaigns: (id) => ['admin', 'creators', id, 'campaigns'],
  payouts: (id) => ['admin', 'creators', id, 'payouts'],
  activity: (id) => ['admin', 'creators', id, 'activity'],
};

/** Paginated creator list */
export function useCreatorList(params) {
  return useQuery({
    queryKey: creatorsKeys.list(params),
    queryFn: () => fetchCreators(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

/** Creator stats for KPI strip */
export function useCreatorStats() {
  return useQuery({
    queryKey: creatorsKeys.stats(),
    queryFn: fetchCreatorStats,
    staleTime: 60_000,
  });
}

/** Single creator detail */
export function useCreatorDetail(id) {
  return useQuery({
    queryKey: creatorsKeys.detail(id),
    queryFn: () => fetchCreatorById(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Creator campaigns for drawer */
export function useCreatorCampaigns(id) {
  return useQuery({
    queryKey: creatorsKeys.campaigns(id),
    queryFn: () => fetchCreatorCampaigns(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Creator payouts for drawer */
export function useCreatorPayouts(id) {
  return useQuery({
    queryKey: creatorsKeys.payouts(id),
    queryFn: () => fetchCreatorPayouts(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/** Creator activity timeline for drawer */
export function useCreatorActivity(id) {
  return useQuery({
    queryKey: creatorsKeys.activity(id),
    queryFn: () => fetchCreatorActivity(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}
