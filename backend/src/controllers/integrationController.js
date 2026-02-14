/**
 * Integration Controller
 * Handles e-commerce platform connections (Shopify, GA4, Meta CAPI)
 */

import { prisma } from '../config/db.js';
import * as shopifyService from '../services/shopifyService.js';
import * as ga4Service from '../services/ga4Service.js';
import * as metaCapiService from '../services/metaCapiService.js';
import crypto from 'crypto';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * @desc    Get all integrations for the current brand
 * @route   GET /api/integrations
 * @access  Private/Brand
 */
export const getIntegrations = async (req, res) => {
    try {
        const integrations = await prisma.integration.findMany({
            where: { brandId: req.user.id },
            select: {
                id: true,
                type: true,
                status: true,
                externalId: true,
                externalName: true,
                lastSyncAt: true,
                lastError: true,
                syncCount: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Build response with all possible integration types
        const integrationTypes = ['Shopify', 'GA4', 'MetaCAPI'];
        const response = integrationTypes.map(type => {
            const existing = integrations.find(i => i.type === type);
            return existing || {
                type,
                status: 'Disconnected',
                externalId: null,
                externalName: null
            };
        });

        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Get integrations error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Initiate Shopify OAuth flow
 * @route   POST /api/integrations/shopify/auth
 * @access  Private/Brand
 */
export const initiateShopifyAuth = async (req, res) => {
    try {
        const { shop } = req.body;

        if (!shop) {
            return res.status(400).json({ error: 'Shop domain is required' });
        }

        // Normalize shop domain
        let shopDomain = shop.trim().toLowerCase();
        if (!shopDomain.includes('.myshopify.com')) {
            shopDomain = `${shopDomain}.myshopify.com`;
        }

        // Generate state token for CSRF protection
        const state = crypto.randomBytes(16).toString('hex');

        // Store state in pending integration
        await prisma.integration.upsert({
            where: {
                brandId_type: { brandId: req.user.id, type: 'Shopify' }
            },
            create: {
                brandId: req.user.id,
                type: 'Shopify',
                status: 'Pending',
                config: { state, shop: shopDomain, initiatedAt: new Date().toISOString() }
            },
            update: {
                status: 'Pending',
                config: { state, shop: shopDomain, initiatedAt: new Date().toISOString() },
                lastError: null
            }
        });

        const redirectUri = `${API_URL}/api/integrations/shopify/callback`;
        const authUrl = shopifyService.getAuthUrl(shopDomain, state, redirectUri);

        res.json({ success: true, authUrl, shop: shopDomain });
    } catch (error) {
        console.error('Initiate Shopify auth error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Handle Shopify OAuth callback
 * @route   GET /api/integrations/shopify/callback
 * @access  Public (OAuth redirect)
 */
export const handleShopifyCallback = async (req, res) => {
    try {
        const { code, shop, state, hmac } = req.query;

        if (!code || !shop || !state) {
            return res.redirect(`${FRONTEND_URL}/dashboard/settings?error=missing_params`);
        }

        // Find pending integration by state
        const integration = await prisma.integration.findFirst({
            where: {
                type: 'Shopify',
                status: 'Pending'
            }
        });

        if (!integration || integration.config?.state !== state) {
            return res.redirect(`${FRONTEND_URL}/dashboard/settings?error=invalid_state`);
        }

        // Exchange code for access token
        const tokenData = await shopifyService.exchangeCodeForToken(shop, code);

        if (!tokenData.access_token) {
            await prisma.integration.update({
                where: { id: integration.id },
                data: { status: 'Error', lastError: 'Token exchange failed' }
            });
            return res.redirect(`${FRONTEND_URL}/dashboard/settings?error=token_failed`);
        }

        // Get shop info
        let shopInfo = { shop: { name: shop.replace('.myshopify.com', '') } };
        try {
            shopInfo = await shopifyService.getShopInfo(shop, tokenData.access_token);
        } catch (e) {
            console.warn('Could not fetch shop info:', e.message);
        }

        // Register webhooks
        const webhookUrl = `${API_URL}/api/events/webhook/shopify`;
        await shopifyService.registerWebhooks(shop, tokenData.access_token, webhookUrl);

        // Update integration as connected
        await prisma.integration.update({
            where: { id: integration.id },
            data: {
                status: 'Connected',
                accessToken: tokenData.access_token,
                externalId: shop,
                externalName: shopInfo.shop?.name || shop.replace('.myshopify.com', ''),
                config: {
                    scope: tokenData.scope,
                    connectedAt: new Date().toISOString()
                },
                lastSyncAt: new Date(),
                lastError: null
            }
        });

        res.redirect(`${FRONTEND_URL}/dashboard/settings?integration=shopify&status=connected`);
    } catch (error) {
        console.error('Shopify callback error:', error);
        res.redirect(`${FRONTEND_URL}/dashboard/settings?error=connection_failed`);
    }
};

/**
 * @desc    Save GA4 configuration
 * @route   POST /api/integrations/ga4
 * @access  Private/Brand
 */
export const saveGA4Config = async (req, res) => {
    try {
        const { measurementId, apiSecret } = req.body;

        if (!measurementId || !apiSecret) {
            return res.status(400).json({ error: 'Measurement ID and API Secret are required' });
        }

        // Validate the configuration
        const validation = await ga4Service.validateConfig(measurementId, apiSecret);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid GA4 configuration',
                details: validation.validationMessages || validation.message
            });
        }

        const integration = await prisma.integration.upsert({
            where: {
                brandId_type: { brandId: req.user.id, type: 'GA4' }
            },
            create: {
                brandId: req.user.id,
                type: 'GA4',
                status: 'Connected',
                externalId: measurementId,
                externalName: `GA4 - ${measurementId}`,
                config: { measurementId, apiSecret },
                lastSyncAt: new Date()
            },
            update: {
                status: 'Connected',
                externalId: measurementId,
                externalName: `GA4 - ${measurementId}`,
                config: { measurementId, apiSecret },
                lastSyncAt: new Date(),
                lastError: null
            }
        });

        res.json({
            success: true,
            message: 'GA4 configuration saved',
            data: {
                type: integration.type,
                status: integration.status,
                externalId: integration.externalId
            }
        });
    } catch (error) {
        console.error('Save GA4 config error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Save Meta CAPI configuration
 * @route   POST /api/integrations/meta
 * @access  Private/Brand
 */
export const saveMetaConfig = async (req, res) => {
    try {
        const { pixelId, accessToken } = req.body;

        if (!pixelId || !accessToken) {
            return res.status(400).json({ error: 'Pixel ID and Access Token are required' });
        }

        // Validate the configuration
        const validation = await metaCapiService.validateConfig(pixelId, accessToken);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid Meta configuration',
                details: validation.message
            });
        }

        const integration = await prisma.integration.upsert({
            where: {
                brandId_type: { brandId: req.user.id, type: 'MetaCAPI' }
            },
            create: {
                brandId: req.user.id,
                type: 'MetaCAPI',
                status: 'Connected',
                externalId: pixelId,
                externalName: validation.pixelName || `Pixel ${pixelId}`,
                accessToken: accessToken, // Should encrypt in production
                config: { pixelId },
                lastSyncAt: new Date()
            },
            update: {
                status: 'Connected',
                externalId: pixelId,
                externalName: validation.pixelName || `Pixel ${pixelId}`,
                accessToken: accessToken,
                config: { pixelId },
                lastSyncAt: new Date(),
                lastError: null
            }
        });

        res.json({
            success: true,
            message: 'Meta configuration saved',
            data: {
                type: integration.type,
                status: integration.status,
                externalId: integration.externalId,
                externalName: integration.externalName
            }
        });
    } catch (error) {
        console.error('Save Meta config error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Disconnect an integration
 * @route   DELETE /api/integrations/:type/disconnect
 * @access  Private/Brand
 */
export const disconnectIntegration = async (req, res) => {
    try {
        const { type } = req.params;

        const integration = await prisma.integration.findUnique({
            where: {
                brandId_type: { brandId: req.user.id, type }
            }
        });

        if (!integration) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        await prisma.integration.update({
            where: { id: integration.id },
            data: {
                status: 'Disconnected',
                accessToken: null,
                refreshToken: null,
                lastError: null
            }
        });

        res.json({ success: true, message: `${type} integration disconnected` });
    } catch (error) {
        console.error('Disconnect integration error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Test an integration connection
 * @route   GET /api/integrations/:type/test
 * @access  Private/Brand
 */
export const testIntegration = async (req, res) => {
    try {
        const { type } = req.params;

        const integration = await prisma.integration.findUnique({
            where: {
                brandId_type: { brandId: req.user.id, type }
            }
        });

        if (!integration) {
            return res.status(404).json({ error: 'Integration not found' });
        }

        let testResult = { success: false, message: 'Unknown integration type' };

        if (type === 'Shopify' && integration.accessToken) {
            try {
                const orders = await shopifyService.fetchOrders(
                    integration.externalId,
                    integration.accessToken,
                    { limit: 1 }
                );
                testResult = {
                    success: true,
                    message: 'Connection successful',
                    orderCount: orders.orders?.length || 0
                };
            } catch (e) {
                testResult = { success: false, message: e.message };
            }
        }

        if (type === 'GA4') {
            const config = integration.config;
            testResult = await ga4Service.validateConfig(config?.measurementId, config?.apiSecret);
        }

        if (type === 'MetaCAPI') {
            testResult = await metaCapiService.validateConfig(
                integration.externalId,
                integration.accessToken
            );
        }

        // Update last sync time on successful test
        if (testResult.success) {
            await prisma.integration.update({
                where: { id: integration.id },
                data: { lastSyncAt: new Date(), lastError: null }
            });
        }

        res.json(testResult);
    } catch (error) {
        console.error('Test integration error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Sync historical orders from Shopify
 * @route   POST /api/integrations/shopify/sync
 * @access  Private/Brand
 */
export const syncShopifyOrders = async (req, res) => {
    try {
        const integration = await prisma.integration.findUnique({
            where: {
                brandId_type: { brandId: req.user.id, type: 'Shopify' }
            }
        });

        if (!integration || integration.status !== 'Connected') {
            return res.status(400).json({ error: 'Shopify not connected' });
        }

        const { days = 30 } = req.body;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        console.log(`[Shopify Sync] Starting sync for last ${days} days`);

        const ordersResponse = await shopifyService.fetchOrders(
            integration.externalId,
            integration.accessToken,
            {
                created_at_min: sinceDate.toISOString(),
                status: 'any',
                limit: 250
            }
        );

        const orders = ordersResponse.orders || [];
        let matchedCount = 0;
        let unmatchedCount = 0;
        let duplicateCount = 0;

        // Process each order for attribution
        for (const order of orders) {
            // Check if already recorded
            const existing = await prisma.attributionEvent.findFirst({
                where: { orderId: order.id.toString() }
            });

            if (existing) {
                duplicateCount++;
                continue;
            }

            // Try to match with tracking bundles
            let bundle = null;
            let matchedCode = null;

            // Check discount codes
            for (const discount of (order.discount_codes || [])) {
                bundle = await prisma.trackingBundle.findFirst({
                    where: {
                        OR: [
                            { couponCode: discount.code },
                            { affiliateCode: discount.code }
                        ]
                    }
                });
                if (bundle) {
                    matchedCode = discount.code;
                    break;
                }
            }

            // Check landing_site for ref parameter
            if (!bundle && order.landing_site) {
                try {
                    const url = new URL(order.landing_site, 'https://example.com');
                    const ref = url.searchParams.get('ref');
                    if (ref) {
                        bundle = await prisma.trackingBundle.findFirst({
                            where: { affiliateCode: ref }
                        });
                        if (bundle) matchedCode = ref;
                    }
                } catch (e) {
                    // Invalid URL, skip
                }
            }

            if (bundle) {
                // Record attribution event
                await prisma.attributionEvent.create({
                    data: {
                        trackingBundleId: bundle.id,
                        eventType: 'Purchase',
                        eventSource: 'Sync',
                        eventTimestamp: new Date(order.created_at),
                        orderValue: parseFloat(order.total_price || 0),
                        orderId: order.id.toString(),
                        rawPayload: {
                            orderNumber: order.order_number,
                            lineItems: order.line_items?.length || 0,
                            currency: order.currency,
                            matchedCode,
                            syncedAt: new Date().toISOString()
                        }
                    }
                });
                matchedCount++;
                console.log(`[Shopify Sync] Matched order ${order.order_number} with code: ${matchedCode}`);
            } else {
                unmatchedCount++;
            }
        }

        // Update sync metadata
        await prisma.integration.update({
            where: { id: integration.id },
            data: {
                syncCount: { increment: 1 },
                lastSyncAt: new Date()
            }
        });

        console.log(`[Shopify Sync] Complete: ${matchedCount} matched, ${unmatchedCount} unmatched, ${duplicateCount} duplicates`);

        res.json({
            success: true,
            message: `Synced ${orders.length} orders`,
            stats: {
                total: orders.length,
                matched: matchedCount,
                unmatched: unmatchedCount,
                duplicates: duplicateCount
            }
        });
    } catch (error) {
        console.error('Sync Shopify orders error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @desc    Create a discount code in Shopify
 * @route   POST /api/integrations/shopify/discount
 * @access  Private/Brand
 */
export const createDiscountCode = async (req, res) => {
    try {
        const { code, discountType = 'percentage', discountValue = 10, usageLimit } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Discount code is required' });
        }

        const integration = await prisma.integration.findUnique({
            where: {
                brandId_type: { brandId: req.user.id, type: 'Shopify' }
            }
        });

        if (!integration || integration.status !== 'Connected') {
            return res.status(400).json({ error: 'Shopify not connected' });
        }

        console.log(`[Shopify] Creating discount code: ${code}`);

        const result = await shopifyService.createDiscountCode(
            integration.externalId,
            integration.accessToken,
            {
                code: code.toUpperCase(),
                discountType, // 'percentage' or 'fixed_amount'
                discountValue,
                usageLimit
            }
        );

        res.json({
            success: true,
            message: 'Discount code created',
            data: result
        });
    } catch (error) {
        console.error('Create discount code error:', error);
        res.status(500).json({ error: error.message });
    }
};

