import { tazapayService } from '../services/tazapayService.js';
import { applyReferralBonus } from './referralController.js';
import { PrismaClient } from '@prisma/client';
import { safeLog, safeError } from '../utils/logMasker.js';
import { logAudit, logBankAudit, logPayoutAudit, logWebhookAudit, AuditActions } from '../utils/auditLogger.js';
import { sanitize } from '../utils/validator.js';

const prisma = new PrismaClient();

/**
 * Get required bank fields for a country/currency
 * GET /api/payouts/bank-fields?country=US&currency=USD
 */
export const getBankFields = async (req, res) => {
    try {
        const { country, currency = 'USD' } = req.query;

        if (!country) {
            return res.status(400).json({
                success: false,
                message: 'Country code is required'
            });
        }

        const fieldConfig = tazapayService.getBankFieldsForCountry(country.toUpperCase(), currency);

        return res.json({
            success: true,
            data: {
                country: country.toUpperCase(),
                currency,
                ...fieldConfig
            }
        });
    } catch (error) {
        console.error('Get Bank Fields Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get bank field requirements'
        });
    }
};

// ============================================
// SECURE HOSTED ONBOARDING (RECOMMENDED)
// ============================================

/**
 * Initiate secure hosted onboarding
 * Creates a Tazapay Entity and returns a redirect URL to their secure portal
 * POST /api/payouts/initiate-onboarding
 */
export const initiateOnboarding = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user and creator profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { creatorProfile: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.creatorProfile) {
            return res.status(400).json({ success: false, message: 'Creator profile not found' });
        }

        // Validate email format before sending to Tazapay
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailRegex.test(user.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address. Please update your email in your profile settings before connecting a bank account.'
            });
        }

        // Check if already has active bank connection
        if (user.creatorProfile.tazapayBeneficiaryId && user.creatorProfile.payoutStatus === 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Bank account already connected. Please disconnect first to re-onboard.'
            });
        }

        // Check if there's an existing pending onboarding link that hasn't expired
        if (user.creatorProfile.onboardingLinkUrl &&
            user.creatorProfile.onboardingExpiresAt &&
            new Date(user.creatorProfile.onboardingExpiresAt) > new Date()) {
            return res.json({
                success: true,
                message: 'Existing onboarding link is still valid',
                data: {
                    onboardingUrl: user.creatorProfile.onboardingLinkUrl,
                    entityId: user.creatorProfile.tazapayEntityId,
                    expiresAt: user.creatorProfile.onboardingExpiresAt,
                    status: user.creatorProfile.onboardingStatus
                }
            });
        }

        // Create Entity in Tazapay (only minimal info - no PII)
        const entityResult = await tazapayService.createEntity({
            name: user.creatorProfile.fullName || user.name,
            email: user.email,
            referenceId: `creator_${userId}`
        });

        if (entityResult.status !== 'success') {
            throw new Error(entityResult.message || 'Failed to create entity');
        }

        const entityData = entityResult.data;
        const entityId = entityData.id;

        // Try to get onboarding URL from entity response first
        let onboardingUrl = entityData.onboarding_package_url ||
            entityData.link_to_onboarding_package_for_the_entity ||
            entityData.onboarding_link ||
            entityData.hosted_onboarding_url;

        // If not returned in entity response, generate it via separate API call
        if (!onboardingUrl) {
            console.log('Onboarding URL not in entity response, generating via API...');
            try {
                const linkResult = await tazapayService.regenerateOnboardingLink(entityId);
                console.log('Link generation response:', JSON.stringify(linkResult, null, 2));
                onboardingUrl = linkResult.data?.onboarding_package_url ||
                    linkResult.data?.link_to_onboarding_package_for_the_entity ||
                    linkResult.data?.onboarding_link ||
                    linkResult.data?.url ||
                    linkResult.onboarding_package_url ||
                    linkResult.url;
                console.log('Generated onboarding link:', onboardingUrl);
            } catch (linkError) {
                console.error('Failed to generate onboarding link:', linkError.message);
                // We will fall back to manual entry below
            }
        }


        if (!onboardingUrl) {
            console.log('Tazapay hosted onboarding URL not available, saving entity for manual entry fallback');

            // Save the entity ID and enable manual bank entry fallback
            await prisma.creatorProfile.update({
                where: { userId },
                data: {
                    tazapayEntityId: entityId,
                    onboardingStatus: 'InProgress'
                }
            });

            // Return a response that tells the frontend to use manual bank entry
            return res.json({
                success: true,
                message: 'Entity created. Tazapay hosted onboarding is not available - please use manual bank entry.',
                data: {
                    entityId,
                    onboardingUrl: null,
                    useManualEntry: true,
                    note: 'Tazapay sandbox may not provide hosted onboarding. Use the Connect Bank form instead.'
                }
            });
        }

        // Calculate expiration (7 days from now)
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Update creator profile with entity info
        await prisma.creatorProfile.update({
            where: { userId },
            data: {
                tazapayEntityId: entityId,
                onboardingStatus: 'LinkGenerated',
                onboardingLinkUrl: onboardingUrl,
                onboardingExpiresAt: expiresAt
            }
        });

        return res.json({
            success: true,
            message: 'Onboarding initiated. Redirect to the provided URL to complete setup.',
            data: {
                onboardingUrl,
                entityId,
                expiresAt,
                expiresIn: '7 days'
            }
        });

    } catch (error) {
        console.error('Initiate Onboarding Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate onboarding'
        });
    }
};

/**
 * Get current onboarding status
 * GET /api/payouts/onboarding-status
 */
export const getOnboardingStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                tazapayEntityId: true,
                tazapayBeneficiaryId: true,
                onboardingStatus: true,
                onboardingLinkUrl: true,
                onboardingExpiresAt: true,
                payoutStatus: true,
                bankName: true,
                bankLastFour: true,
                bankCountry: true,
                bankCurrency: true,
                bankingSetupAt: true
            }
        });

        if (!creatorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
        }

        // Check if link is expired
        const isLinkExpired = creatorProfile.onboardingLinkUrl &&
            creatorProfile.onboardingExpiresAt &&
            new Date(creatorProfile.onboardingExpiresAt) < new Date();

        // If entity exists but no beneficiary yet, try to fetch latest status from Tazapay
        let tazapayStatus = null;
        if (creatorProfile.tazapayEntityId && !creatorProfile.tazapayBeneficiaryId) {
            try {
                const entityStatus = await tazapayService.getEntityStatus(creatorProfile.tazapayEntityId);
                tazapayStatus = entityStatus.data?.approval_status || entityStatus.data?.status;
            } catch (e) {
                console.warn('Could not fetch entity status from Tazapay:', e.message);
            }
        }

        return res.json({
            success: true,
            data: {
                entityId: creatorProfile.tazapayEntityId,
                beneficiaryId: creatorProfile.tazapayBeneficiaryId,
                onboardingStatus: creatorProfile.onboardingStatus || 'NotStarted',
                tazapayStatus,
                isComplete: !!creatorProfile.tazapayBeneficiaryId,
                isActive: creatorProfile.payoutStatus === 'Active',
                onboardingLink: isLinkExpired ? null : creatorProfile.onboardingLinkUrl,
                linkExpired: isLinkExpired,
                expiresAt: creatorProfile.onboardingExpiresAt,
                bankDetails: creatorProfile.tazapayBeneficiaryId ? {
                    bankName: creatorProfile.bankName,
                    lastFour: creatorProfile.bankLastFour,
                    country: creatorProfile.bankCountry,
                    currency: creatorProfile.bankCurrency,
                    connectedAt: creatorProfile.bankingSetupAt
                } : null
            }
        });

    } catch (error) {
        console.error('Get Onboarding Status Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get onboarding status'
        });
    }
};

/**
 * Regenerate onboarding link if expired
 * POST /api/payouts/regenerate-link
 */
export const regenerateOnboardingLink = async (req, res) => {
    try {
        const userId = req.user.id;

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId }
        });

        if (!creatorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
        }

        if (!creatorProfile.tazapayEntityId) {
            return res.status(400).json({
                success: false,
                message: 'No onboarding in progress. Please initiate onboarding first.'
            });
        }

        if (creatorProfile.tazapayBeneficiaryId) {
            return res.status(400).json({
                success: false,
                message: 'Onboarding already completed.'
            });
        }

        // Regenerate link via Tazapay API
        const linkResult = await tazapayService.regenerateOnboardingLink(creatorProfile.tazapayEntityId);

        const newOnboardingUrl = linkResult.data?.link_to_onboarding_package_for_the_entity ||
            linkResult.data?.onboarding_link ||
            linkResult.data?.url;

        if (!newOnboardingUrl) {
            throw new Error('Failed to generate new onboarding link');
        }

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.creatorProfile.update({
            where: { userId },
            data: {
                onboardingLinkUrl: newOnboardingUrl,
                onboardingExpiresAt: expiresAt,
                onboardingStatus: 'LinkGenerated'
            }
        });

        return res.json({
            success: true,
            message: 'New onboarding link generated',
            data: {
                onboardingUrl: newOnboardingUrl,
                expiresAt,
                expiresIn: '7 days'
            }
        });

    } catch (error) {
        console.error('Regenerate Onboarding Link Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to regenerate onboarding link'
        });
    }
};

// ── In-memory rate limiter for bank connection attempts ──
const bankConnectAttempts = new Map(); // userId → { count, resetAt }
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const checkBankConnectRateLimit = (userId) => {
    const now = Date.now();
    const entry = bankConnectAttempts.get(userId);

    if (!entry || now > entry.resetAt) {
        bankConnectAttempts.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
};

// ── Input sanitization helpers ──
const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>"'&;(){}]/g, '').trim();
};

const isValidCountryCode = (code) => /^[A-Z]{2}$/.test(code);
const isValidCurrencyCode = (code) => /^[A-Z]{3}$/.test(code);
const isValidAccountNumber = (num) => /^[0-9]{4,34}$/.test(num);
const isValidIBAN = (iban) => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban.replace(/\s/g, ''));
const isValidBankCode = (code) => /^[A-Z0-9]{3,11}$/.test(code.replace(/[-\s]/g, ''));
const isValidBankName = (name) => /^[a-zA-Z0-9\s.&'-]{2,100}$/.test(name);
const isValidPixKey = (key) => {
    // PIX: email, phone (+55...), CPF (11 digits), CNPJ (14 digits), or random key (UUID)
    return /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+\d{10,15}|\d{11,14}|[0-9a-f-]{32,36})$/.test(key);
};

/**
 * Connect bank account securely
 * POST /api/payouts/connect-bank
 *
 * Security measures:
 * - Rate limited: 5 attempts per 15 minutes per user
 * - All inputs validated and sanitized
 * - PII (account numbers) are ONLY sent to Tazapay, never stored in our DB
 * - Only metadata (last 4 digits, bank name) is persisted
 */
export const connectBank = async (req, res) => {
    try {
        const userId = req.user.id;

        // ── Rate limiting ──
        if (!checkBankConnectRateLimit(userId)) {
            return res.status(429).json({
                success: false,
                message: 'Too many bank connection attempts. Please wait 15 minutes before trying again.'
            });
        }

        // ── Extract and sanitize inputs ──
        const country = sanitizeString(req.body.country).toUpperCase();
        const currency = sanitizeString(req.body.currency).toUpperCase();
        const bankName = sanitizeString(req.body.bankName);
        const accountNumber = sanitizeString(req.body.accountNumber);
        const bankCode = sanitizeString(req.body.bankCode).toUpperCase();
        const bankCodeType = sanitizeString(req.body.bankCodeType);
        const iban = sanitizeString(req.body.iban).toUpperCase().replace(/\s/g, '');
        const pixKey = sanitizeString(req.body.pixKey);
        const addressLine1 = sanitizeString(req.body.addressLine1);
        const addressCity = sanitizeString(req.body.addressCity);
        const addressState = sanitizeString(req.body.addressState);
        const addressPostalCode = sanitizeString(req.body.addressPostalCode);

        // ── Validate required fields ──
        if (!country || !isValidCountryCode(country)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid country code. Must be a 2-letter ISO country code (e.g. US, GB, IN).'
            });
        }

        if (!currency || !isValidCurrencyCode(currency)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid currency code. Must be a 3-letter ISO currency code (e.g. USD, GBP).'
            });
        }

        // ── Validate bank-specific fields based on type ──
        const isPix = bankCodeType === 'pix_brl' || country === 'BR';
        const isIban = iban && iban.length > 0;

        if (isPix) {
            if (!pixKey || !isValidPixKey(pixKey)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid PIX key. Must be a valid email, phone number, CPF, or random key.'
                });
            }
        } else if (isIban) {
            if (!isValidIBAN(iban)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid IBAN format. Please check and try again.'
                });
            }
            if (!bankName || !isValidBankName(bankName)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bank name. Must be 2-100 characters, letters, numbers, spaces, periods, and hyphens only.'
                });
            }
        } else {
            if (!accountNumber || !isValidAccountNumber(accountNumber)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid account number. Must be 4-34 digits only.'
                });
            }
            if (!bankName || !isValidBankName(bankName)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bank name. Must be 2-100 characters, letters, numbers, spaces, periods, and hyphens only.'
                });
            }
            if (bankCode && !isValidBankCode(bankCode)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid ${bankCodeType || 'bank code'}. Must be 3-11 alphanumeric characters.`
                });
            }
        }

        // ── Get user and creator profile ──
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { creatorProfile: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.creatorProfile) {
            return res.status(400).json({ success: false, message: 'Creator profile not found' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email || !emailRegex.test(user.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address. Please update your email in settings before connecting a bank account.'
            });
        }

        // Check if already connected
        if (user.creatorProfile.tazapayBeneficiaryId) {
            return res.status(400).json({
                success: false,
                message: 'Bank account already connected. Please disconnect first.'
            });
        }

        // ── Create beneficiary in Tazapay (PII is sent ONLY here) ──
        const beneficiaryResult = await tazapayService.createBeneficiary({
            name: user.creatorProfile.fullName || user.name,
            email: user.email,
            type: 'individual',
            country,
            currency,
            accountNumber: isPix ? undefined : (isIban ? undefined : accountNumber),
            bankName: isPix ? undefined : bankName,
            bankCode: bankCode || undefined,
            bankCodeType: bankCodeType || undefined,
            iban: isIban ? iban : undefined,
            pixKey: isPix ? pixKey : undefined,
            addressLine1,
            addressCity,
            addressState,
            addressPostalCode,
        });

        if (beneficiaryResult.status !== 'success') {
            throw new Error(beneficiaryResult.message || 'Failed to create beneficiary');
        }

        const beneficiaryId = beneficiaryResult.data.id;

        // ── Store ONLY metadata — no raw account numbers ──
        let lastFour = null;
        if (accountNumber) lastFour = accountNumber.slice(-4);
        else if (iban) lastFour = iban.slice(-4);
        else if (pixKey) lastFour = pixKey.slice(-4);

        await prisma.creatorProfile.update({
            where: { userId },
            data: {
                tazapayBeneficiaryId: beneficiaryId,
                payoutStatus: 'Active',
                bankCountry: country,
                bankCurrency: currency,
                bankName: bankName || (isPix ? 'PIX' : null),
                bankLastFour: lastFour,
                bankingSetupAt: new Date(),
                // Clear any pending onboarding state
                onboardingStatus: 'Complete',
                onboardingLinkUrl: null,
                onboardingExpiresAt: null,
            }
        });

        console.log(`✅ Bank connected for user ${userId}: ${country}/${currency}, last4: ${lastFour}`);

        // Audit trail
        await logBankAudit({ userId, action: AuditActions.BANK_CONNECTED, country, lastFour, req });

        // Create Beneficiary record
        try {
            await prisma.beneficiary.create({
                data: {
                    creatorId: userId,
                    tazapayBeneficiaryId: beneficiaryId,
                    bankName: bankName || (isPix ? 'PIX' : null),
                    lastFour,
                    country,
                    currency,
                    status: 'Active',
                    isPrimary: true,
                },
            });
        } catch (beneficiaryErr) {
            // Non-fatal — beneficiary record is supplementary
            console.warn('Failed to create Beneficiary record:', beneficiaryErr.message);
        }

        return res.json({
            success: true,
            message: 'Bank account connected successfully',
            data: {
                beneficiaryId,
                bankName: bankName || (isPix ? 'PIX' : null),
                bankLastFour: lastFour,
                country,
                currency,
                status: 'Active'
            }
        });

    } catch (error) {
        console.error('Connect Bank Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to connect bank account'
        });
    }
};

/**
 * Get payout setup status
 * GET /api/payouts/status
 */
export const getPayoutStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                payoutStatus: true,
                bankCountry: true,
                bankCurrency: true,
                bankName: true,
                bankLastFour: true,
                bankingSetupAt: true,
                tazapayBeneficiaryId: true
            }
        });

        if (!creatorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Creator profile not found'
            });
        }

        return res.json({
            success: true,
            data: {
                isConnected: !!creatorProfile.tazapayBeneficiaryId,
                status: creatorProfile.payoutStatus || 'Inactive',
                bankName: creatorProfile.bankName,
                bankLastFour: creatorProfile.bankLastFour,
                bankCountry: creatorProfile.bankCountry,
                bankCurrency: creatorProfile.bankCurrency,
                connectedAt: creatorProfile.bankingSetupAt
            }
        });

    } catch (error) {
        console.error('Get Payout Status Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get payout status'
        });
    }
};

/**
 * Disconnect bank account
 * POST /api/payouts/disconnect
 */
export const disconnectBank = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check for pending payouts before disconnecting
        const pendingPayouts = await prisma.creatorPayout.count({
            where: {
                creatorId: userId,
                status: { in: ['Pending', 'Processing'] }
            }
        });

        if (pendingPayouts > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot disconnect: You have ${pendingPayouts} pending payout(s)`
            });
        }

        // Update creator profile to remove bank info
        await prisma.creatorProfile.update({
            where: { userId },
            data: {
                tazapayBeneficiaryId: null,
                payoutStatus: 'Inactive',
                bankCountry: null,
                bankCurrency: null,
                bankName: null,
                bankLastFour: null,
                bankingSetupAt: null
            }
        });

        return res.json({
            success: true,
            message: 'Bank account disconnected successfully'
        });

    } catch (error) {
        console.error('Disconnect Bank Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to disconnect bank account'
        });
    }
};

/**
 * Get payout history
 * GET /api/payouts/history?page=1&limit=10
 */
export const getPayoutHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [payouts, total] = await Promise.all([
            prisma.creatorPayout.findMany({
                where: { creatorId: userId },
                orderBy: { initiatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.creatorPayout.count({
                where: { creatorId: userId }
            })
        ]);

        return res.json({
            success: true,
            data: {
                payouts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get Payout History Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get payout history'
        });
    }
};

/**
 * Initiate a payout (admin/system use)
 * POST /api/payouts/initiate
 */
export const initiatePayout = async (req, res) => {
    try {
        const { creatorId, amount, currency = 'USD', collaborationId, reason } = req.body;

        // Get creator profile with beneficiary
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: creatorId },
            include: { user: true }
        });

        if (!creatorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Creator not found'
            });
        }

        if (!creatorProfile.tazapayBeneficiaryId) {
            return res.status(400).json({
                success: false,
                message: 'Creator has not set up bank account for payouts'
            });
        }

        if (creatorProfile.payoutStatus !== 'Active') {
            return res.status(400).json({
                success: false,
                message: `Payout not allowed. Status: ${creatorProfile.payoutStatus}`
            });
        }

        // Create payout record first
        const payoutRecord = await prisma.creatorPayout.create({
            data: {
                creatorId,
                collaborationId,
                amount,
                currency,
                status: 'Pending',
                payoutType: 'local'
            }
        });

        try {
            // Initiate payout in Tazapay
            const payoutResult = await tazapayService.createPayout({
                beneficiaryId: creatorProfile.tazapayBeneficiaryId,
                amount,
                currency,
                holdingCurrency: currency,
                payoutType: 'local',
                reason: reason || `Payout for ${creatorProfile.fullName}`,
                referenceId: `payout_${payoutRecord.id}`
            });

            // Update payout record with Tazapay ID
            await prisma.creatorPayout.update({
                where: { id: payoutRecord.id },
                data: {
                    tazapayPayoutId: payoutResult.data?.id,
                    status: 'Processing'
                }
            });

            return res.json({
                success: true,
                message: 'Payout initiated successfully',
                data: {
                    payoutId: payoutRecord.id,
                    tazapayPayoutId: payoutResult.data?.id,
                    amount,
                    currency,
                    status: 'Processing'
                }
            });

        } catch (tazapayError) {
            // Mark payout as failed
            await prisma.creatorPayout.update({
                where: { id: payoutRecord.id },
                data: {
                    status: 'Failed',
                    failureReason: tazapayError.message
                }
            });

            throw tazapayError;
        }

    } catch (error) {
        console.error('Initiate Payout Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate payout'
        });
    }
};

/**
 * Handle Tazapay webhooks (payout, entity, beneficiary events)
 * POST /api/payouts/webhook
 */
export const handlePayoutWebhook = async (req, res) => {
    try {
        // Verify webhook signature
        if (!tazapayService.verifyWebhook(req)) {
            await logWebhookAudit({ eventType: 'unknown', eventId: null, status: 'rejected', req });
            return res.status(401).json({ message: 'Invalid webhook signature' });
        }

        const { event, data } = req.body;
        const webhookEventId = data?.id || data?.reference_id || `${event}_${Date.now()}`;

        safeLog('Tazapay webhook received:', { event, id: webhookEventId });

        // ── Idempotency check ──
        try {
            const existing = await prisma.webhookEvent.findUnique({
                where: { eventId: webhookEventId },
            });

            if (existing?.status === 'processed') {
                safeLog(`Webhook already processed, skipping: ${webhookEventId}`);
                await logWebhookAudit({ eventType: event, eventId: webhookEventId, status: 'duplicate', req });
                return res.json({ received: true, duplicate: true });
            }

            // Record the event
            await prisma.webhookEvent.upsert({
                where: { eventId: webhookEventId },
                create: {
                    eventId: webhookEventId,
                    eventType: event,
                    status: 'received',
                    payload: { event, dataKeys: Object.keys(data || {}) }, // Non-sensitive
                },
                update: {
                    status: 'received',
                },
            });
        } catch (idempotencyErr) {
            // Non-fatal — continue processing even if idempotency check fails
            console.warn('Webhook idempotency check error:', idempotencyErr.message);
        }

        // ============================================
        // ENTITY ONBOARDING EVENTS
        // ============================================
        if (event === 'entity.approval_succeeded' || event === 'entity.onboarding.succeeded') {
            console.log('Entity approved webhook received');

            const entityId = data.id;
            const referenceId = data.reference_id;
            const beneficiaryId = data.beneficiary_id;

            // Find creator by entity ID
            let creatorProfile = await prisma.creatorProfile.findFirst({
                where: { tazapayEntityId: entityId }
            });

            // Fallback: try to find by reference_id
            if (!creatorProfile && referenceId && referenceId.startsWith('creator_')) {
                const userId = parseInt(referenceId.replace('creator_', ''));
                creatorProfile = await prisma.creatorProfile.findUnique({
                    where: { userId }
                });
            }

            if (creatorProfile) {
                // Extract bank details from webhook if provided
                const bankDetails = data.destination_details?.bank || {};

                await prisma.creatorProfile.update({
                    where: { userId: creatorProfile.userId },
                    data: {
                        tazapayBeneficiaryId: beneficiaryId || entityId,
                        onboardingStatus: 'Approved',
                        payoutStatus: 'Active',
                        onboardingLinkUrl: null, // Clear the link
                        bankName: bankDetails.bank_name || null,
                        bankLastFour: bankDetails.account_number?.slice(-4) ||
                            bankDetails.iban?.slice(-4) || null,
                        bankCountry: bankDetails.country || data.country || null,
                        bankCurrency: bankDetails.currency || data.currency || null,
                        bankingSetupAt: new Date()
                    }
                });

                console.log(`Creator ${creatorProfile.userId} onboarding approved, beneficiary ID: ${beneficiaryId || entityId}`);
            } else {
                console.warn('Entity approved but creator not found:', entityId, referenceId);
            }
        }

        // Handle entity rejection
        else if (event === 'entity.approval_rejected' || event === 'entity.onboarding.failed') {
            console.log('Entity rejected webhook received');

            const entityId = data.id;
            const referenceId = data.reference_id;

            let creatorProfile = await prisma.creatorProfile.findFirst({
                where: { tazapayEntityId: entityId }
            });

            if (!creatorProfile && referenceId && referenceId.startsWith('creator_')) {
                const userId = parseInt(referenceId.replace('creator_', ''));
                creatorProfile = await prisma.creatorProfile.findUnique({
                    where: { userId }
                });
            }

            if (creatorProfile) {
                await prisma.creatorProfile.update({
                    where: { userId: creatorProfile.userId },
                    data: {
                        onboardingStatus: 'Rejected',
                        payoutStatus: 'Inactive'
                    }
                });

                console.log(`Creator ${creatorProfile.userId} onboarding rejected`);
            }
        }

        // ============================================
        // BENEFICIARY EVENTS
        // ============================================
        else if (event === 'beneficiary.succeeded' || event === 'beneficiary.created') {
            console.log('Beneficiary created webhook received');

            const beneficiaryId = data.id;
            const email = data.email;

            // Try to find creator by email
            if (email) {
                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { creatorProfile: true }
                });

                if (user?.creatorProfile && !user.creatorProfile.tazapayBeneficiaryId) {
                    await prisma.creatorProfile.update({
                        where: { userId: user.id },
                        data: {
                            tazapayBeneficiaryId: beneficiaryId,
                            onboardingStatus: 'Approved',
                            payoutStatus: 'Active',
                            bankingSetupAt: new Date()
                        }
                    });

                    console.log(`Beneficiary ${beneficiaryId} linked to creator ${user.id}`);
                }
            }
        }

        // ============================================
        // PAYOUT EVENTS
        // ============================================
        else if (event === 'payout.completed' || event === 'payout.success') {
            const referenceId = data.reference_id;

            if (referenceId && referenceId.startsWith('payout_')) {
                const payoutId = parseInt(referenceId.replace('payout_', ''));

                const completedPayout = await prisma.creatorPayout.update({
                    where: { id: payoutId },
                    data: {
                        status: 'Completed',
                        completedAt: new Date()
                    }
                });

                console.log(`Payout ${payoutId} completed`);

                // Phase 3: Apply Referral Bonus on FIRST payout
                try {
                    const completedCount = await prisma.creatorPayout.count({
                        where: {
                            creatorId: completedPayout.creatorId,
                            status: 'Completed'
                        }
                    });

                    if (completedCount === 1) {
                        console.log(`First payout for creator ${completedPayout.creatorId} - applying referral bonus`);
                        const creatorUser = await prisma.user.findUnique({
                            where: { id: completedPayout.creatorId }, // creatorId in payout table is user.id
                            select: { id: true } // verify exists
                        });

                        if (creatorUser) {
                            await applyReferralBonus(creatorUser.id, completedPayout.amount);
                        }
                    }
                } catch (bonusError) {
                    console.error("Failed to apply referral bonus:", bonusError);
                    // Don't block the webhook response
                }
            }
        } else if (event === 'payout.failed') {
            const referenceId = data.reference_id;

            if (referenceId && referenceId.startsWith('payout_')) {
                const payoutId = parseInt(referenceId.replace('payout_', ''));

                await prisma.creatorPayout.update({
                    where: { id: payoutId },
                    data: {
                        status: 'Failed',
                        failureReason: data.failure_reason || 'Payout failed'
                    }
                });

                console.log(`Payout ${payoutId} failed`);
            }
        }

        // ── Mark webhook as processed ──
        try {
            await prisma.webhookEvent.update({
                where: { eventId: webhookEventId },
                data: { status: 'processed', processedAt: new Date() },
            });
        } catch (updateErr) {
            console.warn('Failed to mark webhook as processed:', updateErr.message);
        }

        await logWebhookAudit({ eventType: event, eventId: webhookEventId, status: 'processed', req });

        return res.json({ received: true });

    } catch (error) {
        safeError('Webhook Error:', error);
        // Still return 200 to acknowledge receipt (prevents Tazapay retry floods)
        return res.json({ received: true, error: 'Internal processing error' });
    }
};
