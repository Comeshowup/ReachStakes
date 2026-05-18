import { prisma } from '../config/db.js';
import { safeLog } from '../utils/logMasker.js';
import { logPayoutAudit, AuditActions } from '../utils/auditLogger.js';
import { tazapayService } from '../services/tazapayService.js';
import crypto from 'crypto';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** ISO week number (Mon=1) */
function getWeek(d) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

/** Build a 12-month daily-granularity timeseries from paid transactions */
function buildTimeseries(paidTransactions) {
    // Group earned amounts by ISO date string key
    const byDate = {};
    for (const t of paidTransactions) {
        const key = new Date(t.transactionDate).toISOString().slice(0, 10);
        byDate[key] = (byDate[key] ?? 0) + parseFloat(t.amount ?? 0);
    }

    // Build a sparse array sorted by date — the FE EarningsGraph component handles its own grouping/filtering
    return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }));
}

// ─── GET /api/creators/earnings-summary ──────────────────────────────────────

/**
 * Aggregated earnings overview for the creator dashboard.
 * Returns balance, pending, timeseries, recent transactions, and payout settings.
 */
export const getEarningsSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Bank / payout config from creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                tazapayBeneficiaryId: true,
                payoutStatus: true,
                bankName: true,
                bankLastFour: true,
                bankCountry: true,
                bankCurrency: true,
            },
        });

        // No profile yet — return a safe zero-state so new creators see the empty dashboard
        if (!creatorProfile) {
            return res.json({
                status: 'success',
                data: {
                    availableBalance:   0,
                    pendingBalance:     0,
                    lifetimeEarnings:   0,
                    nextPayoutDate:     null,
                    bankConnected:      false,
                    bankName:           null,
                    bankLastFour:       null,
                    bankCountry:        null,
                    bankCurrency:       null,
                    payoutSchedule:     'on_request',
                    earningsTimeseries: [],
                    recentTransactions: [],
                },
            });
        }

        const bankConnected = !!(creatorProfile.tazapayBeneficiaryId && creatorProfile.payoutStatus === 'Active');

        // 2. Financial transactions (last 12 months — for chart + recent list)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

        const [transactions, completedPayouts, pendingCollabs] = await Promise.all([
            // All payment transactions for the creator
            prisma.transaction.findMany({
                where: {
                    userId,
                    type: 'Payment',
                    status: { in: ['Completed', 'Pending'] },
                },
                include: {
                    campaign: {
                        select: { id: true, title: true },
                    },
                },
                orderBy: { transactionDate: 'desc' },
            }),
            // CreatorPayout records (all committed) — for available balance calculation
            // Must match the withdrawal endpoint: Completed + Processing + Pending
            prisma.creatorPayout.findMany({
                where: { creatorId: userId, status: { in: ['Completed', 'Processing', 'Pending'] } },
                select: { amount: true, initiatedAt: true, status: true },
            }),
            // Approved collaborations not yet paid — for pending balance
            prisma.campaignCollaboration.findMany({
                where: {
                    creatorId: userId,
                    status: { in: ['Approved', 'In_Progress'] },
                    payoutReleased: false,
                    agreedPrice: { not: null },
                },
                select: { agreedPrice: true },
            }),
        ]);

        // 3. Compute balances
        const paidTransactions   = transactions.filter(t => t.status === 'Completed');
        const pendingTransactions = transactions.filter(t => t.status === 'Pending');

        const txEarnings      = paidTransactions.reduce((s, t) => s + parseFloat(t.amount ?? 0), 0);
        const totalPaidOut    = completedPayouts.reduce((s, p) => s + parseFloat(p.amount ?? 0), 0);

        // Available = earned minus ALL committed payouts (completed + pending + processing)
        const availableBalance = Math.max(0, Math.round((txEarnings - totalPaidOut) * 100) / 100);

        // Pending = approved collabs not yet released + pending transactions
        const pendingCollabValue = pendingCollabs.reduce((s, c) => s + parseFloat(c.agreedPrice ?? 0), 0);
        const pendingTxValue     = pendingTransactions.reduce((s, t) => s + parseFloat(t.amount ?? 0), 0);
        const pendingBalance     = Math.round((pendingCollabValue + pendingTxValue) * 100) / 100;

        // Lifetime = all completed payouts + current available (guard against double-counting)
        const lifetimeEarnings = Math.round((txEarnings) * 100) / 100;

        // 4. Timeseries — for earnings graph (from paid transactions over last 12 months)
        const recentPaid = paidTransactions.filter(t => new Date(t.transactionDate) >= twelveMonthsAgo);
        const earningsTimeseries = buildTimeseries(recentPaid);

        // 5. Recent transactions — last 10, mapped to the Transaction type the FE expects
        const recentTransactions = transactions.slice(0, 10).map(t => ({
            id: `TX-${t.id}`,
            type: t.type === 'Payment' ? 'CAMPAIGN_EARNING' : t.type.toUpperCase(),
            status: t.status === 'Completed' ? 'PAID' : t.status === 'Pending' ? 'PENDING' : t.status.toUpperCase(),
            amount: parseFloat(t.amount ?? 0),
            campaign_name: t.campaign?.title ?? null,
            campaign_id: t.campaign?.id ?? null,
            created_at: t.transactionDate,
        }));

        return res.json({
            status: 'success',
            data: {
                availableBalance,
                pendingBalance,
                lifetimeEarnings,
                nextPayoutDate: null,           // Future: derive from payout schedule
                bankConnected,
                bankName:     creatorProfile.bankName,
                bankLastFour: creatorProfile.bankLastFour,
                bankCountry:  creatorProfile.bankCountry,
                bankCurrency: creatorProfile.bankCurrency,
                payoutSchedule: 'on_request',   // Future: store this in creatorProfile
                earningsTimeseries,
                recentTransactions,
            },
        });
    } catch (error) {
        console.error('[EarningsController] getEarningsSummary error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to load earnings summary' });
    }
};

// ─── GET /api/creators/transactions ──────────────────────────────────────────

/**
 * Paginated + filtered transaction ledger.
 * Query params: page, limit, status, type, campaignId, from, to
 */
export const getCreatorTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page   = Math.max(1, parseInt(req.query.page)  || 1);
        const limit  = Math.min(100, parseInt(req.query.limit) || 20);
        const skip   = (page - 1) * limit;

        const { status, type, campaignId, from, to } = req.query;

        // Build Prisma where clause
        const where = { userId };

        // Status filter — map FE status strings to DB values
        if (status) {
            const statusMap = {
                PENDING:    'Pending',
                PROCESSING: 'Processing',
                APPROVED:   'Completed',
                PAID:       'Completed',
                FAILED:     'Failed',
            };
            where.status = statusMap[status] ?? status;
        }

        // Type filter
        if (type) {
            const typeMap = {
                CAMPAIGN_EARNING: 'Payment',
                PAYOUT:           'Withdrawal',
                REFUND:           'Refund',
                BONUS:            'Bonus',
                ADJUSTMENT:       'Adjustment',
            };
            where.type = typeMap[type] ?? type;
        }

        // Campaign filter
        if (campaignId) {
            where.campaign = { id: parseInt(campaignId) };
        }

        // Date range filter
        if (from || to) {
            where.transactionDate = {};
            if (from) where.transactionDate.gte = new Date(from);
            if (to)   where.transactionDate.lte = new Date(to + 'T23:59:59.999Z'); // Inclusive end of day
        }

        const [rawTransactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    campaign: { select: { id: true, title: true } },
                },
                orderBy: { transactionDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        // Also pull in CreatorPayout records as PAYOUT type transactions when no type filter (or PAYOUT filter)
        let payoutRows = [];
        if (!type || type === 'PAYOUT') {
            const payoutWhere = { creatorId: userId };
            if (from) payoutWhere.initiatedAt = { ...(payoutWhere.initiatedAt ?? {}), gte: new Date(from) };
            if (to)   payoutWhere.initiatedAt = { ...(payoutWhere.initiatedAt ?? {}), lte: new Date(to + 'T23:59:59.999Z') };

            payoutRows = await prisma.creatorPayout.findMany({
                where: payoutWhere,
                orderBy: { initiatedAt: 'desc' },
                take: limit,
            });
        }

        // Normalize transactions to a unified FE type
        const normalizeStatus = (s) => {
            const m = { Completed: 'PAID', Pending: 'PENDING', Failed: 'FAILED', Processing: 'PROCESSING' };
            return m[s] ?? s.toUpperCase();
        };

        const txNormalized = rawTransactions.map(t => ({
            id:            `TX-${t.id}`,
            type:          t.type === 'Payment' ? 'CAMPAIGN_EARNING' : t.type.toUpperCase(),
            status:        normalizeStatus(t.status),
            amount:        parseFloat(t.amount ?? 0),
            campaign_name: t.campaign?.title ?? null,
            campaign_id:   t.campaign?.id ?? null,
            created_at:    t.transactionDate,
        }));

        const payoutNormalized = payoutRows.map(p => ({
            id:            `PO-${p.id}`,
            type:          'PAYOUT',
            status:        normalizeStatus(p.status),
            amount:        parseFloat(p.amount ?? 0),
            campaign_name: null,
            campaign_id:   null,
            created_at:    p.initiatedAt,
        }));

        // Merge + sort by date desc (only if both present)
        const allTxns = [...txNormalized, ...payoutNormalized]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);

        const combinedTotal = total + (payoutRows.length > 0 ? await prisma.creatorPayout.count({ where: { creatorId: userId } }) : 0);

        return res.json({
            status: 'success',
            data: {
                transactions: allTxns,
                total:        combinedTotal,
                page,
                totalPages:   Math.ceil(combinedTotal / limit),
            },
        });
    } catch (error) {
        console.error('[EarningsController] getCreatorTransactions error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to load transactions' });
    }
};

// ─── POST /api/creators/withdrawals ──────────────────────────────────────────

/**
 * Request manual withdrawal — creates a CreatorPayout record AND initiates the
 * actual Tazapay bank transfer so the creator receives real funds.
 *
 * Security:
 * - Duplicate-withdrawal guard (rejects if a Pending/Processing payout exists)
 * - Server-side balance recomputation (never trusts frontend values)
 * - Idempotency key used as Tazapay reference_id to prevent double-charges
 */
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ status: 'error', message: 'A valid positive amount is required' });
        }

        const parsedAmount = parseFloat(amount);

        // Minimum withdrawal threshold
        const MIN_WITHDRAWAL = 25;
        if (parsedAmount < MIN_WITHDRAWAL) {
            return res.status(400).json({ status: 'error', message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}.` });
        }

        // Verify bank is connected
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                tazapayBeneficiaryId: true,
                payoutStatus: true,
                fullName: true,
                bankCurrency: true,
            },
        });

        if (!creatorProfile?.tazapayBeneficiaryId) {
            return res.status(400).json({ status: 'error', message: 'No bank account connected. Please connect a bank account first.' });
        }

        if (creatorProfile.payoutStatus !== 'Active') {
            return res.status(400).json({ status: 'error', message: 'Payout account is not active.' });
        }

        // ── Duplicate-withdrawal guard ──────────────────────────────────────
        const inFlightPayout = await prisma.creatorPayout.findFirst({
            where: {
                creatorId: userId,
                status: { in: ['Pending', 'Processing'] },
            },
            select: { id: true, amount: true, status: true },
        });

        if (inFlightPayout) {
            return res.status(409).json({
                status: 'error',
                message: `You already have a withdrawal of $${parseFloat(inFlightPayout.amount).toFixed(2)} being processed. Please wait for it to complete before requesting another.`,
            });
        }

        // ── Balance validation — compute available balance ──────────────────
        const [paidTransactions, completedPayouts] = await Promise.all([
            prisma.transaction.aggregate({
                where: { userId, type: 'Payment', status: 'Completed' },
                _sum: { amount: true },
            }),
            prisma.creatorPayout.aggregate({
                where: { creatorId: userId, status: { in: ['Completed', 'Processing', 'Pending'] } },
                _sum: { amount: true },
            }),
        ]);

        const totalEarned = parseFloat(paidTransactions._sum?.amount || 0);
        const totalPayoutsCommitted = parseFloat(completedPayouts._sum?.amount || 0);
        const availableBalance = Math.max(0, Math.round((totalEarned - totalPayoutsCommitted) * 100) / 100);

        if (parsedAmount > availableBalance) {
            return res.status(400).json({
                status: 'error',
                message: `Insufficient balance. Available: $${availableBalance.toFixed(2)}.`,
            });
        }

        // ── Create CreatorPayout record ─────────────────────────────────────
        const idempotencyKey = `wd_${userId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        const payout = await prisma.creatorPayout.create({
            data: {
                creatorId: userId,
                amount: parsedAmount,
                currency: 'USD',
                status: 'Pending',
                payoutType: 'manual_request',
                idempotencyKey,
            },
        });

        // Audit
        await logPayoutAudit({
            userId,
            action: AuditActions.WITHDRAWAL_REQUESTED,
            payoutId: payout.id,
            amount: parsedAmount,
            currency: 'USD',
            req,
        });

        // ── Trigger actual Tazapay payout ───────────────────────────────────
        try {
            const tazapayResult = await tazapayService.createPayout({
                beneficiaryId: creatorProfile.tazapayBeneficiaryId,
                amount: parsedAmount,
                currency: 'USD',
                holdingCurrency: 'USD',
                payoutType: 'local',
                reason: `Withdrawal for ${creatorProfile.fullName || 'Creator'}`,
                referenceId: idempotencyKey,
            });

            // Update payout record with Tazapay payout ID
            await prisma.creatorPayout.update({
                where: { id: payout.id },
                data: {
                    tazapayPayoutId: tazapayResult.data?.id || null,
                    status: 'Processing',
                },
            });

            await logPayoutAudit({
                userId,
                action: AuditActions.PAYOUT_INITIATED,
                payoutId: payout.id,
                amount: parsedAmount,
                currency: 'USD',
                req,
            });

            safeLog(`[Withdrawal] Tazapay payout initiated for user ${userId}:`, {
                payoutId: payout.id,
                tazapayId: tazapayResult.data?.id,
                amount: parsedAmount,
            });

            return res.status(201).json({
                status: 'success',
                message: 'Withdrawal submitted and processing. Funds will arrive in 1-3 business days.',
                data: {
                    payoutId: payout.id,
                    amount: parsedAmount,
                    status: 'Processing',
                    tazapayPayoutId: tazapayResult.data?.id || null,
                },
            });
        } catch (tazapayError) {
            // Tazapay call failed — mark payout as Failed so creator can retry
            const failureReason = tazapayError.message?.substring(0, 200) || 'Tazapay payout initiation failed';

            await prisma.creatorPayout.update({
                where: { id: payout.id },
                data: {
                    status: 'Failed',
                    failureReason,
                    retryCount: 1,
                },
            });

            await logPayoutAudit({
                userId,
                action: AuditActions.PAYOUT_FAILED,
                payoutId: payout.id,
                amount: parsedAmount,
                currency: 'USD',
                req,
            });

            console.error(`[Withdrawal] Tazapay payout failed for user ${userId}:`, tazapayError.message);

            return res.status(502).json({
                status: 'error',
                message: 'Withdrawal request created but payment processing failed. Please try again shortly.',
                data: { payoutId: payout.id },
            });
        }
    } catch (error) {
        console.error('[EarningsController] requestWithdrawal error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to submit withdrawal request' });
    }
};
