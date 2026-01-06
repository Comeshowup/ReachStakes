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
            include: { campaign: true }
        });

        if (!collab) throw new Error("Collaboration not found");
        if (collab.payoutReleased) throw new Error("Payout already released for this collaboration");
        if (collab.status !== 'Approved') throw new Error("Collaboration must be Approved before payout");

        const payoutAmount = collab.agreedPrice;

        // B. Check Vault Balance
        if (collab.campaign.escrowBalance && collab.campaign.escrowBalance < payoutAmount) {
            throw new Error("Insufficient funds in Campaign Escrow Vault");
        }

        // C. Execute Financial Logic

        // 1. Debit Campaign Escrow
        await tx.campaign.update({
            where: { id: collab.campaignId },
            data: {
                escrowBalance: { decrement: payoutAmount }
            }
        });

        // 2. Credit Creator (Create Transaction Record)
        const transaction = await tx.transaction.create({
            data: {
                userId: collab.creatorId,
                campaignId: collab.campaignId,
                amount: payoutAmount,
                type: 'Payment', // Enum: Payment
                status: 'Completed',
                description: `Escrow Release for ${collab.submissionTitle || 'Collaboration'}`
            }
        });

        // 3. Mark Collaboration as Paid
        await tx.campaignCollaboration.update({
            where: { id: collab.id },
            data: {
                payoutReleased: true,
                payoutDate: new Date(),
                status: 'Paid',
                escrowStatus: 'Released'
            }
        });

        // 4. Trigger Stats Recalculation (Off-transaction)
        // We don't await this to keep the payout fast, but we fire-and-forget
        recalculateCreatorStats(collab.creatorId).catch(err =>
            console.error(`[Verification] Recalculate failed for ${collab.creatorId}:`, err)
        );

        return {
            status: 'success',
            message: 'Funds released successfully',
            transactionId: transaction.id,
            amountReleased: payoutAmount,
            newEscrowBalance: Number(collab.campaign.escrowBalance) - Number(payoutAmount)
        };
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
