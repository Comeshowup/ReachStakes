/**
 * Meta Conversion API Service
 * Handles server-side event tracking for Facebook/Instagram
 */

import crypto from 'crypto';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_URL = 'https://graph.facebook.com';

/**
 * Hash user data for Meta CAPI (SHA256, lowercase)
 * @param {string} data - Raw data to hash
 * @returns {string|null} Hashed data or null
 */
const hashData = (data) => {
    if (!data) return null;
    const normalized = data.toString().toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
};

/**
 * Normalize phone number for Meta
 * @param {string} phone - Phone number
 * @returns {string|null} Normalized phone
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    // Remove all non-digits
    return phone.replace(/\D/g, '');
};

/**
 * Send event to Meta Conversion API
 * @param {string} pixelId - Meta Pixel ID
 * @param {string} accessToken - Meta Access Token
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} API response
 */
export const sendEvent = async (pixelId, accessToken, eventData) => {
    const {
        eventName,
        eventTime,
        eventId,
        eventSourceUrl,
        actionSource = 'website',
        userData = {},
        customData = {}
    } = eventData;

    // Build user_data with proper hashing
    const user_data = {};

    if (userData.email) {
        user_data.em = [hashData(userData.email)];
    }
    if (userData.phone) {
        user_data.ph = [hashData(normalizePhone(userData.phone))];
    }
    if (userData.firstName) {
        user_data.fn = [hashData(userData.firstName)];
    }
    if (userData.lastName) {
        user_data.ln = [hashData(userData.lastName)];
    }
    if (userData.city) {
        user_data.ct = [hashData(userData.city)];
    }
    if (userData.state) {
        user_data.st = [hashData(userData.state)];
    }
    if (userData.zip) {
        user_data.zp = [hashData(userData.zip)];
    }
    if (userData.country) {
        user_data.country = [hashData(userData.country)];
    }
    if (userData.externalId) {
        user_data.external_id = [hashData(userData.externalId)];
    }

    // Non-hashed fields
    if (userData.ipAddress) {
        user_data.client_ip_address = userData.ipAddress;
    }
    if (userData.userAgent) {
        user_data.client_user_agent = userData.userAgent;
    }
    if (userData.fbc) {
        user_data.fbc = userData.fbc; // Facebook click ID
    }
    if (userData.fbp) {
        user_data.fbp = userData.fbp; // Facebook browser ID
    }

    const payload = {
        data: [{
            event_name: eventName,
            event_time: eventTime || Math.floor(Date.now() / 1000),
            event_id: eventId, // For deduplication with pixel
            event_source_url: eventSourceUrl,
            action_source: actionSource,
            user_data,
            custom_data: customData
        }]
    };

    const url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || 'Meta API request failed');
    }

    return result;
};

/**
 * Send multiple events in a batch
 * @param {string} pixelId - Meta Pixel ID
 * @param {string} accessToken - Meta Access Token
 * @param {Array} events - Array of event objects
 * @returns {Promise<Object>} API response
 */
export const sendBatchEvents = async (pixelId, accessToken, events) => {
    const processedEvents = events.map(event => {
        const userData = {};

        if (event.userData?.email) userData.em = [hashData(event.userData.email)];
        if (event.userData?.phone) userData.ph = [hashData(normalizePhone(event.userData.phone))];
        if (event.userData?.externalId) userData.external_id = [hashData(event.userData.externalId)];
        if (event.userData?.ipAddress) userData.client_ip_address = event.userData.ipAddress;
        if (event.userData?.userAgent) userData.client_user_agent = event.userData.userAgent;
        if (event.userData?.fbc) userData.fbc = event.userData.fbc;
        if (event.userData?.fbp) userData.fbp = event.userData.fbp;

        return {
            event_name: event.eventName,
            event_time: event.eventTime || Math.floor(Date.now() / 1000),
            event_id: event.eventId,
            event_source_url: event.eventSourceUrl,
            action_source: event.actionSource || 'website',
            user_data: userData,
            custom_data: event.customData || {}
        };
    });

    const payload = { data: processedEvents };
    const url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    return response.json();
};

/**
 * Send a purchase event
 * @param {Object} config - Meta config { pixelId, accessToken }
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} API response
 */
export const sendPurchaseEvent = async (config, orderData) => {
    const { pixelId, accessToken } = config;

    return sendEvent(pixelId, accessToken, {
        eventName: 'Purchase',
        eventId: `purchase_${orderData.orderId}`,
        eventSourceUrl: orderData.sourceUrl,
        userData: {
            email: orderData.email,
            phone: orderData.phone,
            externalId: orderData.customerId,
            ipAddress: orderData.ip,
            userAgent: orderData.userAgent,
            fbc: orderData.fbc,
            fbp: orderData.fbp
        },
        customData: {
            value: parseFloat(orderData.value) || 0,
            currency: orderData.currency || 'USD',
            content_ids: orderData.productIds || [],
            content_type: 'product',
            num_items: orderData.itemCount || 1,
            order_id: orderData.orderId,
            // Attribution custom data
            creator_code: orderData.affiliateCode,
            campaign_id: orderData.campaignId
        }
    });
};

/**
 * Send an add to cart event
 * @param {Object} config - Meta config
 * @param {Object} cartData - Cart data
 * @returns {Promise<Object>} API response
 */
export const sendAddToCartEvent = async (config, cartData) => {
    const { pixelId, accessToken } = config;

    return sendEvent(pixelId, accessToken, {
        eventName: 'AddToCart',
        eventId: `atc_${Date.now()}`,
        eventSourceUrl: cartData.sourceUrl,
        userData: {
            ipAddress: cartData.ip,
            userAgent: cartData.userAgent,
            fbc: cartData.fbc,
            fbp: cartData.fbp
        },
        customData: {
            value: parseFloat(cartData.value) || 0,
            currency: cartData.currency || 'USD',
            content_ids: [cartData.productId],
            content_type: 'product',
            creator_code: cartData.affiliateCode
        }
    });
};

/**
 * Validate Meta CAPI configuration
 * @param {string} pixelId - Meta Pixel ID
 * @param {string} accessToken - Meta Access Token
 * @returns {Promise<Object>} Validation result
 */
export const validateConfig = async (pixelId, accessToken) => {
    try {
        // Try to get pixel info to validate credentials
        const url = `${GRAPH_API_URL}/${GRAPH_API_VERSION}/${pixelId}?access_token=${accessToken}&fields=name,id`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.error) {
            return {
                success: false,
                message: result.error.message
            };
        }

        return {
            success: true,
            pixelName: result.name,
            message: 'Configuration is valid'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Generate a unique event ID for deduplication
 * @param {string} prefix - Event type prefix
 * @returns {string} Unique event ID
 */
export const generateEventId = (prefix = 'evt') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default {
    sendEvent,
    sendBatchEvents,
    sendPurchaseEvent,
    sendAddToCartEvent,
    validateConfig,
    generateEventId,
    hashData
};
