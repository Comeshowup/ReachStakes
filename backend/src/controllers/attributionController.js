import { prisma } from "../config/db.js";
import attributionService from "../services/attributionService.js";

/**
 * @desc    Generate tracking bundle for a collaboration
 * @route   POST /api/attribution/generate/:collaborationId
 * @access  Private/Brand
 */
export const generateBundle = async (req, res) => {
    try {
        const { collaborationId } = req.params;

        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: parseInt(collaborationId) },
            include: { campaign: true }
        });

        if (!collab) {
            return res.status(404).json({ error: "Collaboration not found" });
        }

        // Verify ownership - brand must own the campaign
        if (collab.campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const bundle = await attributionService.generateTrackingBundle(
            parseInt(collaborationId)
        );

        res.status(201).json({
            success: true,
            data: bundle,
            message: "Tracking bundle generated successfully"
        });
    } catch (error) {
        console.error("Generate bundle error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get tracking bundle for a collaboration
 * @route   GET /api/attribution/bundle/:collaborationId
 * @access  Private
 */
export const getBundle = async (req, res) => {
    try {
        const { collaborationId } = req.params;

        const bundle = await prisma.trackingBundle.findUnique({
            where: { collaborationId: parseInt(collaborationId) },
            include: {
                campaign: { select: { title: true, brandId: true, status: true } },
                creator: {
                    select: {
                        name: true,
                        creatorProfile: { select: { handle: true, avatarUrl: true } }
                    }
                }
            }
        });

        if (!bundle) {
            return res.status(404).json({ error: "Tracking bundle not found" });
        }

        // Verify access - must be brand owner or the creator
        if (bundle.campaign.brandId !== req.user.id && bundle.creatorId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        res.json({ success: true, data: bundle });
    } catch (error) {
        console.error("Get bundle error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get all tracking bundles for a campaign
 * @route   GET /api/attribution/campaign/:campaignId/bundles
 * @access  Private/Brand
 */
export const getCampaignBundles = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const bundles = await attributionService.getCampaignBundles(parseInt(campaignId));

        res.json({ success: true, data: bundles });
    } catch (error) {
        console.error("Get campaign bundles error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get attribution results for a campaign
 * @route   GET /api/attribution/results/:campaignId
 * @access  Private/Brand
 */
export const getCampaignResults = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const results = await prisma.attributionResult.findMany({
            where: { campaignId: parseInt(campaignId) },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        creatorProfile: {
                            select: { handle: true, avatarUrl: true, verificationTier: true }
                        }
                    }
                },
                collaboration: {
                    select: { agreedPrice: true, status: true }
                }
            },
            orderBy: { totalRevenue: "desc" }
        });

        // Calculate campaign totals
        const totals = results.reduce((acc, r) => ({
            totalClicks: acc.totalClicks + (r.totalClicks || 0),
            totalConversions: acc.totalConversions + (r.totalConversions || 0),
            totalRevenue: acc.totalRevenue + parseFloat(r.totalRevenue || 0),
            totalSpend: acc.totalSpend + parseFloat(r.creatorCost || 0)
        }), { totalClicks: 0, totalConversions: 0, totalRevenue: 0, totalSpend: 0 });

        totals.overallRoas = totals.totalSpend > 0
            ? parseFloat((totals.totalRevenue / totals.totalSpend).toFixed(2))
            : 0;

        totals.overallConversionRate = totals.totalClicks > 0
            ? parseFloat(((totals.totalConversions / totals.totalClicks) * 100).toFixed(2))
            : 0;

        res.json({
            success: true,
            data: {
                results,
                totals,
                attributionModel: "last_click",
                attributionWindow: campaign.attributionWindow || 14
            }
        });
    } catch (error) {
        console.error("Get campaign results error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get creator's attribution performance
 * @route   GET /api/attribution/results/creator/:creatorId
 * @access  Private/Creator
 */
export const getCreatorResults = async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Allow creator to view their own or admins
        if (parseInt(creatorId) !== req.user.id && req.userRole !== "admin") {
            return res.status(403).json({ error: "Not authorized" });
        }

        const results = await prisma.attributionResult.findMany({
            where: { creatorId: parseInt(creatorId) },
            include: {
                campaign: {
                    select: { id: true, title: true, status: true }
                }
            },
            orderBy: { updatedAt: "desc" }
        });

        // Calculate lifetime stats
        const lifetime = results.reduce((acc, r) => ({
            totalRevenue: acc.totalRevenue + parseFloat(r.totalRevenue || 0),
            totalConversions: acc.totalConversions + (r.totalConversions || 0),
            totalClicks: acc.totalClicks + (r.totalClicks || 0),
            campaignCount: acc.campaignCount + 1
        }), { totalRevenue: 0, totalConversions: 0, totalClicks: 0, campaignCount: 0 });

        // Calculate lifetime metrics
        lifetime.averageRoas = results.length > 0
            ? parseFloat((results.reduce((sum, r) => sum + parseFloat(r.roas || 0), 0) / results.length).toFixed(2))
            : 0;

        res.json({
            success: true,
            data: {
                results,
                lifetime,
                headline: `You've generated ₹${lifetime.totalRevenue.toLocaleString()} in tracked revenue`
            }
        });
    } catch (error) {
        console.error("Get creator results error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get my tracking bundles (for creators)
 * @route   GET /api/attribution/my-bundles
 * @access  Private/Creator
 */
export const getMyBundles = async (req, res) => {
    try {
        const bundles = await attributionService.getCreatorBundles(req.user.id);

        res.json({ success: true, data: bundles });
    } catch (error) {
        console.error("Get my bundles error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Generate bundles for all approved collaborations in a campaign
 * @route   POST /api/attribution/campaign/:campaignId/generate-all
 * @access  Private/Brand
 */
export const generateAllBundles = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Find all collaborations that are In Progress or Approved
        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                campaignId: parseInt(campaignId),
                status: { in: ["In_Progress", "Approved", "Under_Review"] }
            }
        });

        const results = [];
        const errors = [];

        for (const collab of collaborations) {
            try {
                const bundle = await attributionService.generateTrackingBundle(collab.id);
                results.push({ collaborationId: collab.id, bundle });
            } catch (err) {
                errors.push({ collaborationId: collab.id, error: err.message });
            }
        }

        res.json({
            success: true,
            data: {
                generated: results.length,
                errors: errors.length,
                bundles: results,
                errorDetails: errors
            }
        });
    } catch (error) {
        console.error("Generate all bundles error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get revenue timeline for a campaign (for charts)
 * @route   GET /api/attribution/timeline/:campaignId
 * @access  Private/Brand
 */
export const getRevenueTimeline = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { days = 30 } = req.query;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Get all events for this campaign's bundles in the last N days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const timeline = await prisma.$queryRaw`
            SELECT 
                DATE(ae.event_timestamp) as date,
                CAST(SUM(CASE WHEN ae.event_type = 'Click' THEN 1 ELSE 0 END) AS UNSIGNED) as clicks,
                CAST(SUM(CASE WHEN ae.event_type = 'Purchase' THEN 1 ELSE 0 END) AS UNSIGNED) as conversions,
                CAST(COALESCE(SUM(CASE WHEN ae.event_type = 'Purchase' THEN ae.order_value ELSE 0 END), 0) AS DECIMAL(12,2)) as revenue
            FROM attribution_events ae
            JOIN tracking_bundles tb ON ae.tracking_bundle_id = tb.id
            WHERE tb.campaign_id = ${parseInt(campaignId)}
              AND ae.event_timestamp >= ${startDate}
            GROUP BY DATE(ae.event_timestamp)
            ORDER BY date ASC
        `;

        // Convert BigInt to Number for JSON serialization
        const formattedTimeline = timeline.map(row => ({
            date: row.date,
            clicks: Number(row.clicks),
            conversions: Number(row.conversions),
            revenue: Number(row.revenue)
        }));

        res.json({
            success: true,
            data: {
                timeline: formattedTimeline,
                days: parseInt(days),
                campaignId: parseInt(campaignId)
            }
        });
    } catch (error) {
        console.error("Get timeline error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Get detailed attribution for a specific creator in a campaign
 * @route   GET /api/attribution/detail/:campaignId/:creatorId
 * @access  Private/Brand
 */
export const getCreatorAttributionDetail = async (req, res) => {
    try {
        const { campaignId, creatorId } = req.params;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Get attribution result
        const result = await prisma.attributionResult.findFirst({
            where: {
                campaignId: parseInt(campaignId),
                creatorId: parseInt(creatorId)
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        creatorProfile: {
                            select: { handle: true, avatarUrl: true, verificationTier: true }
                        }
                    }
                },
                collaboration: {
                    select: { agreedPrice: true, status: true, submissionUrl: true }
                }
            }
        });

        if (!result) {
            return res.status(404).json({ error: "Attribution result not found" });
        }

        // Get tracking bundle for event details
        const bundle = await prisma.trackingBundle.findFirst({
            where: {
                campaignId: parseInt(campaignId),
                creatorId: parseInt(creatorId)
            }
        });

        // Get recent events
        let recentEvents = [];
        if (bundle) {
            recentEvents = await prisma.attributionEvent.findMany({
                where: { trackingBundleId: bundle.id },
                orderBy: { eventTimestamp: 'desc' },
                take: 20
            });
        }

        // Get daily breakdown for last 14 days
        let dailyStats = [];
        if (bundle) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 14);

            const rawStats = await prisma.$queryRaw`
                SELECT 
                    DATE(event_timestamp) as date,
                    CAST(SUM(CASE WHEN event_type = 'Click' THEN 1 ELSE 0 END) AS UNSIGNED) as clicks,
                    CAST(SUM(CASE WHEN event_type = 'Purchase' THEN 1 ELSE 0 END) AS UNSIGNED) as conversions,
                    CAST(COALESCE(SUM(CASE WHEN event_type = 'Purchase' THEN order_value ELSE 0 END), 0) AS DECIMAL(12,2)) as revenue
                FROM attribution_events
                WHERE tracking_bundle_id = ${bundle.id}
                  AND event_timestamp >= ${startDate}
                GROUP BY DATE(event_timestamp)
                ORDER BY date ASC
            `;

            // Convert BigInt to Number for JSON serialization
            dailyStats = rawStats.map(row => ({
                date: row.date,
                clicks: Number(row.clicks),
                conversions: Number(row.conversions),
                revenue: Number(row.revenue)
            }));
        }

        res.json({
            success: true,
            data: {
                result,
                recentEvents,
                dailyStats,
                trackingBundle: bundle ? {
                    affiliateCode: bundle.affiliateCode,
                    trackingUrl: bundle.trackingUrl,
                    shortLinkUrl: bundle.shortLinkUrl,
                    createdAt: bundle.createdAt
                } : null
            }
        });
    } catch (error) {
        console.error("Get creator detail error:", error);
        res.status(500).json({ error: error.message });
    }
};
