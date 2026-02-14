/**
 * Licensing Service
 * Business logic for content licensing marketplace
 */

import { prisma } from '../config/db.js';

/**
 * Get licensable content assets for a creator
 */
export const getCreatorAssets = async (creatorId) => {
    return prisma.contentAsset.findMany({
        where: {
            creatorId: parseInt(creatorId),
            isLicensable: true
        },
        include: {
            collaboration: {
                select: {
                    id: true,
                    campaign: { select: { id: true, title: true } }
                }
            },
            licenses: {
                where: { status: 'Active' },
                select: { id: true, licenseType: true, brandId: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get all licensable assets (marketplace view)
 */
export const getMarketplaceAssets = async (filters = {}) => {
    const { platform, type, limit = 50 } = filters;

    const where = { isLicensable: true };
    if (platform) where.platform = platform;
    if (type) where.type = type;

    return prisma.contentAsset.findMany({
        where,
        include: {
            creator: {
                select: {
                    userId: true,
                    fullName: true,
                    handle: true,
                    avatarUrl: true,
                    followersCount: true,
                    verificationTier: true
                }
            },
            collaboration: {
                select: {
                    campaign: { select: { id: true, title: true } }
                }
            },
            _count: { select: { licenses: true } }
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get a single asset with full details
 */
export const getAssetById = async (assetId) => {
    return prisma.contentAsset.findUnique({
        where: { id: parseInt(assetId) },
        include: {
            creator: {
                select: {
                    userId: true,
                    fullName: true,
                    handle: true,
                    avatarUrl: true,
                    followersCount: true,
                    verificationTier: true
                }
            },
            collaboration: {
                select: {
                    campaign: { select: { id: true, title: true } }
                }
            },
            licenses: {
                include: {
                    brand: { select: { companyName: true } }
                }
            }
        }
    });
};

/**
 * Create a new content asset
 */
export const createAsset = async (data) => {
    const {
        creatorId, collaborationId, title, type, thumbnailUrl, mediaUrl,
        platform, duration, description, pricingTiers
    } = data;

    return prisma.contentAsset.create({
        data: {
            creatorId: parseInt(creatorId),
            collaborationId: collaborationId ? parseInt(collaborationId) : null,
            title,
            type: type || 'Image',
            thumbnailUrl,
            mediaUrl,
            platform,
            duration: duration ? parseInt(duration) : null,
            description,
            pricingTiers: pricingTiers || { Organic: 0, PaidAds: 500, Website: 250 },
            isLicensable: true
        }
    });
};

/**
 * Update asset pricing/settings
 */
export const updateAsset = async (assetId, data) => {
    const { title, description, pricingTiers, isLicensable, thumbnailUrl, mediaUrl } = data;

    return prisma.contentAsset.update({
        where: { id: parseInt(assetId) },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(pricingTiers && { pricingTiers }),
            ...(isLicensable !== undefined && { isLicensable }),
            ...(thumbnailUrl && { thumbnailUrl }),
            ...(mediaUrl && { mediaUrl })
        }
    });
};

/**
 * Get brand's purchased licenses
 */
export const getBrandLicenses = async (brandId) => {
    return prisma.licenseToken.findMany({
        where: { brandId: parseInt(brandId) },
        include: {
            asset: {
                include: {
                    creator: {
                        select: {
                            fullName: true,
                            handle: true,
                            avatarUrl: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Purchase a license for content
 */
export const purchaseLicense = async (data) => {
    const { assetId, brandId, licenseType, territory, durationMonths, usageNotes } = data;

    // Get asset and pricing
    const asset = await prisma.contentAsset.findUnique({
        where: { id: parseInt(assetId) },
        include: { creator: { select: { userId: true } } }
    });

    if (!asset) throw new Error('Asset not found');
    if (!asset.isLicensable) throw new Error('Asset is not available for licensing');

    // Get price from pricing tiers
    const pricingTiers = asset.pricingTiers || {};
    const price = pricingTiers[licenseType] || 0;

    // Calculate dates
    const startDate = new Date();
    const endDate = durationMonths ? new Date() : null;
    if (endDate && durationMonths) {
        endDate.setMonth(endDate.getMonth() + parseInt(durationMonths));
    }

    // Create license token
    const license = await prisma.licenseToken.create({
        data: {
            assetId: parseInt(assetId),
            brandId: parseInt(brandId),
            licenseType: licenseType || 'Organic',
            territory: territory || 'Worldwide',
            startDate,
            endDate,
            price,
            status: price === 0 ? 'Active' : 'Pending', // Free licenses are auto-active
            usageNotes
        },
        include: {
            asset: {
                include: {
                    creator: { select: { fullName: true } }
                }
            }
        }
    });

    console.log(`[Licensing] License created: ${license.id} for asset ${assetId} by brand ${brandId}`);

    return license;
};

/**
 * Activate a pending license (after payment)
 */
export const activateLicense = async (licenseId, transactionId) => {
    return prisma.licenseToken.update({
        where: { id: parseInt(licenseId) },
        data: {
            status: 'Active',
            transactionId: transactionId ? parseInt(transactionId) : null
        }
    });
};

/**
 * Check and update expired licenses
 */
export const checkLicenseExpiry = async () => {
    const now = new Date();

    const expired = await prisma.licenseToken.updateMany({
        where: {
            status: 'Active',
            endDate: { lt: now }
        },
        data: { status: 'Expired' }
    });

    if (expired.count > 0) {
        console.log(`[Licensing] Expired ${expired.count} licenses`);
    }

    return expired.count;
};

/**
 * Get license by ID
 */
export const getLicenseById = async (licenseId) => {
    return prisma.licenseToken.findUnique({
        where: { id: parseInt(licenseId) },
        include: {
            asset: {
                include: {
                    creator: {
                        select: {
                            fullName: true,
                            handle: true,
                            avatarUrl: true
                        }
                    }
                }
            },
            brand: { select: { companyName: true } }
        }
    });
};

/**
 * Revoke a license
 */
export const revokeLicense = async (licenseId) => {
    return prisma.licenseToken.update({
        where: { id: parseInt(licenseId) },
        data: { status: 'Revoked' }
    });
};

/**
 * Delete an asset (only if no active licenses)
 */
export const deleteAsset = async (assetId) => {
    // Check for active licenses
    const activeLicenses = await prisma.licenseToken.count({
        where: {
            assetId: parseInt(assetId),
            status: 'Active'
        }
    });

    if (activeLicenses > 0) {
        throw new Error('Cannot delete asset with active licenses');
    }

    return prisma.contentAsset.delete({
        where: { id: parseInt(assetId) }
    });
};
