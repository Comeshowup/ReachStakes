import express from 'express';
import {
    initiatePayment,
    handleWebhook,
    calculateFees,
    getEscrowDetails,
    getTransactionHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/calculate-fees', protect, calculateFees);
router.get('/escrow/:campaignId', protect, getEscrowDetails);
router.post('/checkout', protect, initiatePayment);
router.get('/history', protect, getTransactionHistory);

// Public - Webhook callback from Tazapay
router.post('/webhook', handleWebhook);

export default router;
