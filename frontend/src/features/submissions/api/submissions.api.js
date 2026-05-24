/**
 * @fileoverview Real API layer for Submissions.
 *
 * Replaces the localStorage mock with real axios calls to the backend.
 * The campaignId passed from the frontend = collaborationId in the backend.
 */

import axios from 'axios';
import { SUBMISSION_STATUS } from '../types/submissions.types.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

// ─── Normalise backend collab → frontend submission shape ─────────────────────

function normaliseSubmission(collab) {
  const contentUrl = collab.submissionUrl || collab.link || collab.contentUrl || '';
  const updatedAt = collab.updatedAt || collab.date || collab.submittedAt || new Date().toISOString();
  const createdAt = collab.createdAt || updatedAt;
  const submittedAt = collab.submittedAt || (contentUrl ? updatedAt : null);

  return {
    // Core IDs
    id: String(collab.id),
    campaignId: String(collab.collaborationId || collab.id),

    // Content
    platform: normalisePlatform(collab.submissionPlatform || collab.platform),
    type: collab.type || 'video',
    contentUrl,
    caption: collab.caption || collab.submissionTitle || collab.title || '',
    notes: collab.submissionNotes || collab.notes || '',
    revisionFeedback: collab.revisionFeedback || collab.feedbackNotes || collab.feedback || '',

    // Status — map backend CollabStatus to frontend SUBMISSION_STATUS keys
    status: mapStatus(collab.status, { hasSubmission: Boolean(contentUrl) }),

    // Versioning (backend does not track versions yet — default 1)
    version: collab.version || 1,
    parentSubmissionId: collab.parentSubmissionId || null,

    // Meta
    createdAt,
    updatedAt,
    submittedAt,

    // Stats
    stats: collab.stats || collab.videoStats || {},
    viewsCount: collab.viewsCount || 0,
    likesCount: collab.likesCount || 0,
    sharesCount: collab.sharesCount || 0,
    engagementRate: collab.engagementRate || 0,
  };
}

function normaliseStatusKey(status) {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function normalisePlatform(platform) {
  const key = String(platform || '').trim().toLowerCase();
  if (key.includes('instagram')) return 'instagram';
  if (key.includes('youtube')) return 'youtube';
  if (key.includes('tiktok') || key.includes('tik_tok')) return 'tiktok';
  return key || 'youtube';
}

function mapStatus(backendStatus, { hasSubmission = false } = {}) {
  const statusKey = normaliseStatusKey(backendStatus);
  const STATUS_MAP = {
    applied: SUBMISSION_STATUS.DRAFT,
    invited: SUBMISSION_STATUS.DRAFT,
    accepted: SUBMISSION_STATUS.DRAFT,
    in_progress: hasSubmission ? SUBMISSION_STATUS.SUBMITTED : SUBMISSION_STATUS.DRAFT,
    under_review: SUBMISSION_STATUS.UNDER_REVIEW,
    submitted: SUBMISSION_STATUS.SUBMITTED,
    revision: SUBMISSION_STATUS.CHANGES_REQUESTED,
    revision_requested: SUBMISSION_STATUS.CHANGES_REQUESTED,
    changes_requested: SUBMISSION_STATUS.CHANGES_REQUESTED,
    approved: SUBMISSION_STATUS.APPROVED,
    paid: SUBMISSION_STATUS.APPROVED,
    completed: SUBMISSION_STATUS.APPROVED,
    rejected: SUBMISSION_STATUS.REJECTED,
  };

  return STATUS_MAP[statusKey] || (hasSubmission ? SUBMISSION_STATUS.SUBMITTED : SUBMISSION_STATUS.DRAFT);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all submissions for a campaign (= one collaboration record for this creator).
 * campaignId here is actually the collaborationId.
 *
 * @param {string} campaignId   The collaboration ID (from useParams)
 */
export async function getSubmissions(campaignId) {
  const res = await axios.get(`${API_BASE}/collaborations/my-submissions`, {
    headers: authHeaders(),
  });

  const all = res.data || [];

  // A campaignId might be a collaborationId or a real campaignId — match both
  const filtered = all.filter((c) => {
    return (
      String(c.id) === String(campaignId) ||
      String(c.campaignId) === String(campaignId)
    );
  });

  // For the workspace, we expose ONE collab record as a submission.
  // If there is a submissionUrl, it's a proper submission; otherwise return empty.
  return filtered.filter((c) => c.link || c.submissionUrl).map(normaliseSubmission);
}

/**
 * Create a new submission by calling the backend submit endpoint.
 *
 * @param {{ campaignId: string; platform: string; type: string; contentUrl: string; caption?: string; notes?: string; status: string; parentSubmissionId?: string | null; }} data
 */
export async function createSubmission(data) {
  // The campaignId in this module = collaborationId on the backend
  const collaborationId = data.campaignId;

  const platformMap = { instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok' };
  const platform = platformMap[data.platform] || data.platform;

  // Extract YouTube video ID
  let videoId = null;
  if (data.platform === 'youtube' && data.contentUrl) {
    const match = data.contentUrl.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (match) videoId = match[1];
  }

  const res = await axios.post(
    `${API_BASE}/collaborations/${collaborationId}/submit`,
    {
      submissionUrl: data.contentUrl,
      platform,
      videoId,
      title: data.caption ? data.caption.slice(0, 100) : undefined,
      notes: data.notes,
    },
    { headers: authHeaders() }
  );

  return normaliseSubmission({ ...res.data, collaborationId });
}

/**
 * Update a submission — currently mapped to re-submit (call backend submit again with new URL).
 */
export async function updateSubmission(submissionId, campaignId, updates) {
  // If there's a new contentUrl, re-submit
  if (updates.contentUrl) {
    const data = await createSubmission({
      campaignId,
      platform: updates.platform,
      type: updates.type,
      contentUrl: updates.contentUrl,
      caption: updates.caption,
      notes: updates.notes,
      status: updates.status,
    });
    return data;
  }

  // Otherwise just refresh and return the current collab data
  const res = await axios.get(`${API_BASE}/collaborations/my-submissions`, {
    headers: authHeaders(),
  });
  const collab = (res.data || []).find((c) => String(c.id) === String(campaignId));
  return collab ? normaliseSubmission(collab) : null;
}

/**
 * Fetch comments for a specific submission (collaboration).
 *
 * @param {string} submissionId
 */
export async function getComments(submissionId) {
  try {
    const res = await axios.get(
      `${API_BASE}/collaborations/${submissionId}/messages`,
      { headers: authHeaders() }
    );
    const messages = res.data || [];
    // Map campaign messages → comment shape
    return messages.map((m) => ({
      id: String(m.id),
      submissionId: String(submissionId),
      userId: String(m.senderId || m.userId),
      role: m.senderRole === 'brand' ? 'brand' : 'creator',
      message: m.content || m.message || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Post a new comment on a submission.
 *
 * @param {{ submissionId: string; userId: string; role: 'brand' | 'creator'; message: string; }} data
 */
export async function createComment(data) {
  try {
    const res = await axios.post(
      `${API_BASE}/collaborations/${data.submissionId}/messages`,
      { content: data.message },
      { headers: authHeaders() }
    );
    const m = res.data;
    return {
      id: String(m.id),
      submissionId: String(data.submissionId),
      userId: String(m.senderId || data.userId),
      role: data.role,
      message: m.content || data.message,
      createdAt: m.createdAt || new Date().toISOString(),
    };
  } catch {
    // Fallback: return the comment locally so UI doesn't break
    return {
      id: `local-${Date.now()}`,
      submissionId: data.submissionId,
      userId: data.userId,
      role: data.role,
      message: data.message,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Check which social accounts the current creator has connected.
 *
 * @param {number|string} userId
 * @returns {Promise<{ platform: string; username: string }[]>}
 */
export async function getConnectedSocialAccounts(userId) {
  try {
    const res = await axios.get(`${API_BASE}/social/${userId}`, {
      headers: authHeaders(),
    });
    return res.data?.data || res.data || [];
  } catch {
    return [];
  }
}
