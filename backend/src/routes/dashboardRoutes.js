import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getDashboardOverview,
    getCampaignsSummary,
    getEscrowStatus,
    getPendingApprovals,
    getRecentActivity,
    getTopCampaigns
} from '../controllers/dashboardController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Dashboard overview with KPIs and overall ROI
// GET /api/dashboard/overview
router.get('/overview', getDashboardOverview);

// Campaigns summary with pacing status
// GET /api/dashboard/campaigns
router.get('/campaigns', getCampaignsSummary);

// Escrow status with allocations
// GET /api/dashboard/escrow
router.get('/escrow', getEscrowStatus);

// Pending approvals grouped by campaign
// GET /api/dashboard/approvals
router.get('/approvals', getPendingApprovals);

// Recent activity feed with typed events
// GET /api/dashboard/activity?limit=20
router.get('/activity', getRecentActivity);

// Top performing campaigns
// GET /api/dashboard/top-campaigns?limit=3
router.get('/top-campaigns', getTopCampaigns);

export default router;
