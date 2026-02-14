/**
 * Licensing Controller
 * API endpoints for content licensing marketplace
 */

import * as licensingService from '../services/licensingService.js';

/**
 * GET /api/licensing/assets
 * Get marketplace content assets
 */
export const getMarketplaceAssets = async (req, res) => {
    try {
        const { platform, type, limit } = req.query;
        const assets = await licensingService.getMarketplaceAssets({ platform, type, limit });

        res.json({
            status: 'success',
            data: assets
        });
    } catch (error) {
        console.error('[Licensing] Get marketplace error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * GET /api/licensing/assets/:id
 * Get single asset details
 */
export const getAsset = async (req, res) => {
    try {
        const asset = await licensingService.getAssetById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                status: 'error',
                message: 'Asset not found'
            });
        }

        res.json({
            status: 'success',
            data: asset
        });
    } catch (error) {
        console.error('[Licensing] Get asset error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * GET /api/licensing/creator/assets
 * Get creator's own assets
 */
export const getCreatorAssets = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const assets = await licensingService.getCreatorAssets(creatorId);

        res.json({
            status: 'success',
            data: assets
        });
    } catch (error) {
        console.error('[Licensing] Get creator assets error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * POST /api/licensing/assets
 * Create new content asset (creator only)
 */
export const createAsset = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const asset = await licensingService.createAsset({
            ...req.body,
            creatorId
        });

        res.status(201).json({
            status: 'success',
            data: asset
        });
    } catch (error) {
        console.error('[Licensing] Create asset error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * PUT /api/licensing/assets/:id
 * Update asset (creator only)
 */
export const updateAsset = async (req, res) => {
    try {
        const assetId = req.params.id;
        const creatorId = req.user.id;

        // Verify ownership
        const existing = await licensingService.getAssetById(assetId);
        if (!existing) {
            return res.status(404).json({ status: 'error', message: 'Asset not found' });
        }
        if (existing.creatorId !== creatorId) {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }

        const asset = await licensingService.updateAsset(assetId, req.body);

        res.json({
            status: 'success',
            data: asset
        });
    } catch (error) {
        console.error('[Licensing] Update asset error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * DELETE /api/licensing/assets/:id
 * Delete asset (creator only)
 */
export const deleteAsset = async (req, res) => {
    try {
        const assetId = req.params.id;
        const creatorId = req.user.id;

        // Verify ownership
        const existing = await licensingService.getAssetById(assetId);
        if (!existing) {
            return res.status(404).json({ status: 'error', message: 'Asset not found' });
        }
        if (existing.creatorId !== creatorId) {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }

        await licensingService.deleteAsset(assetId);

        res.json({
            status: 'success',
            message: 'Asset deleted'
        });
    } catch (error) {
        console.error('[Licensing] Delete asset error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * GET /api/licensing/licenses
 * Get brand's purchased licenses
 */
export const getBrandLicenses = async (req, res) => {
    try {
        const brandId = req.user.id;
        const licenses = await licensingService.getBrandLicenses(brandId);

        res.json({
            status: 'success',
            data: licenses
        });
    } catch (error) {
        console.error('[Licensing] Get licenses error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * POST /api/licensing/licenses
 * Purchase a license (brand only)
 */
export const purchaseLicense = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { assetId, licenseType, territory, durationMonths, usageNotes } = req.body;

        if (!assetId) {
            return res.status(400).json({
                status: 'error',
                message: 'assetId is required'
            });
        }

        const license = await licensingService.purchaseLicense({
            assetId,
            brandId,
            licenseType,
            territory,
            durationMonths,
            usageNotes
        });

        res.status(201).json({
            status: 'success',
            data: license,
            message: license.status === 'Active'
                ? 'License activated successfully'
                : 'License created - pending payment'
        });
    } catch (error) {
        console.error('[Licensing] Purchase license error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * GET /api/licensing/licenses/:id
 * Get license details
 */
export const getLicense = async (req, res) => {
    try {
        const license = await licensingService.getLicenseById(req.params.id);

        if (!license) {
            return res.status(404).json({
                status: 'error',
                message: 'License not found'
            });
        }

        // Check authorization (brand or creator can view)
        if (license.brandId !== req.user.id && license.asset.creator.userId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        res.json({
            status: 'success',
            data: license
        });
    } catch (error) {
        console.error('[Licensing] Get license error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * POST /api/licensing/licenses/:id/revoke
 * Revoke a license (creator only)
 */
export const revokeLicense = async (req, res) => {
    try {
        const license = await licensingService.getLicenseById(req.params.id);

        if (!license) {
            return res.status(404).json({
                status: 'error',
                message: 'License not found'
            });
        }

        // Only creator can revoke
        if (license.asset.creatorId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        const updated = await licensingService.revokeLicense(req.params.id);

        res.json({
            status: 'success',
            data: updated,
            message: 'License revoked'
        });
    } catch (error) {
        console.error('[Licensing] Revoke license error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
