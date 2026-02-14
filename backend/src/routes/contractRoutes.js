/**
 * Contract Routes
 * API routes for contract templates and usage rights (Phase 6)
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as contractController from '../controllers/contractController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Template routes
router.get('/templates', contractController.getTemplates);
router.get('/templates/:id', contractController.getTemplateById);
router.post('/templates', contractController.createTemplate);
router.put('/templates/:id', contractController.updateTemplate);
router.delete('/templates/:id', contractController.deleteTemplate);

// Document generation
router.post('/generate', contractController.generateFromTemplate);

// Usage rights
router.post('/usage-rights', contractController.grantUsageRights);
router.get('/usage-rights', contractController.getUsageRights);
router.get('/usage-rights/check', contractController.checkUsageRights);
router.post('/usage-rights/:id/revoke', contractController.revokeUsageRights);

// Audit trail
router.get('/audit/:documentId', contractController.getAuditTrail);

// Admin
router.post('/seed-templates', contractController.seedTemplates);

export default router;
