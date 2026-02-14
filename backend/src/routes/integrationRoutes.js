/**
 * Integration Routes
 * Endpoints for e-commerce platform connections
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getIntegrations,
    initiateShopifyAuth,
    handleShopifyCallback,
    saveGA4Config,
    saveMetaConfig,
    disconnectIntegration,
    testIntegration,
    syncShopifyOrders,
    createDiscountCode
} from '../controllers/integrationController.js';

const router = express.Router();

// === GET ALL INTEGRATIONS ===
router.get('/', protect, getIntegrations);

// === SHOPIFY ===
router.post('/shopify/auth', protect, initiateShopifyAuth);
router.get('/shopify/callback', handleShopifyCallback); // No auth - OAuth redirect
router.post('/shopify/sync', protect, syncShopifyOrders);
router.post('/shopify/discount', protect, createDiscountCode);

// === GA4 ===
router.post('/ga4', protect, saveGA4Config);

// === META CAPI ===
router.post('/meta', protect, saveMetaConfig);

// === COMMON ===
router.delete('/:type/disconnect', protect, disconnectIntegration);
router.get('/:type/test', protect, testIntegration);

export default router;
