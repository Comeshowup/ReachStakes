import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { fetchVideoStats, getSocialAccountForUser, fetchAudienceDemographics } from "../utils/videoStats.js";
import { executePayout } from "../controllers/conciergeControllers.js";

const router = express.Router();

// Get collaborations for the logged-in CREATOR (My Submissions)
// Route: GET /api/collaborations/my-submissions
router.get("/my-submissions", protect, async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware

        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                creatorId: userId
            },
            include: {
                campaign: {
                    include: {
                        brand: {
                            include: {
                                brandProfile: true // Get brand profile for company name
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc' // Sort by most recent activity
            }
        });

        // Map data to match Frontend "MySubmissions.jsx" expectations
        const mappedCollaborations = collaborations.map(collab => ({
            id: collab.id,
            campaignId: collab.campaignId,
            // Title: Use submission title if exists, otherwise Campaign Title (for 'Applied' status)
            title: collab.submissionTitle || collab.campaign.title,
            campaignTitle: collab.campaign.title,
            brandName: collab.campaign.brand.brandProfile?.companyName || collab.campaign.brand.name,
            brandLogo: collab.campaign.brand.brandProfile?.logoUrl, // Optional: if frontend uses it someday
            platform: collab.submissionPlatform || collab.campaign.platformRequired || "Other",
            status: collab.status,
            date: collab.updatedAt,
            link: collab.submissionUrl,
            stats: collab.videoStats,
            feedback: collab.feedbackNotes,
            // New Fields
            milestones: collab.milestones,
            usageAgreed: collab.usageAgreed,
            isWhitelisted: collab.isWhitelisted
        }));

        res.json(mappedCollaborations);

    } catch (error) {
        console.error("Error fetching my submissions:", error);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
});

// Get collaborations for a BRAND (Campaigns created by this brand)
// Route: GET /api/collaborations/brand/:brandId
router.get("/brand/:brandId", async (req, res) => {
    try {
        const brandId = parseInt(req.params.brandId);

        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: {
                    brandId: brandId
                }
            },
            include: {
                campaign: true,
                creator: {
                    include: {
                        creatorProfile: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        res.json(collaborations);
    } catch (error) {
        console.error("Error fetching brand collaborations:", error);
        res.status(500).json({ error: "Failed to fetch collaborations" });
    }
});

// Get collaborations for a CREATOR (Campaigns joined by this creator)
// Route: GET /api/collaborations/creator/:creatorId
router.get("/creator/:creatorId", async (req, res) => {
    try {
        const creatorId = parseInt(req.params.creatorId);

        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                creatorId: creatorId
            },
            include: {
                campaign: {
                    include: {
                        brand: true // Get brand details
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        });

        res.json(collaborations);

    } catch (error) {
        console.error("Error fetching creator collaborations:", error);
        res.status(500).json({ error: "Failed to fetch collaborations" });
    }
});

// Update Collaboration Milestones
router.patch("/:id/milestones", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { milestones } = req.body;

        const updated = await prisma.campaignCollaboration.update({
            where: { id: id },
            data: { milestones: milestones }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating milestones:", error);
        res.status(500).json({ error: "Failed to update milestones" });
    }
});

// Submit Content URL
// Update Collaboration Status (Brand Decision)
router.patch("/:id/decision", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, feedback } = req.body;

        // In a real app, verify req.user owns the campaign for this collaboration

        const updated = await prisma.campaignCollaboration.update({
            where: { id: id },
            data: {
                status: status, // e.g., 'Changes_Requested', 'Approved'
                feedbackNotes: feedback
            },
            include: { campaign: true } // Fetch campaign for payout check
        });

        // Fast Payouts Logic: If Approved and Instant, trigger payout
        if (status === 'Approved' && updated.campaign.payoutSpeed === 'Instant') {
            console.log(`[Fast Payout] Triggering instant payout for Collaboration ${id}`);
            try {
                // We don't await the result to block the response, or we do?
                // Better to await to catch errors, but if it fails, the approval is already done.
                // Let's await and append result or just log.
                await executePayout(id, req.user.id);
                console.log(`[Fast Payout] Payout executed successfully for ${id}`);
            } catch (payoutError) {
                console.error(`[Fast Payout] Payout failed for ${id}:`, payoutError.message);
                // Optionally notify admin/brand
            }
        }

        res.json(updated);
    } catch (error) {
        console.error("Error updating collaboration decision:", error);
        res.status(500).json({ error: "Failed to update decision" });
    }
});

router.post("/:id/submit", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { submissionUrl, platform, videoId, title, notes } = req.body;
        const userId = req.user.id;

        console.log("=== SUBMISSION REQUEST RECEIVED ===");
        console.log("Collaboration ID:", id, "Platform:", platform, "URL:", submissionUrl, "User:", userId);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid submission ID" });
        }

        if (!submissionUrl || !platform) {
            return res.status(400).json({ error: "Submission URL and platform are required." });
        }

        // ── STEP 1: Pre-check — verify the social account is connected ──────────
        const socialAccount = await getSocialAccountForUser(userId, platform);
        if (!socialAccount) {
            return res.status(400).json({
                error: `Your ${platform} account is not connected.`,
                details: `Please go to Settings > Social Accounts and connect your ${platform} account before submitting.`,
                code: 'SOCIAL_ACCOUNT_NOT_CONNECTED'
            });
        }

        console.log(`[Submit] Social account verified: ${platform} (${socialAccount.username})`);

        // ── STEP 2: Fetch initial stats (also verifies URL ownership) ─────────
        let initialStats = { views: 0, likes: 0, comments: 0, shares: 0 };

        const targetId = (platform === 'YouTube' && videoId) ? videoId : submissionUrl;

        if (targetId) {
            try {
                console.log(`[Submit] Fetching stats for ${platform}...`);
                const fetched = await fetchVideoStats(platform, targetId, userId);
                console.log(`[Submit] Fetched stats:`, fetched);
                initialStats = fetched;
            } catch (statsError) {
                // Ownership mismatch / not found → reject the submission
                console.error(`[Submit] Stats fetch failed:`, statsError.message);
                return res.status(400).json({
                    error: 'Content verification failed.',
                    details: statsError.message,
                    code: 'CONTENT_VERIFICATION_FAILED'
                });
            }
        }

        // ── STEP 3: Compute engagement rate ───────────────────────────────────
        const views = parseInt(initialStats.views || 0);
        const likes = parseInt(initialStats.likes || 0);
        const comments = parseInt(initialStats.comments || 0);
        const shares = parseInt(initialStats.shares || 0);
        const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

        // ── STEP 4: Persist the submission ─────────────────────────────────────
        const updated = await prisma.campaignCollaboration.update({
            where: { id },
            data: {
                submissionUrl,
                submissionPlatform: platform,
                submissionTitle: title || null,
                submissionNotes: notes || null,
                videoId: videoId || null,
                status: "Under_Review",
                // Raw JSON snapshot
                videoStats: initialStats,
                // Dedicated queryable columns
                viewsCount: views,
                likesCount: likes,
                sharesCount: shares,
                engagementRate: parseFloat(engagementRate.toFixed(4))
            }
        });

        console.log(`[Submit] Collaboration ${id} updated to Under_Review.`);
        res.json(updated);

    } catch (error) {
        console.error("Error submitting content:", error);
        res.status(500).json({
            error: "Failed to submit content",
            details: error.message
        });
    }
});

// ── On-demand stats refresh ──────────────────────────────────────────────────
// GET /api/collaborations/:id/stats
// Fetches fresh stats for a collaboration from the platform API and updates the DB.
router.get("/:id/stats", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id },
            select: {
                id: true,
                creatorId: true,
                submissionUrl: true,
                submissionPlatform: true,
                videoId: true,
                videoStats: true,
                viewsCount: true,
                likesCount: true,
                sharesCount: true,
                engagementRate: true
            }
        });

        if (!collab) return res.status(404).json({ error: "Collaboration not found" });
        if (!collab.submissionUrl || !collab.submissionPlatform) {
            return res.status(400).json({ error: "No submission to refresh stats for" });
        }

        // Only the creator or admin can refresh their own submission stats
        if (collab.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Not authorised" });
        }

        const targetId = (collab.submissionPlatform === 'YouTube' && collab.videoId)
            ? collab.videoId
            : collab.submissionUrl;

        const freshStats = await fetchVideoStats(collab.submissionPlatform, targetId, collab.creatorId);

        const views = parseInt(freshStats.views || 0);
        const likes = parseInt(freshStats.likes || 0);
        const comments = parseInt(freshStats.comments || 0);
        const shares = parseInt(freshStats.shares || 0);
        const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

        const updated = await prisma.campaignCollaboration.update({
            where: { id },
            data: {
                videoStats: freshStats,
                viewsCount: views,
                likesCount: likes,
                sharesCount: shares,
                engagementRate: parseFloat(engagementRate.toFixed(4))
            }
        });

        res.json({ status: 'success', stats: freshStats, collaboration: updated });
    } catch (error) {
        console.error("Error refreshing stats:", error);
        res.status(500).json({ error: "Failed to refresh stats", details: error.message });
    }
});

// ── Audience demographics for a submission ───────────────────────────────────
// GET /api/collaborations/:id/demographics
router.get("/:id/demographics", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id },
            select: { creatorId: true, submissionPlatform: true }
        });

        if (!collab) return res.status(404).json({ error: "Collaboration not found" });

        if (collab.creatorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Not authorised" });
        }

        const demographics = await fetchAudienceDemographics(
            collab.creatorId,
            collab.submissionPlatform || 'Instagram'
        );

        res.json({ status: 'success', demographics });
    } catch (error) {
        console.error("Error fetching demographics:", error);
        res.status(500).json({ error: "Failed to fetch demographics", details: error.message });
    }
});

export default router;
