// Barrel export for the Submissions feature module

// Main orchestrator
export { default as SubmissionsModule } from './SubmissionsModule.jsx';

// Components
export { default as SubmissionStatusBadge } from './components/SubmissionStatusBadge.jsx';
export { default as SubmissionCard } from './components/SubmissionCard.jsx';
export { default as SubmissionList } from './components/SubmissionList.jsx';
export { default as SubmissionEmptyState } from './components/SubmissionEmptyState.jsx';
export { default as SubmissionFormModal } from './components/SubmissionFormModal.jsx';
export { default as SubmissionDetailDrawer } from './components/SubmissionDetailDrawer.jsx';
export { default as SubmissionTimeline } from './components/SubmissionTimeline.jsx';
export { default as SubmissionComments } from './components/SubmissionComments.jsx';

// Hooks
export {
  useSubmissions,
  useCreateSubmission,
  useUpdateSubmission,
  useComments,
  useCreateComment,
  submissionKeys,
} from './hooks/useSubmissions.js';

// Types / configs
export {
  SUBMISSION_STATUS,
  STATUS_CONFIG,
  PLATFORM_CONFIG,
  CONTENT_TYPE_LABELS,
  PLATFORMS,
  CONTENT_TYPES,
  STATUS_FLOW,
} from './types/submissions.types.js';
