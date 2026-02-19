import express from 'express';
import { createCampaign, getCampaignDetail } from '../controllers/campaign.controller.js';
import { validateCreateCampaign } from '../middleware/campaign.validation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/v1/brand/campaigns
 * @desc Create a new campaign with wizard data (transactional)
 * @access Private (Brand only)
 */
router.post('/', protect, authorize('brand'), validateCreateCampaign, createCampaign);

/**
 * @route GET /api/v1/brand/campaigns/:id
 * @desc Get full campaign details with aggregated metrics
 * @access Private (Brand only, scoped)
 */
router.get('/:id', protect, authorize('brand'), getCampaignDetail);

export default router;
