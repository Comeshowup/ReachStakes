/**
 * DeliverableService — Business logic for the Deliverable system.
 * Handles CRUD, versioned submissions, review workflow, timeline, checklist, compliance.
 */
import { prisma } from '../config/db.js';
import { createNotification } from './notificationService.js';

export class DeliverableService {

    // ── CRUD ─────────────────────────────────────────────────────────────

    static async createDeliverables(collaborationId, deliverables, actorId) {
        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: collaborationId },
            include: { campaign: { select: { brandId: true, title: true } } },
        });
        if (!collab) throw new Error('Collaboration not found.');

        const created = [];
        for (let i = 0; i < deliverables.length; i++) {
            const d = deliverables[i];
            let templateData = {};
            if (d.templateId) {
                const tmpl = await prisma.deliverableTemplate.findUnique({ where: { id: d.templateId } });
                if (tmpl) {
                    templateData = {
                        guidelines: tmpl.guidelines, checklist: tmpl.checklist,
                        requireScript: tmpl.requireScript, requireMockDraft: tmpl.requireMockDraft,
                        platform: tmpl.platform, contentType: tmpl.contentType,
                    };
                }
            }
            const needsScript = d.requireScript ?? templateData.requireScript ?? false;
            const deliverable = await prisma.deliverable.create({
                data: {
                    collaborationId, title: d.title,
                    platform: d.platform || templateData.platform || null,
                    contentType: d.contentType || templateData.contentType || null,
                    paymentAmount: d.paymentAmount ? parseFloat(d.paymentAmount) : null,
                    deadline: d.deadline ? new Date(d.deadline) : null,
                    guidelines: d.guidelines || templateData.guidelines || null,
                    checklist: d.checklist || templateData.checklist || null,
                    requireScript: needsScript,
                    requireMockDraft: d.requireMockDraft ?? templateData.requireMockDraft ?? false,
                    assets: d.assets || null, templateId: d.templateId || null,
                    sortOrder: i, status: needsScript ? 'ScriptRequired' : 'Pending',
                },
            });
            await DeliverableService._event(deliverable.id, 'created', 'Deliverable created', actorId);
            created.push(deliverable);
        }
        return created;
    }

    static async getByCollaboration(collaborationId) {
        return prisma.deliverable.findMany({
            where: { collaborationId },
            include: { submissions: { orderBy: [{ type: 'asc' }, { version: 'desc' }], take: 10 } },
            orderBy: { sortOrder: 'asc' },
        });
    }

    static async getById(deliverableId) {
        const d = await prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: {
                submissions: { orderBy: [{ type: 'asc' }, { version: 'desc' }] },
                events: { orderBy: { createdAt: 'desc' }, take: 50 },
                collaboration: {
                    include: {
                        campaign: { select: { id: true, title: true, brandId: true, resources: true, escrowBalance: true } },
                        creator: { select: { id: true, name: true, creatorProfile: { select: { handle: true, avatarUrl: true } } } },
                    },
                },
                template: true,
            },
        });
        if (!d) throw new Error('Deliverable not found.');
        return d;
    }

    static async update(deliverableId, data, actorId) {
        const existing = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
        if (!existing) throw new Error('Deliverable not found.');
        const u = {};
        for (const k of ['title','platform','contentType','guidelines','checklist','assets','requireScript','requireMockDraft']) {
            if (data[k] !== undefined) u[k] = data[k];
        }
        if (data.paymentAmount !== undefined) u.paymentAmount = parseFloat(data.paymentAmount);
        if (data.deadline !== undefined) u.deadline = data.deadline ? new Date(data.deadline) : null;
        if (data.sortOrder !== undefined) u.sortOrder = data.sortOrder;
        const updated = await prisma.deliverable.update({ where: { id: deliverableId }, data: u });
        await DeliverableService._event(deliverableId, 'updated', 'Deliverable updated', actorId, { fields: Object.keys(u) });
        return updated;
    }

    static async remove(deliverableId) {
        const existing = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
        if (!existing) throw new Error('Deliverable not found.');
        await prisma.deliverable.delete({ where: { id: deliverableId } });
        return { success: true };
    }

    // ── STATUS ───────────────────────────────────────────────────────────

    static async updateStatus(deliverableId, newStatus, actorId) {
        const d = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
        if (!d) throw new Error('Deliverable not found.');
        const updated = await prisma.deliverable.update({ where: { id: deliverableId }, data: { status: newStatus } });
        await DeliverableService._event(deliverableId, 'status_change', `Status → ${newStatus}`, actorId, { from: d.status, to: newStatus });
        return updated;
    }

    // ── SUBMISSIONS (versioned) ──────────────────────────────────────────

    static async submitContent(deliverableId, submitterId, { type, textContent, fileUrl, externalUrl, notes }) {
        const d = await prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: { collaboration: { include: { campaign: { select: { brandId: true, title: true } } } } },
        });
        if (!d) throw new Error('Deliverable not found.');

        const latest = await prisma.deliverableSubmission.findFirst({
            where: { deliverableId, type }, orderBy: { version: 'desc' },
        });
        const ver = (latest?.version || 0) + 1;

        const sub = await prisma.deliverableSubmission.create({
            data: { deliverableId, submitterId, type, version: ver, textContent: textContent || null, fileUrl: fileUrl || null, externalUrl: externalUrl || null, notes: notes || null, reviewStatus: 'pending' },
        });

        const statusMap = { Script: 'ScriptSubmitted', MockDraft: 'MockDraftSubmitted', FinalDraft: 'FinalDraftSubmitted' };
        if (statusMap[type]) await prisma.deliverable.update({ where: { id: deliverableId }, data: { status: statusMap[type] } });

        await DeliverableService._event(deliverableId, 'submission', `${type} V${ver} submitted`, submitterId, { submissionId: sub.id, type, version: ver });

        createNotification(d.collaboration.campaign.brandId, 'content_submitted', `${type} Submitted`,
            `Creator submitted ${type} V${ver} for "${d.title}" in "${d.collaboration.campaign.title}"`,
            { deliverableId, submissionId: sub.id, type, version: ver });

        return sub;
    }

    static async getSubmissions(deliverableId) {
        const subs = await prisma.deliverableSubmission.findMany({
            where: { deliverableId }, orderBy: [{ type: 'asc' }, { version: 'desc' }],
        });
        const grouped = { Script: [], MockDraft: [], FinalDraft: [] };
        for (const s of subs) { if (grouped[s.type]) grouped[s.type].push(s); }
        return grouped;
    }

    // ── REVIEW ────────────────────────────────────────────────────────────

    static async reviewSubmission(deliverableId, reviewerId, { action, feedback, submissionId }) {
        const d = await prisma.deliverable.findUnique({
            where: { id: deliverableId },
            include: { collaboration: { select: { creatorId: true, campaign: { select: { title: true } } } } },
        });
        if (!d) throw new Error('Deliverable not found.');
        if (!['approve','reject','revision'].includes(action)) throw new Error("Action must be 'approve', 'reject', or 'revision'.");

        const sub = submissionId
            ? await prisma.deliverableSubmission.findUnique({ where: { id: submissionId } })
            : await prisma.deliverableSubmission.findFirst({ where: { deliverableId, reviewStatus: 'pending' }, orderBy: { createdAt: 'desc' } });
        if (!sub) throw new Error('No pending submission found.');

        const reviewMap = { approve: 'approved', reject: 'rejected', revision: 'revision_requested' };
        await prisma.deliverableSubmission.update({
            where: { id: sub.id },
            data: { reviewStatus: reviewMap[action], reviewedBy: reviewerId, reviewedAt: new Date(), reviewFeedback: feedback || null },
        });

        let newStatus = d.status;
        if (action === 'approve') {
            if (sub.type === 'Script') newStatus = 'ScriptApproved';
            else if (sub.type === 'MockDraft') newStatus = 'MockDraftApproved';
            else if (sub.type === 'FinalDraft') newStatus = 'FinalApproved';
        } else if (action === 'revision') {
            newStatus = 'RevisionRequested';
        }
        if (newStatus !== d.status) await prisma.deliverable.update({ where: { id: deliverableId }, data: { status: newStatus } });

        const label = action === 'approve' ? 'approved' : action === 'revision' ? 'requested revision for' : 'rejected';
        await DeliverableService._event(deliverableId, 'review', `Brand ${label} ${sub.type} V${sub.version}`, reviewerId, { submissionId: sub.id, action, feedback });

        const nType = action === 'approve' ? 'content_approved' : 'content_revision';
        createNotification(d.collaboration.creatorId, nType,
            action === 'approve' ? `${sub.type} Approved` : 'Revision Requested',
            action === 'approve' ? `Your ${sub.type} for "${d.title}" approved!` : `Revision requested for ${sub.type} on "${d.title}"`,
            { deliverableId, submissionId: sub.id, action, feedback });

        return { success: true, newStatus };
    }

    // ── CHECKLIST ─────────────────────────────────────────────────────────

    static async updateChecklist(deliverableId, checklistState, actorId) {
        const d = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
        if (!d) throw new Error('Deliverable not found.');
        const stamped = checklistState.map(i => ({ id: i.id, completed: i.completed, completedAt: i.completed ? new Date().toISOString() : null }));
        return prisma.deliverable.update({ where: { id: deliverableId }, data: { checklistState: stamped } });
    }

    static isChecklistComplete(deliverable) {
        if (!deliverable.checklist || !Array.isArray(deliverable.checklist)) return true;
        if (!deliverable.checklistState || !Array.isArray(deliverable.checklistState)) return false;
        const required = deliverable.checklist.filter(i => i.required !== false);
        const done = new Set(deliverable.checklistState.filter(s => s.completed).map(s => s.id));
        return required.every(i => done.has(i.id));
    }

    // ── TIMELINE ──────────────────────────────────────────────────────────

    static async getTimeline(deliverableId) {
        return prisma.deliverableEvent.findMany({ where: { deliverableId }, orderBy: { createdAt: 'desc' }, take: 100 });
    }

    // ── COMPLIANCE VALIDATION ─────────────────────────────────────────────

    static async validateCompliance(deliverableId, submissionData = {}) {
        const d = await prisma.deliverable.findUnique({ where: { id: deliverableId } });
        if (!d) throw new Error('Deliverable not found.');
        const results = [];
        const g = d.guidelines || {};
        const text = (submissionData.textContent || '').toLowerCase();

        if (g.hashtags && Array.isArray(g.hashtags)) {
            for (const tag of g.hashtags) results.push({ check: `Hashtag "${tag}"`, passed: text.includes(tag.toLowerCase()), required: true });
        }
        if (g.cta) results.push({ check: `CTA "${g.cta}"`, passed: text.includes(g.cta.toLowerCase()), required: true });
        if (g.mentions && Array.isArray(g.mentions)) {
            for (const m of g.mentions) results.push({ check: `Mention "${m}"`, passed: text.includes(m.toLowerCase()), required: true });
        }
        if (g.duration && submissionData.duration) {
            results.push({ check: `Duration ${g.duration.min}-${g.duration.max}s`, passed: submissionData.duration >= (g.duration.min||0) && submissionData.duration <= (g.duration.max||999), required: true });
        }
        results.push({ check: 'Checklist complete', passed: DeliverableService.isChecklistComplete(d), required: true });

        return { deliverableId, allPassed: results.every(r => !r.required || r.passed), checks: results };
    }

    // ── PAYMENT SUMMARY ──────────────────────────────────────────────────

    static async getPaymentSummary(collaborationId) {
        const items = await prisma.deliverable.findMany({
            where: { collaborationId }, select: { id: true, title: true, paymentAmount: true, paymentStatus: true, status: true },
        });
        const total = items.reduce((s, d) => s + parseFloat(d.paymentAmount || 0), 0);
        const released = items.filter(d => d.paymentStatus === 'Released').reduce((s, d) => s + parseFloat(d.paymentAmount || 0), 0);
        return { deliverables: items, total, released, pending: total - released };
    }

    // ── PRIVATE ───────────────────────────────────────────────────────────

    static async _event(deliverableId, type, description, actorId, metadata = null) {
        return prisma.deliverableEvent.create({ data: { deliverableId, type, description, actorId: actorId || null, metadata: metadata || undefined } });
    }
}
