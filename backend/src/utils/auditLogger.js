/**
 * Audit Logger
 * 
 * Records non-sensitive audit events to the AuditLog table.
 * Creates an immutable trail of security-relevant actions.
 * 
 * NEVER log raw PII — only metadata and action descriptions.
 * 
 * Usage:
 *   import { logAudit } from '../utils/auditLogger.js';
 *   await logAudit({ userId: 42, action: 'BANK_CONNECTED', resource: 'beneficiary', metadata: { country: 'US' }, req });
 */
import { prisma } from '../config/db.js';
import { maskSensitive } from './logMasker.js';

// Actions that can be audited
export const AuditActions = {
    // Onboarding
    ONBOARDING_INITIATED: 'ONBOARDING_INITIATED',
    ONBOARDING_COMPLETED: 'ONBOARDING_COMPLETED',
    ONBOARDING_FAILED: 'ONBOARDING_FAILED',

    // Bank connection
    BANK_CONNECTED: 'BANK_CONNECTED',
    BANK_DISCONNECTED: 'BANK_DISCONNECTED',
    BANK_CONNECT_FAILED: 'BANK_CONNECT_FAILED',

    // Payouts
    PAYOUT_REQUESTED: 'PAYOUT_REQUESTED',
    PAYOUT_INITIATED: 'PAYOUT_INITIATED',
    PAYOUT_COMPLETED: 'PAYOUT_COMPLETED',
    PAYOUT_FAILED: 'PAYOUT_FAILED',

    // Withdrawals
    WITHDRAWAL_REQUESTED: 'WITHDRAWAL_REQUESTED',
    WITHDRAWAL_PROCESSED: 'WITHDRAWAL_PROCESSED',
    WITHDRAWAL_FAILED: 'WITHDRAWAL_FAILED',

    // Webhooks
    WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
    WEBHOOK_PROCESSED: 'WEBHOOK_PROCESSED',
    WEBHOOK_REJECTED: 'WEBHOOK_REJECTED',
    WEBHOOK_DUPLICATE: 'WEBHOOK_DUPLICATE',

    // Security events
    RATE_LIMIT_HIT: 'RATE_LIMIT_HIT',
    AUTH_FAILURE: 'AUTH_FAILURE',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
};

/**
 * Log an audit event. 
 * Fire-and-forget — errors in audit logging should never break the main flow.
 * 
 * @param {Object} params
 * @param {number} params.userId - User ID (null for system/webhook events)
 * @param {string} params.action - One of AuditActions
 * @param {string} params.resource - Resource type (e.g., 'beneficiary', 'payout', 'webhook')
 * @param {Object} [params.metadata] - Non-sensitive metadata (will be auto-masked)
 * @param {Object} [params.req] - Express request object (for extracting IP)
 */
export const logAudit = async ({ userId = null, action, resource, metadata = null, req = null }) => {
    try {
        const ipAddress = req
            ? (req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || null)
            : null;

        // Auto-mask any metadata to be safe
        const safeMeta = metadata ? maskSensitive(metadata) : null;

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                ipAddress: ipAddress?.substring(0, 45) || null,
                metadata: safeMeta,
            },
        });
    } catch (err) {
        // Never let audit logging break the main flow
        console.error('[AuditLogger] Failed to write audit log:', err.message);
    }
};

/**
 * Log a payout-specific audit event with standard metadata.
 */
export const logPayoutAudit = async ({ userId, action, payoutId, amount, currency, req }) => {
    await logAudit({
        userId,
        action,
        resource: 'payout',
        metadata: { payoutId, amount, currency },
        req,
    });
};

/**
 * Log a bank connection audit event.
 */
export const logBankAudit = async ({ userId, action, country, lastFour, req }) => {
    await logAudit({
        userId,
        action,
        resource: 'beneficiary',
        metadata: { country, lastFour },
        req,
    });
};

/**
 * Log a webhook audit event.
 */
export const logWebhookAudit = async ({ eventType, eventId, status, req }) => {
    await logAudit({
        userId: null,
        action: status === 'duplicate' ? AuditActions.WEBHOOK_DUPLICATE : AuditActions.WEBHOOK_RECEIVED,
        resource: 'webhook',
        metadata: { eventType, eventId, status },
        req,
    });
};
