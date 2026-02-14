/**
 * Report Routes
 * API routes for automated report generation (Phase 7)
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Brand Reports
router.get('/brand/executive', reportController.getBrandExecutiveReport);
router.get('/brand/executive/pdf', reportController.downloadBrandReportPDF);
router.get('/brand/executive/csv', reportController.downloadBrandReportCSV);

// Creator Reports
router.get('/creator/performance', reportController.getCreatorPerformanceReport);
router.get('/creator/performance/pdf', reportController.downloadCreatorReportPDF);
router.get('/creator/performance/csv', reportController.downloadCreatorReportCSV);

// Campaign Summary
router.get('/campaign/:campaignId', reportController.getCampaignSummary);

export default router;
