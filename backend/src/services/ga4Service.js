/**
 * Google Analytics 4 Integration Service
 * Handles sending events via GA4 Measurement Protocol
 */

const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const GA4_DEBUG_ENDPOINT = 'https://www.google-analytics.com/debug/mp/collect';

/**
 * Send events to GA4 via Measurement Protocol
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXX)
 * @param {string} apiSecret - GA4 API Secret
 * @param {string} clientId - Unique client identifier
 * @param {Array} events - Array of event objects
 * @param {boolean} debug - Whether to use debug endpoint
 * @returns {Promise<Object>} Response from GA4
 */
export const sendEvents = async (measurementId, apiSecret, clientId, events, debug = false) => {
    if (!measurementId || !apiSecret) {
        throw new Error('GA4 Measurement ID and API Secret are required');
    }

    const endpoint = debug ? GA4_DEBUG_ENDPOINT : GA4_ENDPOINT;
    const url = `${endpoint}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const payload = {
        client_id: clientId,
        events: events.map(event => ({
            name: event.name,
            params: {
                ...event.params,
                engagement_time_msec: event.params?.engagement_time_msec || 100
            }
        }))
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // Debug endpoint returns validation messages
    if (debug) {
        return response.json();
    }

    // Production endpoint returns empty 204
    return { success: response.ok, status: response.status };
};

/**
 * Send a purchase event to GA4
 * @param {Object} config - GA4 configuration { measurementId, apiSecret }
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Response from GA4
 */
export const sendPurchaseEvent = async (config, orderData) => {
    const { measurementId, apiSecret } = config;

    // Use order ID as client ID if no specific client ID provided
    const clientId = orderData.clientId || orderData.customerId || `order_${orderData.orderId}`;

    const events = [{
        name: 'purchase',
        params: {
            transaction_id: orderData.orderId,
            value: parseFloat(orderData.value) || 0,
            currency: orderData.currency || 'USD',
            items: (orderData.items || []).map(item => ({
                item_id: item.productId || item.sku,
                item_name: item.name || item.title,
                quantity: item.quantity || 1,
                price: parseFloat(item.price) || 0
            })),
            // Custom dimensions for attribution
            creator_code: orderData.affiliateCode,
            campaign_id: orderData.campaignId?.toString(),
            source: 'reachstakes'
        }
    }];

    return sendEvents(measurementId, apiSecret, clientId, events);
};

/**
 * Send a custom event to GA4
 * @param {Object} config - GA4 configuration
 * @param {string} eventName - Event name
 * @param {Object} params - Event parameters
 * @param {string} clientId - Client identifier
 * @returns {Promise<Object>} Response from GA4
 */
export const sendCustomEvent = async (config, eventName, params, clientId) => {
    const { measurementId, apiSecret } = config;

    const events = [{
        name: eventName,
        params: {
            ...params,
            source: 'reachstakes'
        }
    }];

    return sendEvents(measurementId, apiSecret, clientId, events);
};

/**
 * Validate GA4 configuration by sending a debug event
 * @param {string} measurementId - GA4 Measurement ID
 * @param {string} apiSecret - GA4 API Secret
 * @returns {Promise<Object>} Validation result
 */
export const validateConfig = async (measurementId, apiSecret) => {
    try {
        const result = await sendEvents(
            measurementId,
            apiSecret,
            'validation_test',
            [{
                name: 'validation_test',
                params: { test: true }
            }],
            true // Use debug endpoint
        );

        const isValid = !result.validationMessages?.length;

        return {
            success: isValid,
            validationMessages: result.validationMessages || [],
            message: isValid ? 'Configuration is valid' : 'Configuration has issues'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Generate a client ID for tracking
 * @returns {string} Unique client ID
 */
export const generateClientId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    return `${random}.${timestamp}`;
};

export default {
    sendEvents,
    sendPurchaseEvent,
    sendCustomEvent,
    validateConfig,
    generateClientId
};
