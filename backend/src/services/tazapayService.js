import axios from 'axios';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

const TAZAPAY_API_BASE_URL = process.env.TAZAPAY_API_BASE_URL || 'https://service-sandbox.tazapay.com';
const TAZAPAY_API_KEY = process.env.TAZAPAY_API_KEY;
const TAZAPAY_API_SECRET = process.env.TAZAPAY_API_SECRET;
const TAZAPAY_ACCOUNT_EMAIL = process.env.TAZAPAY_ACCOUNT_EMAIL;
const TAZAPAY_WEBHOOK_SECRET = process.env.TAZAPAY_WEBHOOK_SECRET; // For HMAC webhook verification

/**
 * Validate that all required Tazapay environment variables are set.
 * Call this on server startup to fail fast.
 */
export const validateTazapayConfig = () => {
    const required = {
        TAZAPAY_API_KEY: TAZAPAY_API_KEY,
        TAZAPAY_API_SECRET: TAZAPAY_API_SECRET,
    };

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error(`⚠️  Tazapay Config Error: Missing required env vars: ${missing.join(', ')}`);
        console.error('   Payments will NOT work until these are configured.');
        return false;
    }

    const isProduction = TAZAPAY_API_BASE_URL.includes('service.tazapay.com') && !TAZAPAY_API_BASE_URL.includes('sandbox');
    const isSandboxKey = TAZAPAY_API_KEY?.startsWith('ak_test_');

    if (isProduction && isSandboxKey) {
        console.warn('⚠️  Tazapay Config Warning: Using sandbox API key with production URL!');
    }

    if (!TAZAPAY_ACCOUNT_EMAIL) {
        console.warn('⚠️  Tazapay Config Warning: TAZAPAY_ACCOUNT_EMAIL not set. "Identical parties" errors may occur.');
    }

    if (!TAZAPAY_WEBHOOK_SECRET) {
        console.warn('⚠️  Tazapay Config Warning: TAZAPAY_WEBHOOK_SECRET not set. Webhook signature verification disabled.');
    }

    console.log(`✅ Tazapay configured: ${TAZAPAY_API_BASE_URL} (${isSandboxKey ? 'sandbox' : 'live'})`);
    return true;
};

// ============================================
// AUTH & HELPERS
// ============================================

const getAuthHeader = () => {
    if (!TAZAPAY_API_KEY || !TAZAPAY_API_SECRET) {
        throw new TazapayError(
            'Tazapay API credentials are not configured. Please set TAZAPAY_API_KEY and TAZAPAY_API_SECRET.',
            'CONFIG_ERROR',
            500
        );
    }
    const token = Buffer.from(`${TAZAPAY_API_KEY}:${TAZAPAY_API_SECRET}`).toString('base64');
    return `Basic ${token}`;
};

/**
 * Custom error class for Tazapay API errors.
 * Preserves the original error details for frontend consumption.
 */
export class TazapayError extends Error {
    constructor(message, code, statusCode = 500, details = null) {
        super(message);
        this.name = 'TazapayError';
        this.code = code;         // e.g. 'CHECKOUT_FAILED', 'CONFIG_ERROR', 'INVALID_EMAIL'
        this.statusCode = statusCode;
        this.details = details;   // Raw Tazapay error response
    }
}

/**
 * Parse Tazapay API error into a TazapayError with meaningful message
 */
const parseTazapayApiError = (error, context) => {
    const response = error.response;

    if (!response) {
        // Network error or timeout
        return new TazapayError(
            `Network error while ${context}: ${error.message}`,
            'NETWORK_ERROR',
            503
        );
    }

    const status = response.status;
    const data = response.data;

    // Extract the best error message from Tazapay's response
    const tazapayMessage = data?.message
        || data?.error?.message
        || data?.errors?.[0]?.message
        || data?.error
        || JSON.stringify(data);

    const tazapayCode = data?.error_code
        || data?.error?.code
        || data?.errors?.[0]?.code
        || status;

    // Map common Tazapay errors to user-friendly messages
    if (status === 401) {
        return new TazapayError(
            'Tazapay authentication failed. API credentials may be invalid.',
            'AUTH_ERROR',
            401,
            data
        );
    }

    if (status === 400) {
        // Parse specific 400 errors
        if (tazapayMessage.includes('Parties should not be identical') || tazapayCode === 19009) {
            return new TazapayError(
                'Payment configuration error: buyer and seller cannot be the same. Please contact support.',
                'IDENTICAL_PARTIES',
                400,
                data
            );
        }
        if (tazapayCode === 15501) {
            return new TazapayError(
                'Invalid email format. Please update your account email.',
                'INVALID_EMAIL',
                400,
                data
            );
        }
        return new TazapayError(
            `Payment error: ${tazapayMessage}`,
            'VALIDATION_ERROR',
            400,
            data
        );
    }

    if (status === 429) {
        return new TazapayError(
            'Too many payment requests. Please wait a moment and try again.',
            'RATE_LIMITED',
            429,
            data
        );
    }

    if (status >= 500) {
        return new TazapayError(
            'Tazapay service is temporarily unavailable. Please try again shortly.',
            'SERVER_ERROR',
            502,
            data
        );
    }

    return new TazapayError(
        `Payment processing failed: ${tazapayMessage}`,
        `TAZAPAY_${tazapayCode}`,
        status,
        data
    );
};

/**
 * Make a Tazapay API request with retry logic for transient failures.
 * Retries up to maxRetries times with exponential backoff for 5xx errors.
 */
const tazapayApiRequest = async (method, endpoint, data = null, maxRetries = 2) => {
    const url = `${TAZAPAY_API_BASE_URL}${endpoint}`;
    const config = {
        method,
        url,
        headers: {
            'Authorization': getAuthHeader(),
            'Content-Type': 'application/json'
        },
        timeout: 30000, // 30s timeout
    };

    if (data && (method === 'post' || method === 'put')) {
        config.data = data;
    }

    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            lastError = error;
            const status = error.response?.status;

            // Only retry on 5xx server errors or network errors (not 4xx client errors)
            const isRetryable = !status || status >= 500;
            if (!isRetryable || attempt === maxRetries) break;

            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s
            console.warn(`Tazapay API ${method.toUpperCase()} ${endpoint} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
};

/**
 * Basic email validation
 */
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Ensure the customer email is valid and different from the Tazapay account owner email.
 * Prevents error 19009 ("Parties should not be identical") and error 15501 (invalid email).
 */
const getSafeCustomerEmail = (customerEmail) => {
    if (!customerEmail || !isValidEmail(customerEmail)) {
        return `customer_${Date.now()}@reachstakes.com`;
    }
    const accountEmail = TAZAPAY_ACCOUNT_EMAIL;
    if (accountEmail && customerEmail.toLowerCase() === accountEmail.toLowerCase()) {
        const [localPart, domain] = customerEmail.split('@');
        return `customer+${localPart}@${domain}`;
    }
    return customerEmail;
};

// ============================================
// CHECKOUT API
// ============================================

export const tazapayService = {
    /**
     * Create a Checkout Session
     * @returns {Object} { data: { id, url, ... } }
     */
    createCheckoutSession: async ({
        invoice_currency = 'USD',
        amount,
        customer_details,
        txn_description,
        success_url,
        cancel_url,
        reference_id // New: allow passing reference_id
    }) => {
        // Amount in minor units (cents for USD)
        const amountInCents = Math.round(parseFloat(amount) * 100);

        if (isNaN(amountInCents) || amountInCents <= 0) {
            throw new TazapayError('Invalid payment amount', 'INVALID_AMOUNT', 400);
        }

        const safeEmail = getSafeCustomerEmail(customer_details.email);

        const payload = {
            invoice_currency,
            amount: amountInCents,
            reference_id: reference_id || `txn_${Date.now()}`,
            transaction_description: txn_description || 'Reachstakes Campaign Funding',
            customer_details: {
                name: customer_details.name || 'Customer',
                email: safeEmail,
                country: customer_details.country || 'US',
            },
        };

        if (success_url) payload.success_url = success_url;
        if (cancel_url) payload.cancel_url = cancel_url;

        console.log('Tazapay Checkout Request:', JSON.stringify({
            ...payload,
            // Sanitized log — don't log email in production
            customer_details: { ...payload.customer_details, email: '***' }
        }, null, 2));

        try {
            const result = await tazapayApiRequest('post', '/v3/checkout', payload);
            console.log('Tazapay Checkout Response ID:', result?.data?.id || result?.id || 'unknown');
            return result;
        } catch (error) {
            throw parseTazapayApiError(error, 'creating checkout session');
        }
    },

    /**
     * Get checkout session status from Tazapay API
     * @param {string} checkoutId
     * @returns {Object} Checkout status data
     */
    getCheckoutStatus: async (checkoutId) => {
        if (!checkoutId) {
            throw new TazapayError('Checkout ID is required', 'MISSING_CHECKOUT_ID', 400);
        }

        try {
            return await tazapayApiRequest('get', `/v3/checkout/${checkoutId}`);
        } catch (error) {
            throw parseTazapayApiError(error, 'getting checkout status');
        }
    },

    /**
     * Verify Webhook Signature using HMAC-SHA256
     * @param {Object} req - Express request object
     * @returns {Boolean} Whether the webhook is authentic
     */
    verifyWebhook: (req) => {
        if (!TAZAPAY_WEBHOOK_SECRET) {
            // No webhook secret configured — accept in dev, reject in production
            const isProduction = process.env.NODE_ENV === 'production';
            if (isProduction) {
                console.error('❌ Webhook rejected: TAZAPAY_WEBHOOK_SECRET not configured in production!');
                return false;
            }
            console.warn('⚠️  Webhook accepted without signature verification (dev mode)');
            return true;
        }

        const signature = req.headers['webhook-signature'] || req.headers['x-tazapay-signature'];
        if (!signature) {
            console.error('❌ Webhook rejected: No signature header present');
            return false;
        }

        try {
            // Tazapay sends: t=timestamp,v1=signature
            const parts = signature.split(',');
            const timestampPart = parts.find(p => p.startsWith('t='));
            const signaturePart = parts.find(p => p.startsWith('v1='));

            if (!timestampPart || !signaturePart) {
                // Fallback: try simple HMAC comparison
                const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                const expectedSignature = crypto
                    .createHmac('sha256', TAZAPAY_WEBHOOK_SECRET)
                    .update(body)
                    .digest('hex');

                if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
                    return true;
                }
                console.error('❌ Webhook signature mismatch');
                return false;
            }

            const timestamp = timestampPart.replace('t=', '');
            const receivedSig = signaturePart.replace('v1=', '');

            // Verify timestamp is within 5 minutes to prevent replay attacks
            const currentTime = Math.floor(Date.now() / 1000);
            if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
                console.error('❌ Webhook rejected: Timestamp too old (possible replay attack)');
                return false;
            }

            // Compute expected signature
            const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            const signaturePayload = `${timestamp}.${body}`;
            const expectedSignature = crypto
                .createHmac('sha256', TAZAPAY_WEBHOOK_SECRET)
                .update(signaturePayload)
                .digest('hex');

            if (crypto.timingSafeEqual(Buffer.from(receivedSig), Buffer.from(expectedSignature))) {
                return true;
            }

            console.error('❌ Webhook signature verification failed');
            return false;
        } catch (err) {
            console.error('❌ Webhook verification error:', err.message);
            return false;
        }
    },

    // ============================================
    // ENTITY API METHODS (Secure Hosted Onboarding)
    // ============================================

    createEntity: async ({ name, email, referenceId }) => {
        const payload = {
            type: 'individual',
            name,
            email,
            reference_id: referenceId,
            purpose_of_use: ['payout'],
            relationship: 'vendor',
        };

        console.log('Creating Tazapay Entity:', { name, email: '***', referenceId });

        try {
            const result = await tazapayApiRequest('post', '/v3/entity', payload);
            console.log('Entity created, ID:', result?.data?.id);
            return result;
        } catch (error) {
            throw parseTazapayApiError(error, 'creating entity');
        }
    },

    getEntityStatus: async (entityId) => {
        try {
            return await tazapayApiRequest('get', `/v3/entity/${entityId}`);
        } catch (error) {
            throw parseTazapayApiError(error, 'getting entity status');
        }
    },

    submitEntity: async (entityId) => {
        console.log('Submitting entity for approval:', entityId);
        try {
            const result = await tazapayApiRequest('post', `/v3/entity/${entityId}/submit`, {});
            console.log('Submit Entity response:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            throw parseTazapayApiError(error, 'submitting entity');
        }
    },

    regenerateOnboardingLink: async (entityId) => {
        try {
            const getResult = await tazapayApiRequest('get', `/v3/entity/${entityId}`);
            const entityData = getResult?.data || getResult;

            if (entityData?.onboarding_package_url) {
                return { data: entityData };
            }

            console.log('No onboarding URL found, attempting to update entity...');
            const updateResult = await tazapayApiRequest('put', `/v3/entity/${entityId}`, {
                purpose_of_use: ['payout']
            });
            return updateResult;
        } catch (error) {
            throw parseTazapayApiError(error, 'regenerating onboarding link');
        }
    },

    // ============================================
    // PAYOUT / BENEFICIARY METHODS
    // ============================================

    getBankFieldsForCountry: (country) => {
        const fieldConfigs = {
            'US': { fields: ['account_number', 'bank_name'], bankCodeType: 'aba_code', bankCodeLabel: 'Routing Number (ABA)', accountLabel: 'Account Number' },
            'GB': { fields: ['account_number', 'bank_name'], bankCodeType: 'sort_code', bankCodeLabel: 'Sort Code', accountLabel: 'Account Number' },
            'IN': { fields: ['account_number', 'bank_name'], bankCodeType: 'ifsc_code', bankCodeLabel: 'IFSC Code', accountLabel: 'Account Number' },
            'AU': { fields: ['account_number', 'bank_name'], bankCodeType: 'bsb_code', bankCodeLabel: 'BSB Code', accountLabel: 'Account Number' },
            'CA': { fields: ['account_number', 'bank_name', 'branch_code'], bankCodeType: 'bank_code', bankCodeLabel: 'Institution Number', accountLabel: 'Account Number' },
            'BR': { fields: ['pix_key'], bankCodeType: 'pix_brl', bankCodeLabel: 'PIX Key (Email/Phone/CPF)', accountLabel: 'PIX Key', isPix: true },
            'DE': { fields: ['iban'], bankCodeType: 'swift_code', bankCodeLabel: 'BIC/SWIFT', accountLabel: 'IBAN', useIban: true },
            'FR': { fields: ['iban'], bankCodeType: 'swift_code', bankCodeLabel: 'BIC/SWIFT', accountLabel: 'IBAN', useIban: true },
            'NL': { fields: ['iban'], bankCodeType: 'swift_code', bankCodeLabel: 'BIC/SWIFT', accountLabel: 'IBAN', useIban: true },
            'ES': { fields: ['iban'], bankCodeType: 'swift_code', bankCodeLabel: 'BIC/SWIFT', accountLabel: 'IBAN', useIban: true },
            'IT': { fields: ['iban'], bankCodeType: 'swift_code', bankCodeLabel: 'BIC/SWIFT', accountLabel: 'IBAN', useIban: true },
            'SG': { fields: ['account_number', 'bank_name'], bankCodeType: 'swift_code', bankCodeLabel: 'SWIFT/BIC', accountLabel: 'Account Number' },
            'PH': { fields: ['account_number', 'bank_name'], bankCodeType: 'bank_code', bankCodeLabel: 'Bank Code', accountLabel: 'Account Number' },
            'ID': { fields: ['account_number', 'bank_name'], bankCodeType: 'bank_code', bankCodeLabel: 'Bank Code', accountLabel: 'Account Number' },
            'TH': { fields: ['account_number', 'bank_name'], bankCodeType: 'bank_code', bankCodeLabel: 'Bank Code', accountLabel: 'Account Number' },
            'MY': { fields: ['account_number', 'bank_name'], bankCodeType: 'bank_code', bankCodeLabel: 'Bank Code', accountLabel: 'Account Number' },
            'VN': { fields: ['account_number', 'bank_name'], bankCodeType: 'bank_code', bankCodeLabel: 'Bank Code', accountLabel: 'Account Number' },
        };

        return fieldConfigs[country] || {
            fields: ['account_number', 'bank_name'],
            bankCodeType: 'swift_code',
            bankCodeLabel: 'SWIFT/BIC Code',
            accountLabel: 'Account Number'
        };
    },

    createBeneficiary: async ({
        name, email, type = 'individual', country, currency,
        accountNumber, bankName, bankCode, bankCodeType, iban, pixKey
    }) => {
        const bank_codes = {};
        if (bankCode && bankCodeType) {
            bank_codes[bankCodeType] = bankCode;
        }

        let destinationDetails;
        if (pixKey) {
            destinationDetails = { type: 'pix_brl', pix_brl: { key: pixKey } };
        } else {
            destinationDetails = {
                type: 'bank',
                bank: { country, currency, bank_name: bankName, bank_codes, firc_required: false }
            };
            if (iban) {
                destinationDetails.bank.iban = iban;
            } else {
                destinationDetails.bank.account_number = accountNumber;
            }
        }

        const payload = { type, name, email, destination_details: destinationDetails };
        console.log('Creating Tazapay beneficiary for:', name);

        try {
            return await tazapayApiRequest('post', '/v3/beneficiary', payload);
        } catch (error) {
            throw parseTazapayApiError(error, 'creating beneficiary');
        }
    },

    createPayout: async ({
        beneficiaryId, amount, currency = 'USD',
        holdingCurrency = 'USD', payoutType = 'local',
        reason = 'Creator payout', referenceId
    }) => {
        const amountInCents = Math.round(parseFloat(amount) * 100);
        const payload = {
            beneficiary_id: beneficiaryId,
            amount: amountInCents,
            currency,
            holding_currency: holdingCurrency,
            payout_type: payoutType,
            reason,
            reference_id: referenceId || `payout_${Date.now()}`
        };

        console.log('Creating Tazapay payout:', { beneficiaryId, amount, currency });

        try {
            return await tazapayApiRequest('post', '/v3/payout', payload);
        } catch (error) {
            throw parseTazapayApiError(error, 'creating payout');
        }
    },

    getPayoutStatus: async (payoutId) => {
        try {
            return await tazapayApiRequest('get', `/v3/payout/${payoutId}`);
        } catch (error) {
            throw parseTazapayApiError(error, 'getting payout status');
        }
    },

    getBeneficiaryStatus: async (beneficiaryId) => {
        try {
            return await tazapayApiRequest('get', `/v3/beneficiary/${beneficiaryId}`);
        } catch (error) {
            throw parseTazapayApiError(error, 'getting beneficiary status');
        }
    }
};
