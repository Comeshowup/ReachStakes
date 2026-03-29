import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCampaigns,
  fetchCampaignById,
  updateCampaignStatus,
  fetchCampaignCreators,
  inviteCreators,
  updateCreatorInviteStatus,
  fetchAvailableCreators,
} from '../api/campaignsApi.js';

// ─── Query Keys ──────────────────────────────────────────────────

export const campaignKeys = {
  all: ['admin', 'campaigns'],
  lists: (filters) => ['admin', 'campaigns', 'list', filters],
  detail: (id) => ['admin', 'campaigns', id],
  creators: (campaignId, filters) => ['admin', 'campaigns', campaignId, 'creators', filters],
  availableCreators: (filters) => ['admin', 'creators', 'available', filters],
};

// ─── Campaigns List ───────────────────────────────────────────────

export function useCampaigns({ page = 1, search = '', status = 'all' } = {}) {
  return useQuery({
    queryKey: campaignKeys.lists({ page, search, status }),
    queryFn: () => fetchCampaigns({ page, pageSize: 20, search, status }),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ─── Campaign Detail ──────────────────────────────────────────────

export function useCampaign(id) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => fetchCampaignById(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

// ─── Campaign Status Update ───────────────────────────────────────

export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCampaignStatus,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: campaignKeys.all });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) });
    },
  });
}

// ─── Campaign Creators ────────────────────────────────────────────

export function useCampaignCreators({ campaignId, page = 1, status = '' } = {}) {
  return useQuery({
    queryKey: campaignKeys.creators(campaignId, { page, status }),
    queryFn: () => fetchCampaignCreators({ campaignId, page, status }),
    staleTime: 30_000,
    enabled: !!campaignId,
  });
}

// ─── Invite Creators ──────────────────────────────────────────────

export function useInviteCreators(campaignId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => inviteCreators({ campaignId, payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.creators(campaignId) });
      qc.invalidateQueries({ queryKey: campaignKeys.detail(campaignId) });
    },
  });
}

// ─── Creator Invite Action (resend/cancel) ────────────────────────

export function useCreatorInviteAction(campaignId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collaborationId, action }) =>
      updateCreatorInviteStatus({ campaignId, collaborationId, action }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.creators(campaignId) });
    },
  });
}

// ─── Available Creators Search ────────────────────────────────────

export function useAvailableCreators(filters = {}) {
  return useQuery({
    queryKey: campaignKeys.availableCreators(filters),
    queryFn: () => fetchAvailableCreators(filters),
    staleTime: 60_000,
    enabled: true,
  });
}
