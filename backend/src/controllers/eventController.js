import { prisma } from "../config/db.js";
import attributionService from "../services/attributionService.js";
import * as liftTestService from "../services/liftTestService.js";
import crypto from "crypto";

// Generate privacy-safe user hash
const hashUser = (identifier) => {
    if (!identifier) return null;
    return crypto.createHash("sha256").update(identifier).digest("hex").slice(0, 32);
};

// Detect device type from user agent
const detectDeviceType = (userAgent) => {
    if (!userAgent) return "unknown";
    userAgent = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) return "mobile";
    if (/tablet|ipad/i.test(userAgent)) return "tablet";
    return "desktop";
};

/**
 * @desc    Track click event from short link redirect
 * @route   GET /api/events/track/:shortCode
 * @access  Public
 */
export const trackClick = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const bundle = await attributionService.findBundleByCode(shortCode, "shortlink");

        if (!bundle) {
            // Fallback to homepage if bundle not found
            return res.redirect("https://reachstakes.com");
        }

        // Record click event asynchronously (don't block redirect)
        setImmediate(async () => {
            try {
                await attributionService.recordEvent({
                    trackingBundleId: bundle.id,
                    eventType: "Click",
                    eventSource: "UTM",
                    userHash: hashUser(req.ip + (req.headers["user-agent"] || "")),
                    sessionId: req.query.sid || null,
                    ipCountry: req.headers["cf-ipcountry"] || null, // Cloudflare header
                    deviceType: detectDeviceType(req.headers["user-agent"]),
                    referrerUrl: req.headers["referer"] || null,
                    metadata: {
                        ip: req.ip,
                        userAgent: req.headers["user-agent"],
                        referer: req.headers["referer"],
                        query: req.query
                    }
                });
            } catch (err) {
                console.error("Failed to record click event:", err);
            }
        });

        // Redirect to tracking URL immediately
        res.redirect(bundle.trackingUrl);
    } catch (error) {
        console.error("Track click error:", error);
        res.redirect("https://reachstakes.com");
    }
};

/**
 * @desc    Track a general event (click, page view, etc.)
 * @route   POST /api/events/track
 * @access  Public (with optional API key)
 */
export const trackEvent = async (req, res) => {
    try {
        const {
            eventType,
            affiliateCode,
            couponCode,
            shortCode,
            sessionId,
            pageUrl
        } = req.body;

        // Find bundle by any available code
        let bundle = null;
        if (affiliateCode) {
            bundle = await attributionService.findBundleByCode(affiliateCode, "affiliate");
        } else if (shortCode) {
            bundle = await attributionService.findBundleByCode(shortCode, "shortlink");
        } else if (couponCode) {
            bundle = await attributionService.findBundleByCode(couponCode, "coupon");
        }

        if (!bundle) {
            return res.status(404).json({ error: "Tracking code not found" });
        }

        const event = await attributionService.recordEvent({
            trackingBundleId: bundle.id,
            eventType: eventType || "PageView",
            eventSource: "Pixel",
            userHash: hashUser(req.ip + (req.headers["user-agent"] || "")),
            sessionId,
            ipCountry: req.headers["cf-ipcountry"] || null,
            deviceType: detectDeviceType(req.headers["user-agent"]),
            referrerUrl: pageUrl,
            metadata: req.body
        });

        res.status(201).json({
            success: true,
            eventId: event.id
        });
    } catch (error) {
        console.error("Track event error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Record conversion event
 * @route   POST /api/events/conversion
 * @access  Public (with API key recommended)
 */
export const recordConversion = async (req, res) => {
    try {
        const {
            affiliateCode,
            couponCode,
            orderValue,
            orderId,
            currency,
            customerEmail,
            customerPhone
        } = req.body;

        // Validate required fields
        if (!orderValue || (!affiliateCode && !couponCode)) {
            return res.status(400).json({
                error: "orderValue and either affiliateCode or couponCode are required"
            });
        }

        // Find bundle by affiliate or coupon code
        let bundle = null;
        let eventSource = "Affiliate";

        if (affiliateCode) {
            bundle = await attributionService.findBundleByCode(affiliateCode, "affiliate");
            eventSource = "Affiliate";
        }

        if (!bundle && couponCode) {
            bundle = await attributionService.findBundleByCode(couponCode, "coupon");
            eventSource = "Coupon";
        }

        if (!bundle) {
            return res.status(404).json({
                error: "Tracking code not found",
                codes: { affiliateCode, couponCode }
            });
        }

        // Check for duplicate order
        if (orderId) {
            const existingEvent = await prisma.attributionEvent.findFirst({
                where: { orderId: orderId.toString() }
            });

            if (existingEvent) {
                return res.status(200).json({
                    success: true,
                    message: "Order already recorded",
                    duplicate: true,
                    eventId: existingEvent.id
                });
            }
        }

        // Record purchase event
        const event = await attributionService.recordEvent({
            trackingBundleId: bundle.id,
            eventType: "Purchase",
            eventSource,
            orderValue: parseFloat(orderValue),
            orderId: orderId?.toString(),
            userHash: hashUser(customerEmail || customerPhone),
            metadata: {
                ...req.body,
                recordedAt: new Date().toISOString()
            }
        });

        res.status(201).json({
            success: true,
            message: "Conversion recorded",
            eventId: event.id,
            attribution: {
                campaignId: bundle.campaignId,
                creatorId: bundle.creatorId,
                creatorHandle: bundle.creator?.creatorProfile?.handle
            }
        });
    } catch (error) {
        console.error("Record conversion error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Shopify order webhook
 * @route   POST /api/events/webhook/shopify
 * @access  Public (verified by HMAC)
 */
export const shopifyWebhook = async (req, res) => {
    try {
        // Verify Shopify HMAC signature for security
        const hmac = req.headers['x-shopify-hmac-sha256'];
        const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

        if (webhookSecret && hmac) {
            // rawBody should be set by express.raw() middleware for this route
            const rawBody = req.rawBody || JSON.stringify(req.body);
            const calculatedHmac = crypto
                .createHmac('sha256', webhookSecret)
                .update(rawBody, 'utf8')
                .digest('base64');

            if (hmac !== calculatedHmac) {
                console.warn('[Shopify Webhook] HMAC verification failed');
                return res.status(401).json({ error: 'Invalid signature' });
            }
            console.log('[Shopify Webhook] HMAC verified successfully');
        } else if (webhookSecret) {
            console.warn('[Shopify Webhook] No HMAC header present, skipping verification');
        } else {
            console.log('[Shopify Webhook] SHOPIFY_WEBHOOK_SECRET not set, skipping verification');
        }

        const order = req.body;

        if (!order || !order.id) {
            return res.status(200).json({ received: true, error: "Invalid order data" });
        }

        // Check for duplicate order
        const existingEvent = await prisma.attributionEvent.findFirst({
            where: { orderId: order.id.toString() }
        });

        if (existingEvent) {
            return res.status(200).json({ received: true, duplicate: true });
        }

        // Extract discount codes from order
        const discountCodes = order.discount_codes || [];
        let bundle = null;
        let matchedCode = null;

        // Check each discount code against our tracking bundles
        for (const discount of discountCodes) {
            bundle = await attributionService.findBundleByCode(discount.code, "coupon");
            if (bundle) {
                matchedCode = discount.code;
                break;
            }
            bundle = await attributionService.findBundleByCode(discount.code, "affiliate");
            if (bundle) {
                matchedCode = discount.code;
                break;
            }
        }

        // Also check UTM in landing page if no discount code match
        if (!bundle && order.landing_site) {
            try {
                const url = new URL(order.landing_site, "https://example.com");
                const ref = url.searchParams.get("ref");
                if (ref) {
                    bundle = await attributionService.findBundleByCode(ref, "affiliate");
                    matchedCode = ref;
                }
            } catch (err) {
                // Invalid URL, skip
            }
        }

        if (bundle) {
            await attributionService.recordEvent({
                trackingBundleId: bundle.id,
                eventType: "Purchase",
                eventSource: "Webhook",
                orderValue: parseFloat(order.total_price || 0),
                orderId: order.id.toString(),
                userHash: hashUser(order.email),
                metadata: {
                    shopifyOrderId: order.id,
                    orderNumber: order.order_number,
                    lineItems: order.line_items?.length || 0,
                    currency: order.currency,
                    matchedCode,
                    financialStatus: order.financial_status
                }
            });

            // === LIFT TEST INTEGRATION ===
            // Record this conversion to any active lift tests for the campaign
            try {
                const userIdentifier = hashUser(order.email);
                const userRegion = order.shipping_address?.province_code || order.shipping_address?.country_code || 'Unknown';

                // Get active lift tests for this campaign
                const activeLiftTests = await prisma.liftTest.findMany({
                    where: {
                        campaignId: bundle.campaignId,
                        status: 'Running'
                    },
                    include: {
                        groups: true
                    }
                });

                // For each active lift test, record the conversion to the appropriate group
                for (const liftTest of activeLiftTests) {
                    try {
                        // Determine which group this user belongs to
                        const assignedGroup = await liftTestService.assignUserToGroup(
                            liftTest.id,
                            { userId: userIdentifier, region: userRegion }
                        );

                        if (assignedGroup) {
                            // Record the conversion event for this group
                            await liftTestService.recordGroupEvent(
                                assignedGroup.groupId,
                                'conversion',
                                parseFloat(order.total_price || 0)
                            );
                            // Also record revenue
                            await liftTestService.recordGroupEvent(
                                assignedGroup.groupId,
                                'revenue',
                                parseFloat(order.total_price || 0)
                            );
                            console.log(`[Lift Test] Recorded conversion for group ${assignedGroup.groupType} in test ${liftTest.name}`);
                        }
                    } catch (liftErr) {
                        console.error(`[Lift Test] Failed to record for test ${liftTest.id}:`, liftErr);
                    }
                }
            } catch (liftErr) {
                console.error('[Lift Test] Integration error:', liftErr);
                // Don't fail the webhook for lift test errors
            }

            console.log(`[Shopify Webhook] Recorded conversion for order ${order.order_number}, code: ${matchedCode}`);
        } else {
            console.log(`[Shopify Webhook] No matching tracking code for order ${order.order_number}`);
        }

        res.status(200).json({ received: true, attributed: !!bundle });
    } catch (error) {
        console.error("Shopify webhook error:", error);
        // Always return 200 for webhooks to prevent retries
        res.status(200).json({ received: true, error: error.message });
    }
};

/**
 * @desc    Get events for a tracking bundle (for debugging/admin)
 * @route   GET /api/events/bundle/:bundleId
 * @access  Private
 */
export const getBundleEvents = async (req, res) => {
    try {
        const { bundleId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const bundle = await prisma.trackingBundle.findUnique({
            where: { id: parseInt(bundleId) },
            include: { campaign: true }
        });

        if (!bundle) {
            return res.status(404).json({ error: "Bundle not found" });
        }

        // Check authorization
        if (bundle.campaign.brandId !== req.user.id && bundle.creatorId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const events = await prisma.attributionEvent.findMany({
            where: { trackingBundleId: parseInt(bundleId) },
            orderBy: { eventTimestamp: "desc" },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalCount = await prisma.attributionEvent.count({
            where: { trackingBundleId: parseInt(bundleId) }
        });

        res.json({
            success: true,
            data: {
                events,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            }
        });
    } catch (error) {
        console.error("Get bundle events error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Tracking pixel endpoint (for client-side tracking)
 * @route   GET /api/events/pixel.gif
 * @access  Public
 */
export const trackingPixel = async (req, res) => {
    try {
        const { ref, e: eventType, sid } = req.query;

        if (ref) {
            const bundle = await attributionService.findBundleByCode(ref, "affiliate");

            if (bundle) {
                // Record event asynchronously
                setImmediate(async () => {
                    try {
                        await attributionService.recordEvent({
                            trackingBundleId: bundle.id,
                            eventType: eventType || "PageView",
                            eventSource: "Pixel",
                            userHash: hashUser(req.ip + (req.headers["user-agent"] || "")),
                            sessionId: sid,
                            ipCountry: req.headers["cf-ipcountry"] || null,
                            deviceType: detectDeviceType(req.headers["user-agent"]),
                            referrerUrl: req.headers["referer"],
                            metadata: { query: req.query }
                        });
                    } catch (err) {
                        console.error("Failed to record pixel event:", err);
                    }
                });
            }
        }

        // Return 1x1 transparent GIF
        const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.send(gif);
    } catch (error) {
        console.error("Tracking pixel error:", error);
        // Still return the gif even on error
        const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.set('Content-Type', 'image/gif');
        res.send(gif);
    }
};
