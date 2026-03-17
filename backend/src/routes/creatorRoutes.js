import express from 'express';
import {
    updateCreatorProfile,
    getCreatorProfile
} from '../controllers/userControllers.js';
import { getCreatorAnalytics } from '../controllers/analyticsController.js';
import {
    getEarningsSummary,
    getCreatorTransactions,
    requestWithdrawal,
} from '../controllers/earningsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
// router.get('/:handle', getPublicProfile); // Moved from userRoutes if we want

// Protected routes
router.get('/profile', protect, getCreatorProfile);
router.put('/profile', protect, updateCreatorProfile);
router.get('/analytics', protect, getCreatorAnalytics);

// ── Earnings Module ──────────────────────────────────────────
router.get('/earnings-summary', protect, getEarningsSummary);
router.get('/transactions',     protect, getCreatorTransactions);
router.post('/withdrawals',     protect, requestWithdrawal);

export default router;

