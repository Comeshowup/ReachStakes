/**
 * Deliverable API Service — frontend HTTP client for the deliverable system.
 */
import api from './axios';

const deliverableApi = {
    // ── CRUD ──────────────────────────────────────────────────────────
    create: (collaborationId, deliverables) =>
        api.post('/deliverables', { collaborationId, deliverables }),

    getByCollaboration: (collabId) =>
        api.get(`/deliverables/collaboration/${collabId}`),

    getById: (id) =>
        api.get(`/deliverables/${id}`),

    update: (id, data) =>
        api.patch(`/deliverables/${id}`, data),

    remove: (id) =>
        api.delete(`/deliverables/${id}`),

    // ── Workflow ──────────────────────────────────────────────────────
    updateStatus: (id, status) =>
        api.patch(`/deliverables/${id}/status`, { status }),

    submit: (id, { type, textContent, fileUrl, externalUrl, notes }) =>
        api.post(`/deliverables/${id}/submit`, { type, textContent, fileUrl, externalUrl, notes }),

    review: (id, { action, feedback, submissionId }) =>
        api.post(`/deliverables/${id}/review`, { action, feedback, submissionId }),

    getSubmissions: (id) =>
        api.get(`/deliverables/${id}/submissions`),

    getTimeline: (id) =>
        api.get(`/deliverables/${id}/timeline`),

    updateChecklist: (id, checklistState) =>
        api.patch(`/deliverables/${id}/checklist`, { checklistState }),

    validate: (id, submissionData) =>
        api.post(`/deliverables/${id}/validate`, submissionData),

    // ── Payment ──────────────────────────────────────────────────────
    getPaymentSummary: (collabId) =>
        api.get(`/deliverables/collaboration/${collabId}/payment`),
};

export default deliverableApi;
