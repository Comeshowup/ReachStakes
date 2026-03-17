import { prisma } from '../config/db.js';

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
            // Completed CreatorPayout records — for lifetime + available balance
            prisma.creatorPayout.findMany({
                where: { creatorId: userId, status: 'Completed' },
                select: { amount: true, initiatedAt: true },
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

        // Available = earned from transactions minus what's already been paid out  
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
 * Request manual withdrawal (creates a pending CreatorPayout record).
 * The actual Tazapay trigger is handled by the admin/cron flow.
 */
export const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            return res.status(400).json({ status: 'error', message: 'A valid positive amount is required' });
        }

        // Verify bank is connected
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { tazapayBeneficiaryId: true, payoutStatus: true },
        });

        if (!creatorProfile?.tazapayBeneficiaryId) {
            return res.status(400).json({ status: 'error', message: 'No bank account connected. Please connect a bank account first.' });
        }

        if (creatorProfile.payoutStatus !== 'Active') {
            return res.status(400).json({ status: 'error', message: 'Payout account is not active.' });
        }

        const payout = await prisma.creatorPayout.create({
            data: {
                creatorId: userId,
                amount: parseFloat(amount),
                currency: 'USD',
                status: 'Pending',
                payoutType: 'manual_request',
            },
        });

        return res.status(201).json({
            status: 'success',
            message: 'Withdrawal request submitted. It will be processed within 1-3 business days.',
            data: { payoutId: payout.id, amount: payout.amount, status: payout.status },
        });
    } catch (error) {
        console.error('[EarningsController] requestWithdrawal error:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to submit withdrawal request' });
    }
};
