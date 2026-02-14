/**
 * Contract Controller
 * API endpoints for contract templates and usage rights
 */

import * as contractService from '../services/contractService.js';

// ============================================
// TEMPLATE ENDPOINTS
// ============================================

/**
 * Get all available templates
 * GET /api/contracts/templates
 */
export const getTemplates = async (req, res) => {
    try {
        const brandId = req.user.role === 'brand' ? req.user.id : null;
        const templates = await contractService.getTemplates(brandId);

        res.json({
            status: 'success',
            data: templates
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get templates'
        });
    }
};

/**
 * Get template by ID
 * GET /api/contracts/templates/:id
 */
export const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await contractService.getTemplateById(parseInt(id));

        if (!template) {
            return res.status(404).json({
                status: 'error',
                message: 'Template not found'
            });
        }

        res.json({
            status: 'success',
            data: template
        });
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get template'
        });
    }
};

/**
 * Create custom template
 * POST /api/contracts/templates
 */
export const createTemplate = async (req, res) => {
    try {
        if (req.user.role !== 'brand') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can create templates'
            });
        }

        const template = await contractService.createTemplate(req.user.id, req.body);

        res.status(201).json({
            status: 'success',
            data: template
        });
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create template'
        });
    }
};

/**
 * Update template
 * PUT /api/contracts/templates/:id
 */
export const updateTemplate = async (req, res) => {
    try {
        if (req.user.role !== 'brand') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can update templates'
            });
        }

        const { id } = req.params;
        const template = await contractService.updateTemplate(
            parseInt(id),
            req.user.id,
            req.body
        );

        res.json({
            status: 'success',
            data: template
        });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update template'
        });
    }
};

/**
 * Delete template
 * DELETE /api/contracts/templates/:id
 */
export const deleteTemplate = async (req, res) => {
    try {
        if (req.user.role !== 'brand') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can delete templates'
            });
        }

        const { id } = req.params;
        await contractService.deleteTemplate(parseInt(id), req.user.id);

        res.json({
            status: 'success',
            message: 'Template deleted'
        });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete template'
        });
    }
};

// ============================================
// DOCUMENT GENERATION
// ============================================

/**
 * Generate document from template
 * POST /api/contracts/generate
 */
export const generateFromTemplate = async (req, res) => {
    try {
        const { templateId, variables, creatorId, collaborationId, campaignId, expiresAt } = req.body;

        if (!templateId || !variables || !creatorId) {
            return res.status(400).json({
                status: 'error',
                message: 'templateId, variables, and creatorId are required'
            });
        }

        const result = await contractService.generateFromTemplate(
            parseInt(templateId),
            variables,
            {
                creatorId: parseInt(creatorId),
                collaborationId: collaborationId ? parseInt(collaborationId) : null,
                campaignId: campaignId ? parseInt(campaignId) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        );

        res.status(201).json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Generate from template error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate document'
        });
    }
};

// ============================================
// USAGE RIGHTS
// ============================================

/**
 * Grant usage rights
 * POST /api/contracts/usage-rights
 */
export const grantUsageRights = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can grant usage rights'
            });
        }

        const rights = await contractService.grantUsageRights({
            ...req.body,
            grantedBy: req.user.id
        });

        res.status(201).json({
            status: 'success',
            data: rights
        });
    } catch (error) {
        console.error('Grant usage rights error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to grant usage rights'
        });
    }
};

/**
 * Get usage rights
 * GET /api/contracts/usage-rights
 */
export const getUsageRights = async (req, res) => {
    try {
        const { documentId, collaborationId, contentAssetId } = req.query;

        const rights = await contractService.getUsageRights({
            documentId: documentId ? parseInt(documentId) : undefined,
            collaborationId: collaborationId ? parseInt(collaborationId) : undefined,
            contentAssetId: contentAssetId ? parseInt(contentAssetId) : undefined
        });

        res.json({
            status: 'success',
            data: rights
        });
    } catch (error) {
        console.error('Get usage rights error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get usage rights'
        });
    }
};

/**
 * Revoke usage rights
 * POST /api/contracts/usage-rights/:id/revoke
 */
export const revokeUsageRights = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const rights = await contractService.revokeUsageRights(
            parseInt(id),
            req.user.id,
            reason
        );

        res.json({
            status: 'success',
            data: rights
        });
    } catch (error) {
        console.error('Revoke usage rights error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to revoke usage rights'
        });
    }
};

/**
 * Check usage rights
 * GET /api/contracts/usage-rights/check
 */
export const checkUsageRights = async (req, res) => {
    try {
        const { documentId, usageType } = req.query;

        if (!documentId || !usageType) {
            return res.status(400).json({
                status: 'error',
                message: 'documentId and usageType are required'
            });
        }

        const result = await contractService.checkUsageRights(
            parseInt(documentId),
            usageType
        );

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Check usage rights error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to check usage rights'
        });
    }
};

// ============================================
// AUDIT TRAIL
// ============================================

/**
 * Get document audit trail
 * GET /api/contracts/audit/:documentId
 */
export const getAuditTrail = async (req, res) => {
    try {
        const { documentId } = req.params;
        const result = await contractService.getDocumentAuditTrail(parseInt(documentId));

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Get audit trail error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get audit trail'
        });
    }
};

/**
 * Seed system templates (admin only)
 * POST /api/contracts/seed-templates
 */
export const seedTemplates = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Admin only'
            });
        }

        await contractService.seedSystemTemplates();

        res.json({
            status: 'success',
            message: 'System templates seeded'
        });
    } catch (error) {
        console.error('Seed templates error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to seed templates'
        });
    }
};
