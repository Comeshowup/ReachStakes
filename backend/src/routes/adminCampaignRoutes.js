import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listCampaigns,
  getCampaignDetail,
  updateCampaignStatus,
  getCampaignCreators,
  getCampaignDeliverables,
  getCampaignTimeline,
  getCampaignPayments,
  getCampaignActivity,
  getCampaignStats,
} from '../controllers/adminCampaignController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listCampaigns);
router.get('/:id', getCampaignDetail);
router.put('/:id/status', updateCampaignStatus);
router.get('/:id/creators', getCampaignCreators);
router.get('/:id/deliverables', getCampaignDeliverables);
router.get('/:id/timeline', getCampaignTimeline);
router.get('/:id/payments', getCampaignPayments);
router.get('/:id/activity', getCampaignActivity);
router.get('/:id/stats', getCampaignStats);

export default router;
