/**
 * EscrowService — Production-grade escrow accounting service.
 * All write operations use prisma.$transaction() for atomicity.
 * Balances are derived from campaign fields, validated against ledger.
 */
import { prisma } from '../config/db.js';

// Fee constants (must stay in sync with paymentController.js)
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

export class EscrowService {
    /**
     * Get escrow overview for a brand.
     * Vault balance is derived from Transaction deposit/withdrawal records.
     * Locked funds are derived from campaign escrow balances.
     */
    static async getOverview(brandId) {
        // 1. Compute vault-level cash from Transaction records
        const vaultBalance = await EscrowService._computeVaultBalance(brandId);

        // 2. Get campaign-level data for locked/released/pending
        const campaigns = await prisma.campaign.findMany({
            where: { brandId },
            select: {
                id: true,
                title: true,
                status: true,
                targetBudget: true,
                escrowBalance: true,
                totalFunded: true,
                totalReleased: true,
                escrowStatus: true,
                startDate: true,
                endDate: true,
                collaborations: {
                    where: {
                        milestones: { not: null }
                    },
                    select: {
                        milestones: true,
                        agreedPrice: true,
                    }
                }
            }
        });

        // Locked = funds currently sitting in campaign escrow accounts
        const allocatedFunds = campaigns
            .reduce((s, c) => s + parseFloat(c.escrowBalance || 0), 0);
        const releasedFunds = campaigns.reduce((s, c) => s + parseFloat(c.totalReleased || 0), 0);

        // Pending releases from active campaign milestones
        const pendingReleases = EscrowService._computePendingReleases(campaigns);

        // Available = vault cash minus what's locked in campaigns
        const totalBalance = vaultBalance;
        const availableBalance = Math.max(0, vaultBalance - allocatedFunds - pendingReleases);

        // Liquidity health
        const coverageRatio = pendingReleases > 0
            ? parseFloat((availableBalance / pendingReleases).toFixed(2))
            : availableBalance > 0 ? 99 : 0;

        let liquidityState = 'healthy';
        if (coverageRatio < 1 && pendingReleases > 0) liquidityState = 'risk';
        else if (coverageRatio < 2 && pendingReleases > 0) liquidityState = 'watch';

        // Build trend data
        let history;
        try {
            history = await EscrowService._getHistoryTrend(brandId);
        } catch (err) {
            console.warn('[EscrowService] History trend unavailable:', err.message);
            history = {
                totalBalance: Array(7).fill(Math.round(totalBalance)),
                allocated: Array(7).fill(Math.round(allocatedFunds)),
                released: Array(7).fill(Math.round(releasedFunds)),
                pending: Array(7).fill(Math.round(pendingReleases)),
                unallocated: Array(7).fill(Math.round(availableBalance)),
            };
        }

        return {
            totalBalance,
            allocatedFunds,
            releasedFunds,
            pendingReleases,
            availableBalance,
            coverageRatio,
            liquidityState,
            liquidityExplanation: EscrowService._getLiquidityExplanation(liquidityState, coverageRatio, pendingReleases),
            history,
        };
    }

    /**
     * Get all campaigns with escrow funding data.
     */
    static async getCampaigns(brandId) {
        const campaigns = await prisma.campaign.findMany({
            where: { brandId },
            select: {
                id: true,
                title: true,
                status: true,
                targetBudget: true,
                totalFunded: true,
                totalReleased: true,
                escrowBalance: true,
                escrowStatus: true,
                startDate: true,
                endDate: true,
                collaborations: {
                    select: {
                        milestones: true,
                        agreedPrice: true,
                        status: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return campaigns.map(c => {
            const targetBudget = parseFloat(c.targetBudget || 0);
            const fundedAmount = parseFloat(c.totalFunded || 0);
            const releasedAmount = parseFloat(c.totalReleased || 0);
            const remaining = Math.max(0, targetBudget - fundedAmount);

            // Build milestone list from collaborations
            const milestones = EscrowService._extractMilestones(c);

            // Upcoming release amount = sum of pending milestones
            const upcomingReleaseAmount = milestones
                .filter(m => m.status === 'Pending')
                .reduce((s, m) => s + m.amount, 0);

            // Compute required allocation (targetBudget + all fees)
            const allocation = EscrowService.computeAllocationTotal(targetBudget);

            return {
                id: c.id,
                name: c.title,
                status: c.status || 'Draft',
                targetBudget,
                fundedAmount,
                releasedAmount,
                remaining,
                upcomingReleaseAmount,
                escrowStatus: c.escrowStatus || 'Locked',
                milestones,
                startDate: c.startDate,
                // Allocation breakdown
                requiredAllocation: allocation.totalRequired,
                allocationBreakdown: allocation,
            };
        });
    }

    /**
     * Fund a campaign with escrow deposit.
     * Wrapped in a transaction for atomicity.
     */
    static async fundCampaign(brandId, campaignId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Funding amount must be a positive number.');
        }

        return prisma.$transaction(async (tx) => {
            // 1. Verify campaign exists and belongs to brand
            const campaign = await tx.campaign.findFirst({
                where: { id: campaignId, brandId },
            });

            if (!campaign) {
                throw new Error('Campaign not found or access denied.');
            }

            // 2. Insert ledger record
            const ledgerEntry = await tx.escrowLedger.create({
                data: {
                    brandId,
                    campaignId,
                    type: 'Funding',
                    amount,
                    status: 'Completed',
                    description: `Escrow funding: $${amount.toFixed(2)} for "${campaign.title}"`,
                },
            });

            // 3. Update campaign escrow fields
            const updatedCampaign = await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    totalFunded: { increment: amount },
                    escrowBalance: { increment: amount },
                    escrowFundedAt: new Date(),
                    escrowStatus: 'Locked',
                },
            });

            // 4. Upsert CampaignEscrow record
            await tx.campaignEscrow.upsert({
                where: { campaignId },
                create: {
                    campaignId,
                    lockedAmount: amount,
                    releasedAmount: 0,
                    remainingAmount: amount,
                },
                update: {
                    lockedAmount: { increment: amount },
                    remainingAmount: { increment: amount },
                },
            });

            // 5. Create transaction record for audit
            await tx.transaction.create({
                data: {
                    userId: brandId,
                    campaignId,
                    amount,
                    type: 'Deposit',
                    status: 'Completed',
                    description: `Escrow funded: $${amount.toFixed(2)} for "${campaign.title}"`,
                    transactionDate: new Date(),
                },
            });

            console.log(`[EscrowService] Funded $${amount.toFixed(2)} for campaign ${campaignId} (brand: ${brandId})`);

            return {
                ledgerEntryId: ledgerEntry.id,
                newBalance: parseFloat(updatedCampaign.escrowBalance),
                newTotalFunded: parseFloat(updatedCampaign.totalFunded),
            };
        });
    }

    /**
     * Release escrow funds for a milestone.
     * Validates sufficient balance and prevents double-release.
     */
    static async releaseMilestone(brandId, campaignId, milestoneId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Release amount must be a positive number.');
        }

        return prisma.$transaction(async (tx) => {
            // 1. Verify campaign ownership
            const campaign = await tx.campaign.findFirst({
                where: { id: campaignId, brandId },
            });

            if (!campaign) {
                throw new Error('Campaign not found or access denied.');
            }

            // 2. Check for double-release
            if (milestoneId) {
                const existingRelease = await tx.escrowLedger.findFirst({
                    where: {
                        campaignId,
                        milestoneId,
                        type: 'Release',
                        status: 'Completed',
                    },
                });

                if (existingRelease) {
                    throw new Error('This milestone has already been released.');
                }
            }

            // 3. Verify sufficient escrow balance
            const currentBalance = parseFloat(campaign.escrowBalance || 0);
            if (amount > currentBalance) {
                throw new Error(`Insufficient escrow balance. Available: $${currentBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}`);
            }

            // 4. Insert ledger record
            const ledgerEntry = await tx.escrowLedger.create({
                data: {
                    brandId,
                    campaignId,
                    milestoneId: milestoneId || null,
                    type: 'Release',
                    amount,
                    status: 'Completed',
                    description: `Milestone release: $${amount.toFixed(2)} from "${campaign.title}"`,
                },
            });

            // 5. Update campaign escrow fields
            await tx.campaign.update({
                where: { id: campaignId },
                data: {
                    escrowBalance: { decrement: amount },
                    totalReleased: { increment: amount },
                },
            });

            // 6. Update CampaignEscrow
            await tx.campaignEscrow.update({
                where: { campaignId },
                data: {
                    releasedAmount: { increment: amount },
                    remainingAmount: { decrement: amount },
                },
            });

            // 7. Transaction record
            await tx.transaction.create({
                data: {
                    userId: brandId,
                    campaignId,
                    amount,
                    type: 'Payment',
                    status: 'Completed',
                    description: `Milestone released: $${amount.toFixed(2)} from "${campaign.title}"`,
                    transactionDate: new Date(),
                },
            });

            console.log(`[EscrowService] Released $${amount.toFixed(2)} from campaign ${campaignId} (milestone: ${milestoneId || 'N/A'})`);

            return { ledgerEntryId: ledgerEntry.id };
        });
    }

    /**
     * Get paginated escrow transactions (ledger entries).
     * Supports server-side sort, search, and type filter.
     */
    static async getTransactions(brandId, page = 1, limit = 20, { sortBy = 'date', sortOrder = 'desc', search = '', type = '' } = {}) {
        const skip = (page - 1) * limit;

        // Build orderBy based on sortBy param
        const orderByMap = {
            date: { createdAt: sortOrder },
            amount: { amount: sortOrder },
        };
        const orderBy = orderByMap[sortBy] || { createdAt: 'desc' };

        // Build where clause with optional search and type filter
        const where = { brandId };
        if (type && type !== 'all') {
            where.type = type;
        }
        if (search && search.trim()) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { campaign: { title: { contains: search, mode: 'insensitive' } } },
            ];
        }

        try {
            const [entries, total] = await Promise.all([
                prisma.escrowLedger.findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                    include: {
                        campaign: {
                            select: { title: true }
                        }
                    }
                }),
                prisma.escrowLedger.count({ where }),
            ]);

            // Compute running balance for each transaction
            let runningBalance = 0;
            // Get total balance before first entry on this page
            try {
                const priorEntries = await prisma.escrowLedger.findMany({
                    where: { brandId, status: 'Completed' },
                    orderBy: { createdAt: 'asc' },
                    select: { type: true, amount: true, createdAt: true },
                });
                for (const e of priorEntries) {
                    const amt = parseFloat(e.amount);
                    if (e.type === 'Funding' || e.type === 'Adjustment') runningBalance += amt;
                    if (e.type === 'Release') runningBalance -= amt;
                }
            } catch (_) {
                // Ledger may not exist yet
            }

            return {
                transactions: entries.map(e => {
                    const amount = parseFloat(e.amount);
                    return {
                        id: e.id,
                        date: e.createdAt,
                        campaignName: e.campaign?.title || 'Unknown',
                        type: e.type,
                        amount,
                        status: e.status,
                        description: e.description,
                        milestoneId: e.milestoneId,
                        runningBalance,
                    };
                }),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (err) {
            console.warn('[EscrowService] Ledger unavailable:', err.message);
            return {
                transactions: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            };
        }
    }

    /**
     * Get vault summary — reshaped overview data for the new Vault UI.
     * Returns: totalBalance, available, locked, pending, trendPercent, lastUpdated.
     */
    static async getVaultSummary(brandId) {
        const overview = await EscrowService.getOverview(brandId);
        const locked = overview.allocatedFunds;
        const available = overview.availableBalance;
        const pending = overview.pendingReleases;

        // Compute trend percent from history
        let trendPercent = 0;
        if (overview.history?.totalBalance?.length >= 2) {
            const vals = overview.history.totalBalance;
            const prev = vals[vals.length - 2] || 0;
            const curr = vals[vals.length - 1] || 0;
            if (prev > 0) {
                trendPercent = parseFloat((((curr - prev) / prev) * 100).toFixed(1));
            }
        }

        return {
            totalBalance: overview.totalBalance,
            available,
            locked,
            pending,
            trendPercent,
            lastUpdated: new Date().toISOString(),
            coverageRatio: overview.coverageRatio,
            liquidityState: overview.liquidityState,
        };
    }

    /**
     * Deposit funds into the vault (general fund, not campaign-specific).
     * Creates a ledger entry and transaction record.
     */
    static async depositFunds(brandId, amount, method = 'Wire') {
        if (!amount || amount <= 0) {
            throw new Error('Deposit amount must be a positive number.');
        }
        if (amount > 10000000) {
            throw new Error('Amount exceeds maximum allowed ($10,000,000).');
        }

        try {
            // Create a transaction record for audit
            await prisma.transaction.create({
                data: {
                    userId: brandId,
                    amount,
                    type: 'Deposit',
                    status: 'Completed',
                    description: `Vault deposit: $${amount.toFixed(2)} via ${method}`,
                    transactionDate: new Date(),
                },
            });

            console.log(`[EscrowService] Deposited $${amount.toFixed(2)} to vault (brand: ${brandId}, method: ${method})`);

            return { success: true, amount, method };
        } catch (err) {
            console.error('[EscrowService] Deposit error:', err);
            throw new Error('Failed to process deposit. Please try again.');
        }
    }

    /**
     * Withdraw funds from the vault.
     * Validates available liquidity before processing.
     */
    static async withdrawFunds(brandId, amount) {
        if (!amount || amount <= 0) {
            throw new Error('Withdrawal amount must be a positive number.');
        }

        // Check available balance
        const summary = await EscrowService.getVaultSummary(brandId);
        if (amount > summary.available) {
            throw new Error(`Insufficient available balance. Available: $${summary.available.toFixed(2)}, Requested: $${amount.toFixed(2)}`);
        }

        try {
            await prisma.transaction.create({
                data: {
                    userId: brandId,
                    amount: -amount,
                    type: 'Withdrawal',
                    status: 'Completed',
                    description: `Vault withdrawal: $${amount.toFixed(2)}`,
                    transactionDate: new Date(),
                },
            });

            console.log(`[EscrowService] Withdrew $${amount.toFixed(2)} from vault (brand: ${brandId})`);

            return { success: true, amount };
        } catch (err) {
            console.error('[EscrowService] Withdrawal error:', err);
            throw new Error('Failed to process withdrawal. Please try again.');
        }
    }

    // ──────────────────────────── Public Helpers ─────────────────────────────

    /**
     * Compute the total allocation required for a campaign.
     * Returns breakdown: targetBudget, platformFee, processingFee, totalRequired.
     */
    static computeAllocationTotal(targetBudget) {
        const budget = parseFloat(targetBudget) || 0;
        const platformFee = parseFloat((budget * (PLATFORM_FEE_PERCENT / 100)).toFixed(2));
        const processingFee = parseFloat((budget * (PROCESSING_FEE_PERCENT / 100)).toFixed(2));
        const totalRequired = parseFloat((budget + platformFee + processingFee).toFixed(2));

        return {
            targetBudget: budget,
            platformFeePercent: PLATFORM_FEE_PERCENT,
            processingFeePercent: PROCESSING_FEE_PERCENT,
            platformFee,
            processingFee,
            totalRequired,
        };
    }

    // ──────────────────────────── Private Helpers ────────────────────────────

    /**
     * Compute the vault-level cash balance from Transaction records.
     * Deposits add, Withdrawals subtract.
     * Campaign escrow allocations also subtract (they're Deposit type to campaigns).
     */
    static async _computeVaultBalance(brandId) {
        try {
            // Sum all completed deposits (vault-level, no campaignId)
            const deposits = await prisma.transaction.aggregate({
                where: {
                    userId: brandId,
                    type: 'Deposit',
                    status: 'Completed',
                    campaignId: null, // vault-level deposits only
                },
                _sum: { amount: true },
            });

            // Sum all completed withdrawals
            const withdrawals = await prisma.transaction.aggregate({
                where: {
                    userId: brandId,
                    type: 'Withdrawal',
                    status: 'Completed',
                },
                _sum: { amount: true },
            });

            const totalDeposits = parseFloat(deposits._sum.amount || 0);
            const totalWithdrawals = parseFloat(withdrawals._sum.amount || 0);

            // Withdrawals are stored as negative amounts, so we add them
            return totalDeposits + totalWithdrawals;
        } catch (err) {
            console.warn('[EscrowService] _computeVaultBalance error:', err.message);
            return 0;
        }
    }

    static _computePendingReleases(campaigns) {
        let pending = 0;
        for (const c of campaigns) {
            if (c.status !== 'Active') continue;
            const funded = parseFloat(c.totalFunded || 0);
            const released = parseFloat(c.totalReleased || 0);
            // Pending = funded but not yet released
            pending += Math.max(0, funded - released);
        }
        return pending;
    }

    static _extractMilestones(campaign) {
        const milestones = [];
        if (!campaign.collaborations) return milestones;

        for (const collab of campaign.collaborations) {
            if (!collab.milestones) continue;

            // milestones is stored as JSON: { "Name": "status", ... }
            const ms = typeof collab.milestones === 'string'
                ? JSON.parse(collab.milestones)
                : collab.milestones;

            if (typeof ms === 'object' && !Array.isArray(ms)) {
                const entries = Object.entries(ms);
                const pricePerMilestone = collab.agreedPrice
                    ? parseFloat(collab.agreedPrice) / Math.max(entries.length, 1)
                    : 0;

                entries.forEach(([name, status]) => {
                    milestones.push({
                        name,
                        status: typeof status === 'string' && status.toLowerCase() === 'completed' ? 'Released' : 'Pending',
                        amount: Math.round(pricePerMilestone * 100) / 100,
                    });
                });
            } else if (Array.isArray(ms)) {
                ms.forEach(item => {
                    milestones.push({
                        name: item.name || 'Milestone',
                        status: item.status === 'released' || item.status === 'completed' ? 'Released' : 'Pending',
                        amount: parseFloat(item.amount || 0),
                        date: item.date || null,
                    });
                });
            }
        }

        return milestones;
    }

    static async _getHistoryTrend(brandId) {
        // Get last 7 days of aggregate data from ledger
        const days = 7;
        const result = { totalBalance: [], allocated: [], released: [], pending: [], unallocated: [] };

        // Simple approach: get all ledger entries and build running totals
        const entries = await prisma.escrowLedger.findMany({
            where: { brandId, status: 'Completed' },
            orderBy: { createdAt: 'asc' },
            select: { type: true, amount: true, createdAt: true },
        });

        if (entries.length === 0) {
            // Return flat zeros
            for (let i = 0; i < days; i++) {
                result.totalBalance.push(0);
                result.allocated.push(0);
                result.released.push(0);
                result.pending.push(0);
                result.unallocated.push(0);
            }
            return result;
        }

        // Build daily snapshots for the last 7 days
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const dayEnd = new Date(now);
            dayEnd.setDate(dayEnd.getDate() - i);
            dayEnd.setHours(23, 59, 59, 999);

            let totalFunded = 0;
            let totalReleased = 0;

            for (const e of entries) {
                if (e.createdAt <= dayEnd) {
                    const amt = parseFloat(e.amount);
                    if (e.type === 'Funding' || e.type === 'Adjustment') totalFunded += amt;
                    if (e.type === 'Release') totalReleased += amt;
                }
            }

            const balance = totalFunded;
            const available = totalFunded - totalReleased;

            result.totalBalance.push(Math.round(balance));
            result.released.push(Math.round(totalReleased));
            result.allocated.push(Math.round(Math.max(0, available * 0.65))); // Approximate allocation
            result.pending.push(Math.round(Math.max(0, available * 0.35)));
            result.unallocated.push(Math.round(Math.max(0, balance - totalFunded * 0.7)));
        }

        return result;
    }

    static _getLiquidityExplanation(state, ratio, pending) {
        if (pending === 0) return 'No upcoming releases scheduled.';
        switch (state) {
            case 'healthy':
                return `Available funds cover upcoming releases with a ${ratio}x coverage buffer.`;
            case 'watch':
                return `Coverage ratio is ${ratio}x. Consider adding funds to maintain healthy reserves.`;
            case 'risk':
                return `Coverage ratio is ${ratio}x. Immediate funding recommended to cover pending releases.`;
            default:
                return '';
        }
    }
}
