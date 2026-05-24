import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
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
  getCampaignApprovals,
  updateApprovalDecision,
} from '../controllers/adminCampaignController.js';

const router = express.Router();

// Admin-only routes
router.get('/', requireAdmin, listCampaigns);
router.get('/:id', requireAdmin, getCampaignDetail);
router.put('/:id/status', requireAdmin, updateCampaignStatus);
router.get('/:id/deliverables', requireAdmin, getCampaignDeliverables);
router.get('/:id/timeline', requireAdmin, getCampaignTimeline);
router.get('/:id/payments', requireAdmin, getCampaignPayments);
router.get('/:id/activity', requireAdmin, getCampaignActivity);
router.get('/:id/stats', requireAdmin, getCampaignStats);

// Approvals — admin-only
router.get('/:id/approvals', requireAdmin, getCampaignApprovals);
router.patch('/:id/approvals/:collabId/:action', requireAdmin, updateApprovalDecision);

// Brand + Admin accessible (brand users manage their own campaigns)
router.get('/:id/creators', protect, authorize('admin', 'brand'), getCampaignCreators);
router.post('/:id/invite', protect, authorize('admin', 'brand'), inviteCampaignCreators);
router.post('/:id/creators/:collaborationId/:action', protect, authorize('admin', 'brand'), updateCreatorInviteStatus);

export default router;
