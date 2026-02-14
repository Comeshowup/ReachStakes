import { prisma } from "../config/db.js";
import crypto from "crypto";
import * as eventForwardingService from "./eventForwardingService.js";

// Generate unique codes
const generateAffiliateCode = (handle, length = 8) => {
    const prefix = handle.slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const random = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `${prefix}${random}`.slice(0, 8);
};

const generateShortCode = () => {
    return crypto.randomBytes(4).toString("base64url").slice(0, 7);
};

const generateServerToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// Build UTM URL
const buildTrackingUrl = (baseUrl, bundle) => {
    try {
        const url = new URL(baseUrl);
        url.searchParams.set("utm_source", bundle.utmSource);
        url.searchParams.set("utm_medium", bundle.utmMedium);
        url.searchParams.set("utm_campaign", bundle.utmCampaign);
        url.searchParams.set("utm_content", bundle.utmContent);
        url.searchParams.set("ref", bundle.affiliateCode);
        return url.toString();
    } catch (err) {
        // If baseUrl is invalid, return with params appended
        const params = new URLSearchParams({
            utm_source: bundle.utmSource,
            utm_medium: bundle.utmMedium,
            utm_campaign: bundle.utmCampaign,
            utm_content: bundle.utmContent,
            ref: bundle.affiliateCode
        });
        return `${baseUrl}?${params.toString()}`;
    }
};

/**
 * Generate tracking bundle for a collaboration
 * @param {number} collaborationId - The collaboration ID
 * @returns {Promise<TrackingBundle>} The created or existing tracking bundle
 */
export const generateTrackingBundle = async (collaborationId) => {
    // Get collaboration with campaign and creator
    const collab = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: {
            campaign: {
                include: {
                    brand: { include: { brandProfile: true } }
                }
            },
            creator: { include: { creatorProfile: true } }
        }
    });

    if (!collab) {
        throw new Error("Collaboration not found");
    }

    // Check if bundle already exists
    const existing = await prisma.trackingBundle.findUnique({
        where: { collaborationId }
    });

    if (existing) {
        return existing;
    }

    const creatorHandle = collab.creator.creatorProfile?.handle || `creator${collab.creatorId}`;
    const campaignSlug = collab.campaign.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 50);
    const brandName = collab.campaign.brand.brandProfile?.companyName || "brand";

    // Generate unique codes
    const affiliateCode = generateAffiliateCode(creatorHandle);
    const shortLinkCode = generateShortCode();
    const serverToken = generateServerToken();

    // Build UTM parameters
    const utmSource = "reachstakes";
    const utmMedium = "influencer";
    const utmCampaign = campaignSlug;
    const utmContent = creatorHandle;

    // Build full tracking URL
    const baseUrl = collab.campaign.baseTrackingUrl ||
        collab.campaign.brand.brandProfile?.websiteUrl ||
        "https://example.com";

    const trackingUrl = buildTrackingUrl(baseUrl, {
        utmSource, utmMedium, utmCampaign, utmContent, affiliateCode
    });

    // Short link URL (using your domain - update this to your actual domain)
    const shortLinkUrl = `https://reachstakes.com/r/${shortLinkCode}`;

    // Create tracking bundle
    const bundle = await prisma.trackingBundle.create({
        data: {
            campaignId: collab.campaignId,
            creatorId: collab.creatorId,
            collaborationId,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
            affiliateCode,
            shortLinkCode,
            serverToken,
            trackingUrl,
            shortLinkUrl
        }
    });

    // Initialize attribution result
    await prisma.attributionResult.create({
        data: {
            campaignId: collab.campaignId,
            creatorId: collab.creatorId,
            collaborationId,
            creatorCost: collab.agreedPrice || 0,
            attributionWindow: collab.campaign.attributionWindow || 14
        }
    });

    return bundle;
};

/**
 * Record an attribution event
 * @param {Object} eventData - The event data to record
 * @returns {Promise<AttributionEvent>} The created event
 */
export const recordEvent = async (eventData) => {
    const {
        trackingBundleId,
        eventType,
        eventSource,
        orderValue,
        orderId,
        userHash,
        sessionId,
        ipCountry,
        deviceType,
        referrerUrl,
        metadata
    } = eventData;

    // Create event record
    const event = await prisma.attributionEvent.create({
        data: {
            trackingBundleId,
            eventType,
            eventSource,
            eventTimestamp: new Date(),
            orderValue: orderValue ? parseFloat(orderValue) : null,
            orderId,
            userHash,
            sessionId,
            ipCountry,
            deviceType,
            referrerUrl,
            rawPayload: metadata
        }
    });

    // Update attribution result
    await updateAttributionResult(trackingBundleId, eventType, orderValue);

    // Forward Purchase events to connected integrations (GA4, Meta CAPI)
    if (eventType === "Purchase") {
        // Get the campaign's brand ID for integration lookup
        const bundle = await prisma.trackingBundle.findUnique({
            where: { id: trackingBundleId },
            include: { campaign: true }
        });

        if (bundle?.campaign?.brandId) {
            // Forward asynchronously - don't block the response
            setImmediate(async () => {
                try {
                    await eventForwardingService.forwardConversionEvent(event, bundle.campaign.brandId);
                } catch (err) {
                    console.error('[Attribution] Event forwarding failed:', err.message);
                }
            });
        }

        // Record to active lift test groups (for Geographic/RandomSplit tests)
        if (bundle?.campaignId) {
            setImmediate(async () => {
                try {
                    // Find running lift tests for this campaign
                    const activeLiftTests = await prisma.liftTest.findMany({
                        where: {
                            campaignId: bundle.campaignId,
                            status: 'Running',
                            testType: { in: ['Geographic', 'RandomSplit'] }
                        },
                        include: { groups: true }
                    });

                    for (const test of activeLiftTests) {
                        // Determine which group this event belongs to
                        const testGroup = test.groups.find(g => g.groupType === 'Test');

                        if (testGroup) {
                            // For Geographic tests, check if ipCountry matches test regions
                            if (test.testType === 'Geographic' && testGroup.regions) {
                                const regions = Array.isArray(testGroup.regions) ? testGroup.regions : [];
                                if (regions.includes(ipCountry)) {
                                    await prisma.liftTestGroup.update({
                                        where: { id: testGroup.id },
                                        data: {
                                            conversions: { increment: 1 },
                                            revenue: { increment: parseFloat(orderValue) || 0 }
                                        }
                                    });
                                    console.log(`[LiftTest] Recorded conversion to test group for test ${test.id}`);
                                } else {
                                    // Record to control group
                                    const controlGroup = test.groups.find(g => g.groupType === 'Control');
                                    if (controlGroup) {
                                        await prisma.liftTestGroup.update({
                                            where: { id: controlGroup.id },
                                            data: {
                                                conversions: { increment: 1 },
                                                revenue: { increment: parseFloat(orderValue) || 0 }
                                            }
                                        });
                                    }
                                }
                            } else {
                                // For RandomSplit, use hash-based assignment
                                const hash = userHash || sessionId || String(Math.random());
                                const bucket = Math.abs(hashCode(hash + test.id)) % 100;
                                const testPct = testGroup.percentage || 50;

                                const targetGroup = bucket < testPct ? testGroup : test.groups.find(g => g.groupType === 'Control');
                                if (targetGroup) {
                                    await prisma.liftTestGroup.update({
                                        where: { id: targetGroup.id },
                                        data: {
                                            conversions: { increment: 1 },
                                            revenue: { increment: parseFloat(orderValue) || 0 }
                                        }
                                    });
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('[Attribution] Lift test recording failed:', err.message);
                }
            });
        }
    }

    return event;
};

// Simple hash function for consistent random assignment
const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return hash;
};

/**
 * Update attribution results after an event
 * @param {number} trackingBundleId - The tracking bundle ID
 * @param {string} eventType - The type of event
 * @param {number} orderValue - The order value (for purchases)
 */
const updateAttributionResult = async (trackingBundleId, eventType, orderValue) => {
    const bundle = await prisma.trackingBundle.findUnique({
        where: { id: trackingBundleId }
    });

    if (!bundle) return;

    const updateData = {
        lastCalculatedAt: new Date()
    };

    if (eventType === "Click") {
        updateData.totalClicks = { increment: 1 };
    }

    if (eventType === "Purchase" && orderValue) {
        updateData.totalConversions = { increment: 1 };
        updateData.totalRevenue = { increment: parseFloat(orderValue) };
    }

    await prisma.attributionResult.update({
        where: { collaborationId: bundle.collaborationId },
        data: updateData
    });

    // Recalculate derived metrics
    await recalculateMetrics(bundle.collaborationId);
};

/**
 * Recalculate ROI metrics for a collaboration
 * @param {number} collaborationId - The collaboration ID
 */
export const recalculateMetrics = async (collaborationId) => {
    const result = await prisma.attributionResult.findUnique({
        where: { collaborationId }
    });

    if (!result) return;

    const totalClicks = result.totalClicks || 0;
    const totalConversions = result.totalConversions || 0;
    const totalRevenue = parseFloat(result.totalRevenue) || 0;
    const creatorCost = parseFloat(result.creatorCost) || 0;

    const conversionRate = totalClicks > 0
        ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2))
        : 0;

    const roas = creatorCost > 0
        ? parseFloat((totalRevenue / creatorCost).toFixed(2))
        : 0;

    const costPerConversion = totalConversions > 0
        ? parseFloat((creatorCost / totalConversions).toFixed(2))
        : 0;

    const averageOrderValue = totalConversions > 0
        ? parseFloat((totalRevenue / totalConversions).toFixed(2))
        : 0;

    await prisma.attributionResult.update({
        where: { collaborationId },
        data: {
            conversionRate,
            roas,
            costPerConversion,
            averageOrderValue,
            calculationNotes: `Last calculated: ${new Date().toISOString()}`
        }
    });
};

/**
 * Find tracking bundle by code
 * @param {string} code - The code to search for
 * @param {string} codeType - The type of code ('affiliate', 'coupon', 'shortlink')
 * @returns {Promise<TrackingBundle|null>} The found bundle or null
 */
export const findBundleByCode = async (code, codeType) => {
    const whereClause = { isActive: true };

    switch (codeType) {
        case "affiliate":
            whereClause.affiliateCode = code;
            break;
        case "coupon":
            whereClause.couponCode = code;
            break;
        case "shortlink":
            whereClause.shortLinkCode = code;
            break;
        default:
            return null;
    }

    return prisma.trackingBundle.findFirst({
        where: whereClause,
        include: {
            campaign: true,
            creator: { include: { creatorProfile: true } }
        }
    });
};

/**
 * Get all tracking bundles for a campaign
 * @param {number} campaignId - The campaign ID
 * @returns {Promise<TrackingBundle[]>} Array of tracking bundles
 */
export const getCampaignBundles = async (campaignId) => {
    return prisma.trackingBundle.findMany({
        where: { campaignId },
        include: {
            creator: {
                select: {
                    name: true,
                    creatorProfile: { select: { handle: true, avatarUrl: true } }
                }
            }
        }
    });
};

/**
 * Get all tracking bundles for a creator
 * @param {number} creatorId - The creator ID
 * @returns {Promise<TrackingBundle[]>} Array of tracking bundles
 */
export const getCreatorBundles = async (creatorId) => {
    return prisma.trackingBundle.findMany({
        where: { creatorId },
        include: {
            campaign: { select: { title: true, status: true } }
        }
    });
};

export default {
    generateTrackingBundle,
    recordEvent,
    findBundleByCode,
    recalculateMetrics,
    getCampaignBundles,
    getCreatorBundles
};
