import { prisma } from "../config/db.js";

/**
 * Verification Service
 * Calculates and updates the Verification Tier for a creator based on performance.
 */

// Thresholds
const TIERS = {
    BLACK: { campaigns: 25, onTime: 95 },
    GOLD: { campaigns: 10, onTime: 90 },
    SILVER: { campaigns: 3, onTime: 80 }
};

export const updateVerificationTier = async (creatorId) => {
    try {
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId: creatorId }
        });

        if (!profile) return;

        const completed = profile.completedCampaigns || 0;
        const onTime = parseFloat(profile.onTimeDeliveryRate || 0);

        let newTier = "None"; // Default

        if (completed >= TIERS.BLACK.campaigns && onTime >= TIERS.BLACK.onTime) {
            newTier = "Black";
        } else if (completed >= TIERS.GOLD.campaigns && onTime >= TIERS.GOLD.onTime) {
            newTier = "Gold";
        } else if (completed >= TIERS.SILVER.campaigns && onTime >= TIERS.SILVER.onTime) {
            newTier = "Silver";
        }

        // Only update if changed
        if (newTier !== profile.verificationTier) {
            await prisma.creatorProfile.update({
                where: { userId: creatorId },
                data: { verificationTier: newTier }
            });
            console.log(`[Verification] Updated creator ${creatorId} to ${newTier} tier.`);
        }

    } catch (error) {
        console.error("[Verification] Error updating tier:", error);
    }
};

/**
 * Call this function after a campaign is completed/paid to recalculate stats.
 */
export const recalculateCreatorStats = async (creatorId) => {
    // 1. Count completed campaigns
    const completedCount = await prisma.campaignCollaboration.count({
        where: {
            creatorId: creatorId,
            status: "Paid"
        }
    });

    // 2. Calculate On-Time Delivery Rate
    // Logic: Look at past milestones or deadline vs submission time.
    // For MVP, we'll assume current data is the source of truth or mock it.
    // Let's iterate all completed collabs
    const completedCollabs = await prisma.campaignCollaboration.findMany({
        where: {
            creatorId: creatorId,
            status: "Paid"
        },
        include: { campaign: true }
    });

    let onTimeCount = 0;
    completedCollabs.forEach(c => {
        // Compare c.updatedAt (or submission date) with c.campaign.deadline
        // This is rough approximation
        if (!c.campaign.deadline || c.updatedAt <= c.campaign.deadline) {
            onTimeCount++;
        }
    });

    const onTimeRate = completedCollabs.length > 0
        ? (onTimeCount / completedCollabs.length) * 100
        : 100;

    await prisma.creatorProfile.update({
        where: { userId: creatorId },
        data: {
            completedCampaigns: completedCount,
            onTimeDeliveryRate: onTimeRate
        }
    });

    // 3. Trigger Tier Update
    await updateVerificationTier(creatorId);
};
