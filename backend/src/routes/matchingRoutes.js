/**
 * Matching Routes
 * API routes for AI matching and explainability (Phase 8)
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as matchingController from '../controllers/matchingController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Creator Routes
router.get('/score/:campaignId', matchingController.getMatchScore);
router.post('/scores', matchingController.getBulkMatchScores);
router.get('/roi/:campaignId', matchingController.getPredictedROI);
router.get('/suggestions', matchingController.getCampaignSuggestions);

// Brand Routes
router.get('/roi/brand/:creatorId/:campaignId', matchingController.getBrandROIPrediction);
router.get('/scale/:creatorId', matchingController.getScaleRecommendations);
router.post('/overlap', matchingController.analyzeAudienceOverlap);
router.get('/explain/:creatorId/:campaignId', matchingController.getMatchExplainability);

export default router;
