import { prisma } from "../config/db.js";
import { fetchVideoStats } from "../utils/videoStats.js"; // Reuse for fetching account stats if applicable, or need new utils

/**
 * Media Kit Controllers
 * Public-facing data for brands to view creator stats
 */

// GET /api/media-kit/:handle
// Public endpoint
export const getMediaKit = async (req, res) => {
    try {
        const { handle } = req.params;

        // Find creator by handle (either mediaKitCustomSlug or handle)
        // We prioritize custom slug, then fallback to handle
        // Logic: 
        // 1. Try finding by mediaKitCustomSlug
        // 2. Try finding by handle

        let creator = await prisma.creatorProfile.findUnique({
            where: { mediaKitCustomSlug: handle },
            include: {
                user: {
                    include: {
                        socialAccounts: true
                    }
                },
                demographics: true,
                services: true
            }
        });

        if (!creator) {
            creator = await prisma.creatorProfile.findFirst({
                where: { handle: handle },
                include: {
                    user: {
                        include: {
                            socialAccounts: true
                        }
                    },
                    demographics: true,
                    services: true
                }
            });
        }

        if (!creator) {
            return res.status(404).json({ status: "error", message: "Creator not found" });
        }

        if (!creator.mediaKitEnabled) {
            return res.status(404).json({ status: "error", message: "Media Kit not enabled" });
        }

        // Aggregate Data
        const socialStats = creator.user.socialAccounts.map(acc => ({
            platform: acc.platform,
            username: acc.username,
            handle: acc.handle,
            profileUrl: acc.profileUrl
            // In a real app, we would store follower counts in SocialAccount or update them periodically
            // For now, we return what we have.
        }));

        const responseData = {
            profile: {
                name: creator.fullName,
                handle: creator.handle,
                avatar: creator.avatarUrl,
                bio: creator.about,
                location: creator.location,
                tags: creator.nicheTags,
                verificationTier: creator.verificationTier
            },
            stats: {
                followersTotal: creator.followersCount, // Aggregate?
                engagementRate: creator.engagementRate,
                lastUpdated: creator.statsLastUpdated
            },
            socials: socialStats,
            demographics: creator.demographics,
            services: creator.services.filter(s => s.isEnabled),
            brandAffiliations: creator.brandAffiliations
        };

        res.json({
            status: "success",
            data: responseData
        });

    } catch (error) {
        console.error("[Media Kit] Error fetching:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch media kit" });
    }
};

// GET /api/media-kit/refresh (Protected)
export const refreshMediaKitStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const creator = await prisma.creatorProfile.findUnique({
            where: { userId: userId },
            include: { user: { include: { socialAccounts: true } } }
        });

        if (!creator) {
            return res.status(404).json({ status: "error", message: "Creator profile not found" });
        }

        // Mock Logic for Refreshing Stats
        // In reality, this would call Social APIs for each connected account
        // and update `followersCount`, `engagementRate`, etc.

        // Simulating update
        const updatedStats = {
            statsLastUpdated: new Date()
            // followersCount: ...
        };

        await prisma.creatorProfile.update({
            where: { userId: userId },
            data: updatedStats
        });

        res.json({
            status: "success",
            message: "Stats refreshed successfully",
            timestamp: updatedStats.statsLastUpdated
        });

    } catch (error) {
        console.error("[Media Kit] Error refreshing stats:", error);
        res.status(500).json({ status: "error", message: "Failed to refresh stats" });
    }
};
