/**
 * @fileoverview React Query hooks for the Submissions module.
 *
 * All mutations include:
 *  - Optimistic updates for instant UI feedback
 *  - Rollback on error
 *  - Toast notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getSubmissions,
  createSubmission,
  updateSubmission,
  getComments,
  createComment,
} from '../api/submissions.api.js';

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const submissionKeys = {
  all: ['submissions'],
  byCampaign: (campaignId) => ['submissions', campaignId],
  comments: (submissionId) => ['comments', submissionId],
};

// ─── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetch all submissions for a campaign.
 *
 * @param {string} campaignId
 */
export function useSubmissions(campaignId) {
  return useQuery({
    queryKey: submissionKeys.byCampaign(campaignId),
    queryFn: () => getSubmissions(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 30_000,
  });
}

/**
 * Fetch comments for a specific submission.
 *
 * @param {string | null} submissionId
 */
export function useComments(submissionId) {
  return useQuery({
    queryKey: submissionKeys.comments(submissionId),
    queryFn: () => getComments(submissionId),
    enabled: Boolean(submissionId),
    staleTime: 10_000,
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Create a new submission (draft or submitted).
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubmission,
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: submissionKeys.byCampaign(newData.campaignId) });

      // Snapshot the previous value
      const previous = queryClient.getQueryData(submissionKeys.byCampaign(newData.campaignId));

      // Optimistically add new submission
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        ...newData,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData(submissionKeys.byCampaign(newData.campaignId), (old) =>
        [optimistic, ...(old || [])]
      );

      return { previous, campaignId: newData.campaignId };
    },
    onError: (err, _vars, context) => {
      // Rollback
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          submissionKeys.byCampaign(context.campaignId),
          context.previous
        );
      }
      // Surface the backend error message directly so the user knows exactly what failed
      const backendMsg =
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create submission. Please try again.';
      toast.error(backendMsg, { duration: 6000 });
    },
    onSuccess: (submission, vars) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.byCampaign(vars.campaignId) });
      if (submission.status === 'draft') {
        toast.success('Draft saved successfully');
      } else {
        toast.success('Submission sent for brand review! 🎉');
      }
    },
  });
}

/**
 * Update a submission (status, content, resubmit).
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, campaignId, updates }) =>
      updateSubmission(submissionId, campaignId, updates),
    onMutate: async ({ submissionId, campaignId, updates }) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.byCampaign(campaignId) });
      const previous = queryClient.getQueryData(submissionKeys.byCampaign(campaignId));

      queryClient.setQueryData(submissionKeys.byCampaign(campaignId), (old) =>
        (old || []).map((s) =>
          s.id === submissionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        )
      );

      return { previous, campaignId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          submissionKeys.byCampaign(context.campaignId),
          context.previous
        );
      }
      toast.error('Update failed. Please try again.');
    },
    onSuccess: (_data, { updates }) => {
      const actionLabel = updates.status === 'submitted' ? 'Resubmitted for review!' : 'Updated successfully';
      toast.success(actionLabel);
    },
  });
}

/**
 * Post a comment on a submission.
 * Includes optimistic update for instant feedback.
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: submissionKeys.comments(newComment.submissionId) });
      const previous = queryClient.getQueryData(submissionKeys.comments(newComment.submissionId));

      const optimistic = {
        id: `optimistic-comment-${Date.now()}`,
        ...newComment,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(submissionKeys.comments(newComment.submissionId), (old) =>
        [...(old || []), optimistic]
      );

      return { previous, submissionId: newComment.submissionId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          submissionKeys.comments(context.submissionId),
          context.previous
        );
      }
      toast.error('Failed to send comment.');
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.comments(vars.submissionId) });
    },
  });
}
