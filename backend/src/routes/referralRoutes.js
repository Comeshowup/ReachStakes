import express from 'express';
import {
    getMyStats,
    generateCode,
    validateCode
} from '../controllers/referralController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - validate referral code
router.get('/validate/:code', validateCode);

// Protected routes - require authentication
router.get('/my-stats', protect, getMyStats);
router.post('/generate-code', protect, authorize('creator'), generateCode);

export default router;
