/**
 * @fileoverview Main Submissions feature module.
 *
 * This is the primary entry point rendered inside the CampaignWorkspacePage
 * "Submissions" tab. It orchestrates all sub-components and state.
 */

import React, { useState, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmissions } from './hooks/useSubmissions.js';
import SubmissionList from './components/SubmissionList.jsx';
import SubmissionFormModal from './components/SubmissionFormModal.jsx';
import SubmissionDetailDrawer from './components/SubmissionDetailDrawer.jsx';

/**
 * Submissions Module
 *
 * @param {{
 *   campaignId: string;
 *   campaign?: { status?: string; }
 * }} props
 */
const SubmissionsModule = ({ campaignId, campaign }) => {
  const { data: submissions = [], isLoading, refetch } = useSubmissions(campaignId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [resubmittingFrom, setResubmittingFrom] = useState(null);

  // Drawer state
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleNewSubmission = useCallback(() => {
    setEditingSubmission(null);
    setResubmittingFrom(null);
    setModalOpen(true);
  }, []);

  const handleEditSubmission = useCallback((submission) => {
    setEditingSubmission(submission);
    setResubmittingFrom(null);
    setModalOpen(true);
  }, []);

  const handleResubmit = useCallback((submission) => {
    setEditingSubmission(null);
    setResubmittingFrom(submission);
    setModalOpen(true);
  }, []);

  const handleView = useCallback((submission) => {
    setViewingSubmission(submission);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingSubmission(null);
    setResubmittingFrom(null);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setViewingSubmission(null);
  }, []);

  const handleCopyLink = useCallback(async (sub) => {
    try {
      await navigator.clipboard.writeText(sub.contentUrl);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Content Submissions</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {isLoading
              ? 'Loading…'
              : submissions.length === 0
              ? 'No submissions yet'
              : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-600 hover:text-slate-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* New Submission CTA */}
          <button
            id="new-submission-btn"
            onClick={handleNewSubmission}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            New Submission
          </button>
        </div>
      </div>

      {/* Submission List / Empty State */}
      <SubmissionList
        submissions={submissions}
        isLoading={isLoading}
        onNewSubmission={handleNewSubmission}
        onView={handleView}
        onEdit={handleEditSubmission}
        onResubmit={handleResubmit}
      />

      {/* Form Modal */}
      <SubmissionFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        campaignId={campaignId}
        editingSubmission={editingSubmission}
        resubmittingFrom={resubmittingFrom}
      />

      {/* Detail Drawer */}
      <SubmissionDetailDrawer
        submission={viewingSubmission}
        onClose={handleCloseDrawer}
        onEdit={handleEditSubmission}
        onResubmit={handleResubmit}
      />
    </div>
  );
};

export default SubmissionsModule;
