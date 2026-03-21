import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { payoutRateLimiter, bankConnectRateLimiter, webhookRateLimiter } from '../middleware/rateLimiter.js';
import {
    getBankFields,
    // Secure hosted onboarding (recommended)
    initiateOnboarding,
    getOnboardingStatus,
    regenerateOnboardingLink,
    // Bank connection
    connectBank,
    getPayoutStatus,
    disconnectBank,
    getPayoutHistory,
    initiatePayout,
    handlePayoutWebhook
} from '../controllers/payoutController.js';

const router = express.Router();

// Public/unauthenticated routes
router.get('/bank-fields', getBankFields); // Get required fields (can be public for form config)
router.post('/webhook', webhookRateLimiter, handlePayoutWebhook); // Webhook from Tazapay

// Protected routes (require authentication)
router.use(protect);

// Secure hosted onboarding (RECOMMENDED)
router.post('/initiate-onboarding', initiateOnboarding);
router.get('/onboarding-status', getOnboardingStatus);
router.post('/regenerate-link', regenerateOnboardingLink);

// Bank connection (rate limited)
router.post('/connect-bank', bankConnectRateLimiter, connectBank);
router.get('/status', getPayoutStatus);
router.post('/disconnect', disconnectBank);
router.get('/history', getPayoutHistory);
router.post('/initiate', payoutRateLimiter, initiatePayout); // Admin/system use

export default router;

