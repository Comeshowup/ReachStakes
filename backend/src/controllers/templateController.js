/**
 * TemplateController — CRUD for reusable Deliverable Templates.
 * Only brand users (or admins) can manage templates.
 */
import { prisma } from '../config/db.js';

// ── CREATE ───────────────────────────────────────────────────────────────
export const createTemplate = async (req, res) => {
    try {
        const { name, contentType, platform, guidelines, checklist, requireScript, requireMockDraft } = req.body;
        if (!name) return res.status(400).json({ status: 'error', message: 'Template name is required.' });

        const template = await prisma.deliverableTemplate.create({
            data: {
                brandId: req.user.id,
                name,
                contentType: contentType || null,
                platform: platform || null,
                guidelines: guidelines || null,
                checklist: checklist || null,
                requireScript: requireScript || false,
                requireMockDraft: requireMockDraft || false,
            },
        });
        res.status(201).json({ status: 'success', data: template });
    } catch (err) {
        console.error('[TemplateCtrl] create:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── LIST (brand's templates) ─────────────────────────────────────────────
export const getTemplates = async (req, res) => {
    try {
        const templates = await prisma.deliverableTemplate.findMany({
            where: { brandId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ status: 'success', data: templates });
    } catch (err) {
        console.error('[TemplateCtrl] list:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── GET single ───────────────────────────────────────────────────────────
export const getTemplate = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const template = await prisma.deliverableTemplate.findUnique({ where: { id } });
        if (!template) return res.status(404).json({ status: 'error', message: 'Template not found.' });
        if (template.brandId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Not authorized.' });
        }
        res.json({ status: 'success', data: template });
    } catch (err) {
        console.error('[TemplateCtrl] get:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── UPDATE ───────────────────────────────────────────────────────────────
export const updateTemplate = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await prisma.deliverableTemplate.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ status: 'error', message: 'Template not found.' });
        if (existing.brandId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Not authorized.' });
        }
        const data = {};
        for (const k of ['name', 'contentType', 'platform', 'guidelines', 'checklist', 'requireScript', 'requireMockDraft']) {
            if (req.body[k] !== undefined) data[k] = req.body[k];
        }
        const updated = await prisma.deliverableTemplate.update({ where: { id }, data });
        res.json({ status: 'success', data: updated });
    } catch (err) {
        console.error('[TemplateCtrl] update:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// ── DELETE ───────────────────────────────────────────────────────────────
export const deleteTemplate = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const existing = await prisma.deliverableTemplate.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ status: 'error', message: 'Template not found.' });
        if (existing.brandId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Not authorized.' });
        }
        await prisma.deliverableTemplate.delete({ where: { id } });
        res.json({ status: 'success', message: 'Template deleted.' });
    } catch (err) {
        console.error('[TemplateCtrl] delete:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
    }
};
