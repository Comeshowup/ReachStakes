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
  inviteCampaignCreators,
  updateCreatorInviteStatus,
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

router.post('/:id/invite', inviteCampaignCreators);
router.post('/:id/creators/:collaborationId/:action', updateCreatorInviteStatus);

export default router;
