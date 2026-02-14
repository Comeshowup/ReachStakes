/**
 * Shopify Integration Service
 * Handles OAuth, webhooks, and API interactions with Shopify stores
 */

import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES || 'read_orders,read_products,write_price_rules,write_discounts';
const API_VERSION = '2024-01';

/**
 * Generate Shopify OAuth authorization URL
 * @param {string} shop - Shopify store domain (e.g., my-store.myshopify.com)
 * @param {string} state - CSRF protection token
 * @param {string} redirectUri - OAuth callback URL
 * @returns {string} Authorization URL
 */
export const getAuthUrl = (shop, state, redirectUri) => {
    const scopes = SHOPIFY_SCOPES;
    const params = new URLSearchParams({
        client_id: SHOPIFY_API_KEY,
        scope: scopes,
        redirect_uri: redirectUri,
        state: state
    });
    return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 * @param {string} shop - Shopify store domain
 * @param {string} code - Authorization code from OAuth callback
 * @returns {Promise<Object>} Token response with access_token
 */
export const exchangeCodeForToken = async (shop, code) => {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: SHOPIFY_API_KEY,
            client_secret: SHOPIFY_API_SECRET,
            code
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
};

/**
 * Register webhooks for a Shopify store
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @param {string} webhookUrl - URL to receive webhook events
 * @returns {Promise<Array>} Array of registered webhook results
 */
export const registerWebhooks = async (shop, accessToken, webhookUrl) => {
    const webhookTopics = [
        'orders/create',
        'orders/paid',
        'orders/fulfilled',
        'refunds/create'
    ];

    const results = [];

    for (const topic of webhookTopics) {
        try {
            const response = await fetch(
                `https://${shop}/admin/api/${API_VERSION}/webhooks.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': accessToken
                    },
                    body: JSON.stringify({
                        webhook: {
                            topic,
                            address: webhookUrl,
                            format: 'json'
                        }
                    })
                }
            );

            const data = await response.json();
            results.push({ topic, success: response.ok, data });
        } catch (error) {
            results.push({ topic, success: false, error: error.message });
        }
    }

    return results;
};

/**
 * Verify Shopify webhook HMAC signature
 * @param {string} body - Raw request body
 * @param {string} hmac - HMAC from X-Shopify-Hmac-Sha256 header
 * @returns {boolean} Whether the signature is valid
 */
export const verifyWebhook = (body, hmac) => {
    if (!SHOPIFY_API_SECRET || !hmac) return false;

    const hash = crypto
        .createHmac('sha256', SHOPIFY_API_SECRET)
        .update(body, 'utf8')
        .digest('base64');

    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac));
    } catch {
        return false;
    }
};

/**
 * Fetch orders from a Shopify store
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Orders response
 */
export const fetchOrders = async (shop, accessToken, params = {}) => {
    const queryParams = new URLSearchParams({
        limit: params.limit || 50,
        status: params.status || 'any',
        ...params
    });

    const response = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/orders.json?${queryParams.toString()}`,
        {
            headers: { 'X-Shopify-Access-Token': accessToken }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Get shop information
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @returns {Promise<Object>} Shop data
 */
export const getShopInfo = async (shop, accessToken) => {
    const response = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/shop.json`,
        {
            headers: { 'X-Shopify-Access-Token': accessToken }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch shop info: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Create a discount code for a creator
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @param {Object} options - Discount options
 * @returns {Promise<Object>} Created discount code
 */
export const createDiscountCode = async (shop, accessToken, options) => {
    const { code, discountType = 'percentage', discountValue, title } = options;

    // First, create a price rule
    const priceRuleResponse = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/price_rules.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            },
            body: JSON.stringify({
                price_rule: {
                    title: title || `ReachStakes - ${code}`,
                    target_type: 'line_item',
                    target_selection: 'all',
                    allocation_method: 'across',
                    value_type: discountType,
                    value: -Math.abs(discountValue), // Must be negative
                    customer_selection: 'all',
                    starts_at: new Date().toISOString(),
                    usage_limit: null // Unlimited uses
                }
            })
        }
    );

    if (!priceRuleResponse.ok) {
        const error = await priceRuleResponse.text();
        throw new Error(`Failed to create price rule: ${error}`);
    }

    const { price_rule } = await priceRuleResponse.json();

    // Then, create the discount code
    const discountResponse = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/price_rules/${price_rule.id}/discount_codes.json`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken
            },
            body: JSON.stringify({
                discount_code: { code: code.toUpperCase() }
            })
        }
    );

    if (!discountResponse.ok) {
        const error = await discountResponse.text();
        throw new Error(`Failed to create discount code: ${error}`);
    }

    const { discount_code } = await discountResponse.json();

    return {
        priceRuleId: price_rule.id,
        discountCodeId: discount_code.id,
        code: discount_code.code
    };
};

/**
 * Delete a Shopify webhook
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @param {string} webhookId - Webhook ID to delete
 */
export const deleteWebhook = async (shop, accessToken, webhookId) => {
    await fetch(
        `https://${shop}/admin/api/${API_VERSION}/webhooks/${webhookId}.json`,
        {
            method: 'DELETE',
            headers: { 'X-Shopify-Access-Token': accessToken }
        }
    );
};

/**
 * List all webhooks for a store
 * @param {string} shop - Shopify store domain
 * @param {string} accessToken - Store access token
 * @returns {Promise<Array>} List of webhooks
 */
export const listWebhooks = async (shop, accessToken) => {
    const response = await fetch(
        `https://${shop}/admin/api/${API_VERSION}/webhooks.json`,
        {
            headers: { 'X-Shopify-Access-Token': accessToken }
        }
    );

    const data = await response.json();
    return data.webhooks || [];
};

export default {
    getAuthUrl,
    exchangeCodeForToken,
    registerWebhooks,
    verifyWebhook,
    fetchOrders,
    getShopInfo,
    createDiscountCode,
    deleteWebhook,
    listWebhooks
};
