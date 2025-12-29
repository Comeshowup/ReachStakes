import express from 'express';
import { createCampaign, applyToCampaign, getBrandCampaigns, getCreatorCampaigns, getAllCampaigns, getCampaignById } from '../controllers/campaignControllers.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (or protected if preferred, keeping it protected for now as platform is closed)
router.get('/all', protect, getAllCampaigns);
router.get('/:id', protect, getCampaignById); // Move specific ID route AFTER static routes if needed, but 'all' is distinct from ':id' if :id is int. However, "all" is a string so it might conflict if :id catches strings. 
// "all" matches :id? No, if defined before. But wait.
// If I define /:id generic, /all might be caught by it if defined after. 
// Defining /all first is safer.

// Brand routes
router.post('/', protect, authorize('brand'), createCampaign);
router.get('/brand/:brandId', protect, getBrandCampaigns);

// Creator routes
router.post('/:id/apply', protect, authorize('creator'), applyToCampaign);
router.get('/creator/:creatorId', protect, getCreatorCampaigns);

export default router;