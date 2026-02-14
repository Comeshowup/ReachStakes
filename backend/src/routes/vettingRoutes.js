/**
 * Vetting Routes
 * API routes for creator vetting and fraud detection
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as vettingController from '../controllers/vettingController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Vetting operations
router.post('/vet/:creatorId', vettingController.vetCreator);
router.post('/report/:creatorId', vettingController.generateReport);

// Summary (can be viewed by anyone authenticated)
router.get('/summary/:creatorId', vettingController.getVettingSummary);

// Report access
router.get('/report/:reportId', vettingController.getReport);
router.get('/creator/:creatorId/reports', vettingController.getCreatorReports);

// Preview scores (without saving)
router.get('/preview/:creatorId', vettingController.previewScores);

export default router;
