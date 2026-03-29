import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listCreators,
  getCreatorDetail,
  getCreatorCampaigns,
  getCreatorPayouts,
} from '../controllers/adminCreatorController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listCreators);
router.get('/:id', getCreatorDetail);
router.get('/:id/campaigns', getCreatorCampaigns);
router.get('/:id/payouts', getCreatorPayouts);

export default router;
