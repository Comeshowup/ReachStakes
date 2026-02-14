/**
 * Licensing Routes
 * API routes for content licensing marketplace
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as licensingController from '../controllers/licensingController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// === Content Asset Routes ===

// Marketplace view - all licensable assets
router.get('/assets', licensingController.getMarketplaceAssets);

// Single asset details
router.get('/assets/:id', licensingController.getAsset);

// Creator's own assets
router.get('/creator/assets', licensingController.getCreatorAssets);

// Create asset (creator)
router.post('/assets', licensingController.createAsset);

// Update asset (creator)
router.put('/assets/:id', licensingController.updateAsset);

// Delete asset (creator)
router.delete('/assets/:id', licensingController.deleteAsset);

// === License Token Routes ===

// Brand's purchased licenses
router.get('/licenses', licensingController.getBrandLicenses);

// Purchase license (brand)
router.post('/licenses', licensingController.purchaseLicense);

// Get license details
router.get('/licenses/:id', licensingController.getLicense);

// Revoke license (creator)
router.post('/licenses/:id/revoke', licensingController.revokeLicense);

export default router;
