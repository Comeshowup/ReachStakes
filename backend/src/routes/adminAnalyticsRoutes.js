import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  getOverview,
  getCampaignMetrics,
  getCreatorMetrics,
  getRevenueMetrics,
} from '../controllers/adminAnalyticsController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/campaigns', getCampaignMetrics);
router.get('/creators', getCreatorMetrics);
router.get('/revenue', getRevenueMetrics);

export default router;
