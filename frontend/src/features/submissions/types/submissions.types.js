/**
 * @fileoverview Submission types, enums, and Zod validation schemas.
 * JSDoc-typed for full IDE support without TypeScript compilation.
 */

// ─── Status Enum ──────────────────────────────────────────────────────────────

/** @typedef {'draft' | 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected'} SubmissionStatus */

export const SUBMISSION_STATUS = /** @type {const} */ ({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

/** @typedef {'instagram' | 'youtube' | 'tiktok'} Platform */
export const PLATFORMS = /** @type {const} */ ({
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
});

/** @typedef {'post' | 'reel' | 'video' | 'story'} ContentType */
export const CONTENT_TYPES = /** @type {const} */ ({
  POST: 'post',
  REEL: 'reel',
  VIDEO: 'video',
  STORY: 'story',
});

// ─── Core Types ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Submission
 * @property {string} id
 * @property {string} campaignId
 * @property {Platform} platform
 * @property {ContentType} type
 * @property {string} contentUrl
 * @property {string} [caption]
 * @property {string} [notes]
 * @property {SubmissionStatus} status
 * @property {number} version
 * @property {string} [parentSubmissionId]
 * @property {string} createdAt  - ISO timestamp
 * @property {string} updatedAt  - ISO timestamp
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} submissionId
 * @property {string} userId
 * @property {'brand' | 'creator'} role
 * @property {string} message
 * @property {string} createdAt  - ISO timestamp
 */

/**
 * @typedef {Object} SubmissionFormValues
 * @property {Platform} platform
 * @property {ContentType} type
 * @property {string} contentUrl
 * @property {string} [caption]
 * @property {string} [notes]
 */

// ─── Status Config (for badges, colors, labels) ───────────────────────────────

/** @type {Record<SubmissionStatus, { label: string; color: string; bg: string; border: string; dot: string; }>} */
export const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
  submitted: {
    label: 'Submitted',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  changes_requested: {
    label: 'Changes Requested',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot: 'bg-orange-500',
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
};

/** Ordered status flow for the timeline progression */
export const STATUS_FLOW = [
  'submitted',
  'under_review',
  'changes_requested',
  'approved',
];

// ─── Platform Config ──────────────────────────────────────────────────────────

/** @type {Record<Platform, { label: string; color: string; gradientFrom: string; gradientTo: string; }>} */
export const PLATFORM_CONFIG = {
  instagram: {
    label: 'Instagram',
    color: 'text-pink-400',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-pink-600',
  },
  youtube: {
    label: 'YouTube',
    color: 'text-red-400',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-red-500',
  },
  tiktok: {
    label: 'TikTok',
    color: 'text-cyan-400',
    gradientFrom: 'from-slate-800',
    gradientTo: 'to-slate-700',
  },
};

/** @type {Record<ContentType, string>} */
export const CONTENT_TYPE_LABELS = {
  post: 'Post',
  reel: 'Reel',
  video: 'Video',
  story: 'Story',
};
