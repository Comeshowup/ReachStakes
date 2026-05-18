import express from 'express';
import {
    initiatePayment,
    handleWebhook,
    calculateFees,
    getEscrowDetails,
    getTransactionHistory,
    getTransactionStatus,
    verifyPayment,
    simulatePaymentSuccess,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.post('/calculate-fees', protect, calculateFees);
router.get('/escrow/:campaignId', protect, getEscrowDetails);
router.post('/checkout', protect, initiatePayment);
router.get('/history', protect, getTransactionHistory);
router.get('/status/:transactionId', protect, getTransactionStatus);
router.post('/verify/:transactionId', protect, verifyPayment);

// Dev/Sandbox only — simulate a successful Tazapay payment (disabled in production)
router.post('/dev/simulate-success/:transactionId', protect, simulatePaymentSuccess);

// Public - Webhook callback from Tazapay
router.post('/webhook', handleWebhook);

export default router;

