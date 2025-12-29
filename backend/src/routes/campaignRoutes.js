import express from 'express';
import { createCampaign, applyToCampaign, getBrandCampaigns, getCreatorCampaigns, getAllCampaigns, getCampaignById } from '../controllers/campaignControllers.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes MUST come before dynamic /:id route to prevent route conflicts

// All campaigns (for discovery) - public route, no auth required
router.get('/all', getAllCampaigns);

// Brand routes
router.post('/', protect, authorize('brand'), createCampaign);
router.get('/brand/:brandId', protect, getBrandCampaigns);

// Creator routes
router.post('/:id/apply', protect, authorize('creator'), applyToCampaign);
router.get('/creator/:creatorId', protect, getCreatorCampaigns);

// Dynamic :id route MUST come last to avoid catching static routes like /brand or /creator
router.get('/:id', protect, getCampaignById);

export default router;