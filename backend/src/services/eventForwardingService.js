/**
 * Event Forwarding Service
 * Forwards attribution events to configured third-party integrations (GA4, Meta CAPI)
 */

import { prisma } from '../config/db.js';
import * as ga4Service from './ga4Service.js';
import * as metaCapiService from './metaCapiService.js';

/**
 * Forward a conversion event to all configured integrations for a brand
 * @param {Object} event - The attribution event object
 * @param {number} brandId - The brand's user ID
 * @returns {Object} Results from each integration
 */
export const forwardConversionEvent = async (event, brandId) => {
    const results = {
        ga4: { attempted: false, success: false, error: null },
        meta: { attempted: false, success: false, error: null }
    };

    console.log(`[EventForwarding] Starting forward for event ${event.id}, brandId: ${brandId}`);

    try {
        // Fetch all connected integrations for this brand
        const integrations = await prisma.integration.findMany({
            where: {
                brandId,
                status: 'Connected'
            }
        });

        console.log(`[EventForwarding] Found ${integrations.length} connected integrations`);

        // Forward to GA4 if connected
        const ga4Integration = integrations.find(i => i.type === 'GA4');
        if (ga4Integration) {
            results.ga4.attempted = true;
            try {
                const config = ga4Integration.config || {};
                console.log(`[EventForwarding] Forwarding to GA4 (Measurement ID: ${config.measurementId})`);

                const ga4Result = await ga4Service.sendPurchaseEvent(
                    config.measurementId,
                    config.apiSecret,
                    {
                        transactionId: event.orderId || `rsev_${event.id}`,
                        value: event.orderValue || 0,
                        currency: event.metadata?.currency || 'USD',
                        items: event.metadata?.items || [],
                        clientId: event.userHash || 'unknown'
                    }
                );

                results.ga4.success = ga4Result.success;
                results.ga4.response = ga4Result;
                console.log(`[EventForwarding] GA4 result:`, ga4Result.success ? 'SUCCESS' : 'FAILED', ga4Result);
            } catch (error) {
                results.ga4.error = error.message;
                console.error(`[EventForwarding] GA4 error:`, error.message);
            }
        } else {
            console.log(`[EventForwarding] GA4 not connected, skipping`);
        }

        // Forward to Meta CAPI if connected
        const metaIntegration = integrations.find(i => i.type === 'MetaCAPI');
        if (metaIntegration) {
            results.meta.attempted = true;
            try {
                const config = metaIntegration.config || {};
                console.log(`[EventForwarding] Forwarding to Meta CAPI (Pixel ID: ${config.pixelId})`);

                const metaResult = await metaCapiService.sendPurchaseEvent(
                    config.pixelId,
                    metaIntegration.accessToken,
                    {
                        value: event.orderValue || 0,
                        currency: event.metadata?.currency || 'USD',
                        orderId: event.orderId || `rsev_${event.id}`,
                        userHash: event.userHash,
                        eventSourceUrl: event.referrerUrl,
                        clientIpAddress: event.metadata?.ip,
                        clientUserAgent: event.metadata?.userAgent
                    }
                );

                results.meta.success = metaResult.success;
                results.meta.response = metaResult;
                console.log(`[EventForwarding] Meta CAPI result:`, metaResult.success ? 'SUCCESS' : 'FAILED', metaResult);
            } catch (error) {
                results.meta.error = error.message;
                console.error(`[EventForwarding] Meta CAPI error:`, error.message);
            }
        } else {
            console.log(`[EventForwarding] Meta CAPI not connected, skipping`);
        }

        // Log summary
        console.log(`[EventForwarding] Complete for event ${event.id}:`, {
            ga4: results.ga4.success ? '✓' : (results.ga4.attempted ? '✗' : '-'),
            meta: results.meta.success ? '✓' : (results.meta.attempted ? '✗' : '-')
        });

    } catch (error) {
        console.error(`[EventForwarding] Fatal error:`, error);
    }

    return results;
};

/**
 * Forward a click event to Meta CAPI (if configured for PageView tracking)
 * GA4 doesn't typically receive server-side click events
 * @param {Object} event - The attribution event object
 * @param {number} brandId - The brand's user ID
 */
export const forwardClickEvent = async (event, brandId) => {
    console.log(`[EventForwarding] Click event forwarding for event ${event.id} (not implemented - clicks typically handled client-side)`);
    // Click events are typically tracked client-side via pixels
    // Server-side forwarding is mainly for conversions
    return { skipped: true, reason: 'Click events handled client-side' };
};

/**
 * Test forwarding configuration by sending a test event
 * @param {number} brandId - The brand's user ID
 * @param {string} integrationType - 'GA4' or 'MetaCAPI'
 */
export const testForwarding = async (brandId, integrationType) => {
    console.log(`[EventForwarding] Testing ${integrationType} forwarding for brand ${brandId}`);

    const integration = await prisma.integration.findUnique({
        where: {
            brandId_type: { brandId, type: integrationType }
        }
    });

    if (!integration || integration.status !== 'Connected') {
        return { success: false, error: 'Integration not connected' };
    }

    // Create a test event
    const testEvent = {
        id: 'test_' + Date.now(),
        orderId: 'test_order_' + Date.now(),
        orderValue: 0.01,
        userHash: 'test_user',
        metadata: { currency: 'USD', test: true }
    };

    if (integrationType === 'GA4') {
        const config = integration.config || {};
        return await ga4Service.sendPurchaseEvent(
            config.measurementId,
            config.apiSecret,
            {
                transactionId: testEvent.orderId,
                value: testEvent.orderValue,
                currency: 'USD',
                items: [],
                clientId: 'test_client'
            }
        );
    }

    if (integrationType === 'MetaCAPI') {
        const config = integration.config || {};
        return await metaCapiService.sendPurchaseEvent(
            config.pixelId,
            integration.accessToken,
            {
                value: testEvent.orderValue,
                currency: 'USD',
                orderId: testEvent.orderId,
                userHash: 'test_user'
            }
        );
    }

    return { success: false, error: 'Unknown integration type' };
};

export default {
    forwardConversionEvent,
    forwardClickEvent,
    testForwarding
};
