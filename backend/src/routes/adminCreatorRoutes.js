import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  listCreators,
  getCreatorDetail,
  getCreatorCampaigns,
  getCreatorPayouts,
} from '../controllers/adminCreatorController.js';

const router = express.Router();

// Brand users can search creators (for campaign invitations)
router.get('/', protect, authorize('admin', 'brand'), listCreators);

// Admin-only routes
router.get('/:id', requireAdmin, getCreatorDetail);
router.get('/:id/campaigns', requireAdmin, getCreatorCampaigns);
router.get('/:id/payouts', requireAdmin, getCreatorPayouts);

export default router;
