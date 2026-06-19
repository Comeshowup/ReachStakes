/**
 * DeliverableController — HTTP handlers for the Deliverable system.
 * All endpoints require authentication via `protect` middleware.
 */
import { DeliverableService } from '../services/deliverable.service.js';
import { prisma } from '../config/db.js';

// ── Authorization helper ─────────────────────────────────────────────────
async function assertAccess(userId, role, deliverableId) {
    const d = await prisma.deliverable.findUnique({
        where: { id: deliverableId },
        include: { collaboration: { select: { creatorId: true, campaign: { select: { brandId: true } } } } },
    });
    if (!d) return { error: 'Deliverable not found', status: 404 };
    const isBrand = d.collaboration.campaign.brandId === userId;
    const isCreator = d.collaboration.creatorId === userId;
    const isAdmin = role === 'admin';
    if (!isBrand && !isCreator && !isAdmin) return { error: 'Not authorized', status: 403 };
    return { deliverable: d, isBrand, isCreator };
}

async function assertCollabAccess(userId, role, collaborationId) {
    const c = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: { campaign: { select: { brandId: true } } },
    });
    if (!c) return { error: 'Collaboration not found', status: 404 };
    const isBrand = c.campaign.brandId === userId;
    const isCreator = c.creatorId === userId;
    const isAdmin = role === 'admin';
    if (!isBrand && !isCreator && !isAdmin) return { error: 'Not authorized', status: 403 };
    return { collaboration: c, isBrand, isCreator };
}

// ── CREATE deliverables for a collaboration ──────────────────────────────
export const createDeliverables = async (req, res) => {
    try {
        const { collaborationId, deliverables } = req.body;
        if (!collaborationId || !deliverables?.length) {
            return res.status(400).json({ status: 'error', message: 'collaborationId and deliverables[] required.' });
        }
        const access = await assertCollabAccess(req.user.id, req.user.role, collaborationId);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        if (!access.isBrand && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Only brands can create deliverables.' });
        }
        const created = await DeliverableService.createDeliverables(collaborationId, deliverables, req.user.id);
        res.status(201).json({ status: 'success', data: created });
    } catch (err) {
        console.error('[DeliverableCtrl] createDeliverables:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET deliverables by collaboration ────────────────────────────────────
export const getDeliverablesByCollaboration = async (req, res) => {
    try {
        const collabId = parseInt(req.params.collabId);
        if (!collabId) return res.status(400).json({ status: 'error', message: 'Invalid collaboration ID.' });
        const access = await assertCollabAccess(req.user.id, req.user.role, collabId);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const data = await DeliverableService.getByCollaboration(collabId);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error('[DeliverableCtrl] getByCollaboration:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET single deliverable ───────────────────────────────────────────────
export const getDeliverable = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const data = await DeliverableService.getById(id);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error('[DeliverableCtrl] getDeliverable:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── UPDATE deliverable ───────────────────────────────────────────────────
export const updateDeliverable = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        if (!access.isBrand && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Only brands can update deliverable config.' });
        }
        const updated = await DeliverableService.update(id, req.body, req.user.id);
        res.json({ status: 'success', data: updated });
    } catch (err) {
        console.error('[DeliverableCtrl] updateDeliverable:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── DELETE deliverable ───────────────────────────────────────────────────
export const deleteDeliverable = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        if (!access.isBrand && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Only brands can delete deliverables.' });
        }
        await DeliverableService.remove(id);
        res.json({ status: 'success', message: 'Deliverable deleted.' });
    } catch (err) {
        console.error('[DeliverableCtrl] deleteDeliverable:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── UPDATE status ────────────────────────────────────────────────────────
export const updateDeliverableStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status: newStatus } = req.body;
        if (!id || !newStatus) return res.status(400).json({ status: 'error', message: 'ID and status required.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const updated = await DeliverableService.updateStatus(id, newStatus, req.user.id);
        res.json({ status: 'success', data: updated });
    } catch (err) {
        console.error('[DeliverableCtrl] updateStatus:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── SUBMIT content (script / mock / final) ───────────────────────────────
export const submitContent = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        if (!access.isCreator && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Only creators can submit content.' });
        }
        const { type, textContent, fileUrl, externalUrl, notes } = req.body;
        if (!type || !['Script', 'MockDraft', 'FinalDraft'].includes(type)) {
            return res.status(400).json({ status: 'error', message: "type must be 'Script', 'MockDraft', or 'FinalDraft'." });
        }
        const submission = await DeliverableService.submitContent(id, req.user.id, { type, textContent, fileUrl, externalUrl, notes });
        res.status(201).json({ status: 'success', data: submission });
    } catch (err) {
        console.error('[DeliverableCtrl] submitContent:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── REVIEW submission ────────────────────────────────────────────────────
export const reviewSubmission = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        if (!access.isBrand && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Only brands can review submissions.' });
        }
        const { action, feedback, submissionId } = req.body;
        const result = await DeliverableService.reviewSubmission(id, req.user.id, { action, feedback, submissionId });
        res.json({ status: 'success', data: result });
    } catch (err) {
        console.error('[DeliverableCtrl] reviewSubmission:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET submissions ──────────────────────────────────────────────────────
export const getSubmissions = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const data = await DeliverableService.getSubmissions(id);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error('[DeliverableCtrl] getSubmissions:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET timeline ─────────────────────────────────────────────────────────
export const getTimeline = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const data = await DeliverableService.getTimeline(id);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error('[DeliverableCtrl] getTimeline:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── UPDATE checklist ─────────────────────────────────────────────────────
export const updateChecklist = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const { checklistState } = req.body;
        if (!Array.isArray(checklistState)) {
            return res.status(400).json({ status: 'error', message: 'checklistState must be an array.' });
        }
        const updated = await DeliverableService.updateChecklist(id, checklistState, req.user.id);
        res.json({ status: 'success', data: updated });
    } catch (err) {
        console.error('[DeliverableCtrl] updateChecklist:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── VALIDATE compliance ──────────────────────────────────────────────────
export const validateCompliance = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (!id) return res.status(400).json({ status: 'error', message: 'Invalid deliverable ID.' });
        const access = await assertAccess(req.user.id, req.user.role, id);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const result = await DeliverableService.validateCompliance(id, req.body);
        res.json({ status: 'success', data: result });
    } catch (err) {
        console.error('[DeliverableCtrl] validateCompliance:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET payment summary ──────────────────────────────────────────────────
export const getPaymentSummary = async (req, res) => {
    try {
        const collabId = parseInt(req.params.collabId);
        if (!collabId) return res.status(400).json({ status: 'error', message: 'Invalid collaboration ID.' });
        const access = await assertCollabAccess(req.user.id, req.user.role, collabId);
        if (access.error) return res.status(access.status).json({ status: 'error', message: access.error });
        const data = await DeliverableService.getPaymentSummary(collabId);
        res.json({ status: 'success', data });
    } catch (err) {
        console.error('[DeliverableCtrl] getPaymentSummary:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};
