import express from 'express';
import { createCampaign, applyToCampaign, getBrandCampaigns, getCreatorCampaigns } from '../controllers/campaignControllers.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Brand routes
router.post('/', protect, authorize('brand'), createCampaign);
router.get('/brand/:brandId', protect, getBrandCampaigns);

// Creator routes
router.post('/:id/apply', protect, authorize('creator'), applyToCampaign);
router.get('/creator/:creatorId', protect, getCreatorCampaigns);

export default router;