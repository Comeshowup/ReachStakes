import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getBankFields,
    // Secure hosted onboarding (recommended)
    initiateOnboarding,
    getOnboardingStatus,
    regenerateOnboardingLink,
    // Legacy (deprecated)
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
router.post('/webhook', handlePayoutWebhook); // Webhook from Tazapay

// Protected routes (require authentication)
router.use(protect);

// Secure hosted onboarding (RECOMMENDED)
router.post('/initiate-onboarding', initiateOnboarding);
router.get('/onboarding-status', getOnboardingStatus);
router.post('/regenerate-link', regenerateOnboardingLink);

// Legacy direct API routes (deprecated - kept for backward compatibility)
router.post('/connect-bank', connectBank);
router.get('/status', getPayoutStatus);
router.post('/disconnect', disconnectBank);
router.get('/history', getPayoutHistory);
router.post('/initiate', initiatePayout); // Admin/system use

export default router;
