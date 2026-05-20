import { prisma } from "../config/db.js";
import { fetchVideoStats } from "../utils/videoStats.js";
import { recalculateCreatorStats } from "../utils/verificationService.js";

// --- CONCIERGE SAAS CONTROLLERS (v1.1) ---

/**
 * 1. Verify Social Metrics (Read-only Social API logic)
 * Fetches real-time stats for a collaboration to verify performance before payout.
 * Route: GET /api/concierge/verify-metrics/:collaborationId
 */
export const verifyMetrics = async (req, res) => {
    try {
        const { collaborationId } = req.params;

        // 1. Fetch Collaboration
        const collaboration = await prisma.campaignCollaboration.findUnique({
            where: { id: parseInt(collaborationId) },
            include: { campaign: true, creator: true }
        });

        if (!collaboration) {
            return res.status(404).json({ status: 'error', message: 'Collaboration not found' });
        }

        if (!collaboration.submissionUrl) {
            return res.status(400).json({ status: 'error', message: 'No submission content to verify' });
        }

        // 2. Fetch Live Stats via Social APIs
        // Re-using our robust videoStats util which handles token refresh & platform logic
        let liveStats = { views: 0, likes: 0, comments: 0 };
        try {
            // For Instagram/TikTok, submissionUrl is key. For YouTube, videoId is key.
            const fetchId = collaboration.submissionPlatform === 'YouTube' ? collaboration.videoId : collaboration.submissionUrl;

            if (fetchId) {
                liveStats = await fetchVideoStats(
                    collaboration.submissionPlatform,
                    fetchId,
                    collaboration.creatorId
                );
            }
        } catch (apiError) {
            console.warn(`[Concierge] Social API Fetch Warning: ${apiError.message}`);
            // We return the error details but don't crash the endpoint, 
            // so Admin can see "Verification Failed" vs "Server Error"
            return res.status(400).json({
                status: 'verification_failed',
                message: `Could not verify social data: ${apiError.message}`,
                data: null
            });
        }

        // 3. Update Database with Verified Metrics
        const updatedCollab = await prisma.campaignCollaboration.update({
            where: { id: parseInt(collaborationId) },
            data: {
                videoStats: liveStats,
                // v1.1 Schema Fields
                viewsCount: BigInt(liveStats.views || 0),
                likesCount: liveStats.likes || 0,
                sharesCount: liveStats.shares || 0, // videoStats util needs to support shares to fully utilize this
                performanceMetrics: {
                    lastVerifiedAt: new Date().toISOString(),
                    engagementRate: calculateEngagement(liveStats)
                }
            }
        });

        // 4. Return Data to Admin Dashboard
        res.status(200).json({
            status: 'success',
            data: {
                verifiedAt: new Date(),
                platform: collaboration.submissionPlatform,
                stats: liveStats,
                metrics: updatedCollab.performanceMetrics,
                autoApprovalEligible: checkAutoApproval(liveStats, collaboration.campaign.budgetMin)
            }
        });

    } catch (error) {
        console.error("[Concierge] Verify Metrics Error:", error);
        res.status(500).json({ status: 'error', message: 'Internal Concierge Error' });
    }
};

// Reusable Payout Logic (Exported for Auto-Pay)
export const executePayout = async (collaborationId, userId) => {
    return await prisma.$transaction(async (tx) => {
        // A. Fetch Data
        const collab = await tx.campaignCollaboration.findUnique({
            where: { id: parseInt(collaborationId) },
            include: {
                campaign: {
                    select: { id: true, brandId: true, escrowBalance: true, targetBudget: true, title: true }
                }
            }
        });

        if (!collab) throw new Error("Collaboration not found");
        if (collab.payoutReleased) throw new Error("Payout already released for this collaboration");
        if (collab.status !== 'Approved') throw new Error("Collaboration must be Approved before payout");

        // Payouts must be based on an explicit negotiated deal, never the total campaign budget.
        const payoutAmount = Number(collab.agreedPrice || 0);

        if (!payoutAmount || payoutAmount <= 0) {
            throw new Error("No payout amount set for this collaboration. Please set an agreed price before releasing.");
        }

        // B. Check escrow balance — always enforce, use Number() to handle Prisma Decimal
        const escrowBalance = Number(collab.campaign.escrowBalance || 0);
        if (escrowBalance < payoutAmount) {
            throw new Error(
                `Insufficient funds in Campaign Escrow Vault. Available: $${escrowBalance.toFixed(2)}, Required: $${payoutAmount.toFixed(2)}`
            );
        }

        const campaignTitle = collab.campaign.title || 'Campaign';
        const brandId = collab.campaign.brandId;

        // C. Execute Financial Logic atomically

        // 1. Debit campaign escrowBalance and increment totalReleased
        await tx.campaign.update({
            where: { id: collab.campaignId },
            data: {
                escrowBalance: { decrement: payoutAmount },
                totalReleased: { increment: payoutAmount },
            },
        });

        // 2. Update CampaignEscrow ledger to keep vault dashboard in sync
        await tx.campaignEscrow.updateMany({
            where: { campaignId: collab.campaignId },
            data: {
                releasedAmount: { increment: payoutAmount },
                remainingAmount: { decrement: payoutAmount },
            },
        });

        // 3. Create a brand-side Payment debit so vault balance decreases
        //    _computeVaultBalance() sums Transactions for the brand — without this
        //    the vault shows no change after payout.
        await tx.transaction.create({
            data: {
                userId: brandId,
                campaignId: collab.campaignId,
                amount: payoutAmount,
                type: 'Payment',
                status: 'Completed',
                description: `Escrow release to creator for "${campaignTitle}"`,
                transactionDate: new Date(),
            },
        });

        // 4. Create an EscrowLedger Release record for audit trail
        await tx.escrowLedger.create({
            data: {
                brandId,
                campaignId: collab.campaignId,
                type: 'Release',
                amount: payoutAmount,
                status: 'Completed',
                description: `Creator payout: $${payoutAmount.toFixed(2)} for collab #${collab.id}`,
            },
        });

        // 5. Credit creator wallet (Transaction record for creator's earnings view)
        const creatorTx = await tx.transaction.create({
            data: {
                userId: collab.creatorId,
                campaignId: collab.campaignId,
                amount: payoutAmount,
                type: 'Payment',
                status: 'Completed',
                description: `Payment received for "${campaignTitle}"`,
                transactionDate: new Date(),
            },
        });

        // 6. Mark collaboration as Paid
        await tx.campaignCollaboration.update({
            where: { id: collab.id },
            data: {
                payoutReleased: true,
                payoutDate: new Date(),
                status: 'Paid',
            },
        });

        console.log(
            `[Concierge] Payout executed: $${payoutAmount.toFixed(2)} from campaign ${collab.campaignId} ` +
            `to creator ${collab.creatorId} (collab #${collab.id})`
        );

        // 7. Trigger stats recalculation off-transaction (fire-and-forget)
        recalculateCreatorStats(collab.creatorId).catch(err =>
            console.error(`[Verification] Recalculate failed for ${collab.creatorId}:`, err)
        );

        return {
            status: 'success',
            message: 'Funds released successfully',
            transactionId: creatorTx.id,
            amountReleased: payoutAmount,
            newEscrowBalance: escrowBalance - payoutAmount,
        };
    }, {
        maxWait: 5000,
        timeout: 15000, // Higher timeout for financial operations
    });
};

/**
 * 2. Escrow Release Trigger (Financial Logic)
 * Releases funds from Campaign Escrow -> Creator Wallet (Transaction)
 * Route: POST /api/concierge/release-payout/:collaborationId
 */
export const releasePayout = async (req, res) => {
    try {
        const { collaborationId } = req.params;
        const userId = req.user.id; // Admin or Brand invoking the release

        const result = await executePayout(collaborationId, userId);
        res.status(200).json(result);

    } catch (error) {
        console.error("[Concierge] Payout Error:", error);
        res.status(400).json({ status: 'error', message: error.message });
    }
};

// --- Helpers ---

const calculateEngagement = (stats) => {
    if (!stats || !stats.views || stats.views === 0) return 0;
    const interactions = (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0);
    return ((interactions / stats.views) * 100).toFixed(2);
};

const checkAutoApproval = (stats, budget) => {
    // Logic: If views > 1000 per $100 spent, eligible.
    // Mock logic
    return stats.views > 5000;
};
