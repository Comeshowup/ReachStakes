import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';

// ── Constants ────────────────────────────────────────────────────────────────

export const FLAG_POOL = ['nsfw', 'copyright', 'brand-mismatch', 'low-quality', 'ai-risk', 'manual-escalation'];

// ── Real API calls ───────────────────────────────────────────────────────────

/**
 * Fetch approvals for a specific campaign from the real backend.
 * Maps backend CollabStatus → normalized frontend status:
 *   Under_Review → pending
 *   Approved/Paid → approved
 *   Rejected      → rejected
 */
export async function fetchApprovals(filters = {}) {
  const { campaignId, ...rest } = filters;

  if (!campaignId) {
    // No campaign selected yet — return empty
    return { items: [], kpi: { pending: 0, approved: 0, rejected: 0, total: 0, avgReviewTime: '—' } };
  }

  const params = {};
  if (rest.search)      params.search  = rest.search;
  if (rest.status && rest.status !== 'all') params.status = mapStatusToBackend(rest.status);
  if (rest.sortBy)      params.sortBy  = rest.sortBy;
  if (rest.sortDir)     params.sortDir = rest.sortDir;

  const { data } = await api.get(`/admin/campaigns/${campaignId}/approvals`, { params });
  return data;
}

function mapStatusToBackend(frontendStatus) {
  if (frontendStatus === 'pending')  return 'Under_Review';
  if (frontendStatus === 'approved') return 'Approved';
  if (frontendStatus === 'rejected') return 'Rejected';
  return frontendStatus;
}

export async function approveItem(campaignId, collabId, note = '') {
  const { data } = await api.patch(
    `/admin/campaigns/${campaignId}/approvals/${collabId}/approve`,
    { note }
  );
  return data;
}

export async function rejectItem(campaignId, collabId, reason, note = '') {
  const { data } = await api.patch(
    `/admin/campaigns/${campaignId}/approvals/${collabId}/reject`,
    { reason, note }
  );
  return data;
}

export async function requestChanges(campaignId, collabId, note) {
  const { data } = await api.patch(
    `/admin/campaigns/${campaignId}/approvals/${collabId}/changes`,
    { note }
  );
  return data;
}

export async function batchAction(campaignId, ids, action) {
  // Serial batch — no bulk endpoint, so call one at a time (fast enough for typical batches)
  await Promise.all(
    ids.map(id => {
      const collabId = id; // ids are already collab IDs
      if (action === 'approved') return approveItem(campaignId, collabId);
      if (action === 'rejected') return rejectItem(campaignId, collabId, 'Bulk rejection');
      return Promise.resolve();
    })
  );
  return { success: true, count: ids.length };
}

// ── React Query Hooks ────────────────────────────────────────────────────────

export const APPROVALS_KEY = 'campaign-approvals';

export function useApprovals(filters) {
  return useQuery({
    queryKey: [APPROVALS_KEY, filters],
    queryFn: () => fetchApprovals(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    enabled: !!filters?.campaignId,
  });
}

export function useApproveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, id, note }) => approveItem(campaignId, id, note),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            it.id === id ? { ...it, status: 'approved' } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useRejectItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, id, reason, note }) => rejectItem(campaignId, id, reason, note),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            it.id === id ? { ...it, status: 'rejected' } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, id, note }) => requestChanges(campaignId, id, note),
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useBatchAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ campaignId, ids, action }) => batchAction(campaignId, ids, action),
    onMutate: async ({ ids, action }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      const idSet = new Set(ids);
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            idSet.has(it.id) ? { ...it, status: action === 'approved' ? 'approved' : 'rejected' } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}
