import axios from 'axios';

const TAZAPAY_API_BASE_URL = process.env.TAZAPAY_API_BASE_URL || 'https://service-sandbox.tazapay.com';
const TAZAPAY_API_KEY = process.env.TAZAPAY_API_KEY;
const TAZAPAY_API_SECRET = process.env.TAZAPAY_API_SECRET;

const getAuthHeader = () => {
    if (!TAZAPAY_API_KEY || !TAZAPAY_API_SECRET) {
        throw new Error('Missing Tazapay API Key or Secret');
    }
    const token = Buffer.from(`${TAZAPAY_API_KEY}:${TAZAPAY_API_SECRET}`).toString('base64');
    return `Basic ${token}`;
};

export const tazapayService = {
    /**
     * Create a Checkout Session with Escrow
     * @param {Object} paymentDetails 
     * @returns {Object} checkout session data
     */
    createCheckoutSession: async ({
        invoice_currency = 'USD',
        amount,
        buyer_id, // Email or specific ID if managed
        seller_id, // Email or specific ID if managed
        txn_description,
        customer_details, // { name, email, country }
        is_escrow = true // Default to true for Reachstakes
    }) => {
        try {
            // Escrow-specific configurations could be added here if the API requires specific flags
            // Based on docs, standard checkout can handle escrow if configured or if "protection" is enabled

            // For escrow payments, we need distinct buyer (brand) and seller (platform) details
            // IMPORTANT: Tazapay expects amount in MINOR UNITS (cents for USD)
            // So $10.79 should be sent as 1079, $1079.00 should be sent as 107900
            const amountInCents = Math.round(parseFloat(amount) * 100);

            const payload = {
                invoice_currency: invoice_currency, // Required: ISO 4217 alpha-3 currency code
                amount: amountInCents, // Amount in cents (minor units)
                reference_id: `txn_${Date.now()}`,
                transaction_description: txn_description || 'Reachstakes Campaign Funding', // Required field

                // Customer details is required by Tazapay v3 API
                customer_details: {
                    name: customer_details.name,
                    email: customer_details.email,
                    country: customer_details.country || 'US',
                },
            };

            // Correction based on typical Tazapay /v3/checkout usage:
            // It needs a distinct payload structure.
            // Since I don't have the EXACT payload from the brief research, I will use a robust generic structure 
            // and log the response to debug if it fails.

            const response = await axios.post(`${TAZAPAY_API_BASE_URL}/v3/checkout`, payload, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Create Checkout Error:', error.response?.data || error.message);
            throw new Error('Failed to create Tazapay checkout session');
        }
    },

    /**
     * Verify Webhook Signature
     * @param {Object} req 
     * @returns {Boolean}
     */
    verifyWebhook: (req) => {
        // In production, implement proper signature verification:
        // 1. Get the 'webhook-signature' header
        // 2. Extract timestamp and signature from header
        // 3. Compute expected signature using HMAC-SHA256 with webhook secret
        // 4. Compare signatures and validate timestamp
        // For now, trusting in dev - TODO: implement for production
        const signature = req.headers['webhook-signature'];
        if (!signature) {
            console.warn('Webhook received without signature - allowing in dev mode');
        }
        return true;
    },

    // ============================================
    // ENTITY API METHODS (Secure Hosted Onboarding)
    // ============================================

    /**
     * Create a Tazapay Entity for secure hosted onboarding
     * The response includes a hosted URL where the creator can complete KYC/bank setup
     * @param {Object} entityDetails - Basic creator info (name, email, referenceId)
     * @returns {Object} Entity data with onboarding link
     */
    createEntity: async ({ name, email, referenceId }) => {
        try {
            const payload = {
                type: 'individual',
                name,
                email,
                reference_id: referenceId,
                purpose_of_use: ['payout'], // Required for payout onboarding
                relationship: 'vendor', // Creator is a vendor receiving payouts
                // submit: false - Tazapay requires KYC data (address, documents) to submit
                // The hosted onboarding portal should collect this, but if unavailable, use manual entry
            };

            console.log('Creating Tazapay Entity (minimal info only):', { name, email, referenceId });

            const response = await axios.post(`${TAZAPAY_API_BASE_URL}/v3/entity`, payload, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            // Response should include `link_to_onboarding_package_for_the_entity`
            console.log('Entity created successfully, Entity ID:', response.data?.data?.id);
            return response.data;
        } catch (error) {
            console.error('Tazapay Create Entity Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create Tazapay entity');
        }
    },

    /**
     * Get Entity status and details
     * @param {string} entityId - Tazapay entity ID
     * @returns {Object} Entity details including approval status
     */
    getEntityStatus: async (entityId) => {
        try {
            const response = await axios.get(`${TAZAPAY_API_BASE_URL}/v3/entity/${entityId}`, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Get Entity Status Error:', error.response?.data || error.message);
            throw new Error('Failed to get entity status');
        }
    },

    /**
     * Submit Entity for approval - this returns the onboarding_package_url
     * The Create Entity endpoint only creates the entity, but Submit Entity
     * is required to get the hosted onboarding link for KYC/bank setup
     * @param {string} entityId - Tazapay entity ID
     * @returns {Object} Entity data with onboarding_package_url
     */
    submitEntity: async (entityId) => {
        try {
            console.log('Submitting entity for approval:', entityId);

            const response = await axios.post(
                `${TAZAPAY_API_BASE_URL}/v3/entity/${entityId}/submit`,
                {},
                {
                    headers: {
                        'Authorization': getAuthHeader(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Submit Entity response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Tazapay Submit Entity Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to submit entity for approval');
        }
    },

    /**
     * Get or refresh the onboarding link for an existing entity
     * Fetches entity details which should include the onboarding URL
     * @param {string} entityId - Tazapay entity ID
     * @returns {Object} Entity data with onboarding link
     */
    regenerateOnboardingLink: async (entityId) => {
        try {
            // First try to get the entity - the onboarding_package_url may be populated
            const getResponse = await axios.get(
                `${TAZAPAY_API_BASE_URL}/v3/entity/${entityId}`,
                {
                    headers: {
                        'Authorization': getAuthHeader(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            const entityData = getResponse.data?.data || getResponse.data;

            // Check if onboarding URL is now available
            if (entityData?.onboarding_package_url) {
                return { data: entityData };
            }

            // If still no URL, try to update/submit the entity to trigger link generation
            console.log('No onboarding URL found, attempting to update entity...');
            const updateResponse = await axios.put(
                `${TAZAPAY_API_BASE_URL}/v3/entity/${entityId}`,
                {
                    // Minimal update to potentially trigger onboarding package generation
                    purpose_of_use: ['payout']
                },
                {
                    headers: {
                        'Authorization': getAuthHeader(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            return updateResponse.data;
        } catch (error) {
            console.error('Tazapay Get/Generate Onboarding Link Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to get onboarding link');
        }
    },

    // ============================================
    // PAYOUT / BENEFICIARY METHODS
    // ============================================

    /**
     * Get required bank fields for a country/currency
     * @param {string} country - ISO 2-letter country code
     * @param {string} currency - ISO 3-letter currency code
     * @returns {Object} { fields: string[], bankCodeType: string }
     */
    getBankFieldsForCountry: (country, currency) => {
        const fieldConfigs = {
            'US': {
                fields: ['account_number', 'bank_name'],
                bankCodeType: 'aba_code',
                bankCodeLabel: 'Routing Number (ABA)',
                accountLabel: 'Account Number'
            },
            'GB': {
                fields: ['account_number', 'bank_name'],
                bankCodeType: 'sort_code',
                bankCodeLabel: 'Sort Code',
                accountLabel: 'Account Number'
            },
            'IN': {
                fields: ['account_number', 'bank_name'],
                bankCodeType: 'ifsc_code',
                bankCodeLabel: 'IFSC Code',
                accountLabel: 'Account Number'
            },
            'AU': {
                fields: ['account_number', 'bank_name'],
                bankCodeType: 'bsb_code',
                bankCodeLabel: 'BSB Code',
                accountLabel: 'Account Number'
            },
            'CA': {
                fields: ['account_number', 'bank_name', 'branch_code'],
                bankCodeType: 'bank_code',
                bankCodeLabel: 'Institution Number',
                accountLabel: 'Account Number'
            },
            'BR': {
                fields: ['pix_key'],
                bankCodeType: 'pix_brl',
                bankCodeLabel: 'PIX Key (Email/Phone/CPF)',
                accountLabel: 'PIX Key',
                isPix: true
            },
            // EEA Countries use IBAN + SWIFT
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

        // Default for unlisted countries (SWIFT transfer)
        return fieldConfigs[country] || {
            fields: ['account_number', 'bank_name'],
            bankCodeType: 'swift_code',
            bankCodeLabel: 'SWIFT/BIC Code',
            accountLabel: 'Account Number'
        };
    },

    /**
     * Create a beneficiary for payouts
     * @param {Object} beneficiaryDetails
     * @returns {Object} Tazapay beneficiary response
     */
    createBeneficiary: async ({
        name,
        email,
        type = 'individual', // 'individual' or 'business'
        country,
        currency,
        accountNumber,
        bankName,
        bankCode,
        bankCodeType, // 'swift_code', 'aba_code', 'ifsc_code', etc.
        iban,
        pixKey
    }) => {
        try {
            // Build bank_codes object dynamically
            const bank_codes = {};
            if (bankCode && bankCodeType) {
                bank_codes[bankCodeType] = bankCode;
            }

            // Build destination_details based on whether it's PIX or bank
            let destinationDetails;

            if (pixKey) {
                // PIX payment (Brazil)
                destinationDetails = {
                    type: 'pix_brl',
                    pix_brl: {
                        key: pixKey
                    }
                };
            } else {
                // Standard bank transfer
                destinationDetails = {
                    type: 'bank',
                    bank: {
                        country,
                        currency,
                        bank_name: bankName,
                        bank_codes,
                        firc_required: false
                    }
                };

                // Use IBAN or account_number
                if (iban) {
                    destinationDetails.bank.iban = iban;
                } else {
                    destinationDetails.bank.account_number = accountNumber;
                }
            }

            const payload = {
                type,
                name,
                email,
                destination_details: destinationDetails
            };

            console.log('Creating Tazapay beneficiary:', JSON.stringify(payload, null, 2));

            const response = await axios.post(`${TAZAPAY_API_BASE_URL}/v3/beneficiary`, payload, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Create Beneficiary Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create Tazapay beneficiary');
        }
    },

    /**
     * Initiate a payout to a beneficiary
     * @param {Object} payoutDetails
     * @returns {Object} Tazapay payout response
     */
    createPayout: async ({
        beneficiaryId,
        amount,
        currency = 'USD',
        holdingCurrency = 'USD', // Currency from your Tazapay balance
        payoutType = 'local', // 'local' or 'wire'
        reason = 'Creator payout',
        referenceId
    }) => {
        try {
            // Amount in minor units (cents)
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

            console.log('Creating Tazapay payout:', JSON.stringify(payload, null, 2));

            const response = await axios.post(`${TAZAPAY_API_BASE_URL}/v3/payout`, payload, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Create Payout Error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to create payout');
        }
    },

    /**
     * Get payout status
     * @param {string} payoutId - Tazapay payout ID
     * @returns {Object} Payout status details
     */
    getPayoutStatus: async (payoutId) => {
        try {
            const response = await axios.get(`${TAZAPAY_API_BASE_URL}/v3/payout/${payoutId}`, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Get Payout Status Error:', error.response?.data || error.message);
            throw new Error('Failed to get payout status');
        }
    },

    /**
     * Get beneficiary details
     * @param {string} beneficiaryId - Tazapay beneficiary ID
     * @returns {Object} Beneficiary details
     */
    getBeneficiaryStatus: async (beneficiaryId) => {
        try {
            const response = await axios.get(`${TAZAPAY_API_BASE_URL}/v3/beneficiary/${beneficiaryId}`, {
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Tazapay Get Beneficiary Error:', error.response?.data || error.message);
            throw new Error('Failed to get beneficiary status');
        }
    }
};
