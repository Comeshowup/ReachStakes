/**
 * In-Process Payout Queue with Retry Logic
 * 
 * Processes pending CreatorPayout records with exponential backoff.
 * Designed to work without Redis/BullMQ — runs in-process.
 * 
 * For production scale, replace with BullMQ + Redis.
 * 
 * Usage:
 *   import { payoutQueue } from './services/payoutQueue.js';
 *   payoutQueue.start(); // Call on server startup
 */
import { prisma } from '../config/db.js';
import { tazapayService } from './tazapayService.js';
import { safeLog, safeError } from '../utils/logMasker.js';
import { logPayoutAudit, AuditActions } from '../utils/auditLogger.js';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5000;       // 5 seconds
const POLL_INTERVAL_MS = 30_000;  // 30 seconds
const MAX_CONCURRENT = 3;         // Max concurrent payout processing

let isRunning = false;
let intervalId = null;
let activeCount = 0;

/**
 * Process a single pending payout — send to Tazapay.
 */
const processPayout = async (payout) => {
    const { id, creatorId, amount, currency } = payout;
    safeLog(`[PayoutQueue] Processing payout #${id}`, { amount, currency, retryCount: payout.retryCount });

    try {
        // Get creator's beneficiary ID
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: creatorId },
            select: { tazapayBeneficiaryId: true, fullName: true, payoutStatus: true },
        });

        if (!creatorProfile?.tazapayBeneficiaryId) {
            throw new Error('Creator has no beneficiary configured');
        }

        if (creatorProfile.payoutStatus !== 'Active') {
            throw new Error(`Creator payout status is ${creatorProfile.payoutStatus}, not Active`);
        }

        // Mark as processing
        await prisma.creatorPayout.update({
            where: { id },
            data: { status: 'Processing' },
        });

        // Call Tazapay API
        const result = await tazapayService.createPayout({
            beneficiaryId: creatorProfile.tazapayBeneficiaryId,
            amount: parseFloat(amount),
            currency,
            holdingCurrency: currency,
            payoutType: 'local',
            reason: `Payout for ${creatorProfile.fullName || 'Creator'}`,
            referenceId: payout.idempotencyKey || `payout_${id}`,
        });

        // Update with Tazapay payout ID
        await prisma.creatorPayout.update({
            where: { id },
            data: {
                tazapayPayoutId: result.data?.id || null,
                status: 'Processing', // Will be updated to Completed/Failed via webhook
            },
        });

        await logPayoutAudit({
            userId: creatorId,
            action: AuditActions.PAYOUT_INITIATED,
            payoutId: id,
            amount: parseFloat(amount),
            currency,
        });

        safeLog(`[PayoutQueue] Payout #${id} sent to Tazapay`, { tazapayId: result.data?.id });

    } catch (err) {
        safeError(`[PayoutQueue] Payout #${id} failed (attempt ${payout.retryCount + 1}/${MAX_RETRIES})`, err);

        const newRetryCount = payout.retryCount + 1;
        const isFinalAttempt = newRetryCount >= MAX_RETRIES;

        await prisma.creatorPayout.update({
            where: { id },
            data: {
                retryCount: newRetryCount,
                status: isFinalAttempt ? 'Failed' : 'Pending', // Back to Pending for retry, Failed if max
                failureReason: isFinalAttempt
                    ? `Max retries exceeded. Last error: ${err.message?.substring(0, 200)}`
                    : null,
            },
        });

        if (isFinalAttempt) {
            await logPayoutAudit({
                userId: creatorId,
                action: AuditActions.PAYOUT_FAILED,
                payoutId: id,
                amount: parseFloat(amount),
                currency,
            });
            safeLog(`[PayoutQueue] Payout #${id} moved to dead-letter (max retries exceeded)`);
        }
    }
};

/**
 * Poll for pending payouts and process them.
 */
const pollAndProcess = async () => {
    if (activeCount >= MAX_CONCURRENT) return;

    try {
        // Find pending payouts that haven't exceeded max retries
        const pendingPayouts = await prisma.creatorPayout.findMany({
            where: {
                status: 'Pending',
                retryCount: { lt: MAX_RETRIES },
                payoutType: { not: 'manual_request' }, // Don't auto-process manual requests
            },
            orderBy: { initiatedAt: 'asc' },
            take: MAX_CONCURRENT - activeCount,
        });

        if (pendingPayouts.length === 0) return;

        safeLog(`[PayoutQueue] Found ${pendingPayouts.length} pending payouts`);

        for (const payout of pendingPayouts) {
            if (activeCount >= MAX_CONCURRENT) break;

            activeCount++;
            // Process with delay based on retry count (exponential backoff)
            const delay = payout.retryCount > 0 ? BASE_DELAY_MS * Math.pow(2, payout.retryCount - 1) : 0;

            if (delay > 0) {
                safeLog(`[PayoutQueue] Waiting ${delay}ms before retry for payout #${payout.id}`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            try {
                await processPayout(payout);
            } finally {
                activeCount--;
            }
        }
    } catch (err) {
        safeError('[PayoutQueue] Poll error', err);
    }
};

/**
 * Payout queue controller.
 */
export const payoutQueue = {
    /**
     * Start the payout queue polling loop.
     */
    start: () => {
        if (isRunning) {
            console.log('[PayoutQueue] Already running');
            return;
        }

        isRunning = true;
        console.log(`[PayoutQueue] Started (poll every ${POLL_INTERVAL_MS / 1000}s, max ${MAX_CONCURRENT} concurrent)`);

        // Initial poll
        pollAndProcess();

        // Set up polling interval
        intervalId = setInterval(pollAndProcess, POLL_INTERVAL_MS);
    },

    /**
     * Stop the payout queue.
     */
    stop: () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        isRunning = false;
        console.log('[PayoutQueue] Stopped');
    },

    /**
     * Manually trigger a poll (e.g., after creating a new payout).
     */
    trigger: () => {
        if (!isRunning) return;
        pollAndProcess();
    },

    /**
     * Get queue status for monitoring.
     */
    getStatus: () => ({
        isRunning,
        activeCount,
        pollIntervalMs: POLL_INTERVAL_MS,
        maxConcurrent: MAX_CONCURRENT,
        maxRetries: MAX_RETRIES,
    }),
};
