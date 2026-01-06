import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { fetchVideoStats } from "../utils/videoStats.js";
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
        const { submissionUrl, platform, videoId } = req.body;
        const userId = req.user.id; // protect middleware ensures this exists

        // DEBUG: Log all incoming data
        console.log("=== SUBMISSION REQUEST RECEIVED ===");
        console.log("Collaboration ID:", id);
        console.log("Platform received:", platform);
        console.log("Submission URL:", submissionUrl);
        console.log("Video ID:", videoId);
        console.log("User ID:", userId);

        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid submission ID" });
        }

        // Fetch initial stats immediately to verify ownership and populate data
        let initialStats = {
            views: "0",
            likes: "0",
            comments: "0"
        };

        if (platform === 'YouTube' && videoId) {
            // We allow this to throw (e.g. Ownership Mismatch) so the user gets the error
            console.log(`Fetching stats for video ${videoId} on platform ${platform} for user ${userId}`);
            const fetched = await fetchVideoStats(platform, videoId, userId);
            console.log("Fetched stats:", fetched);
            // Ensure we use the fetched stats
            initialStats = fetched;
        } else if (platform === 'Instagram' && submissionUrl) {
            console.log(`Fetching stats for Instagram post ${submissionUrl} for user ${userId}`);
            // Pass submissionUrl as the "videoId" argument for Instagram
            const fetched = await fetchVideoStats(platform, submissionUrl, userId);
            console.log("Fetched IG stats:", fetched);
            initialStats = fetched;
        } else if (platform === 'TikTok' && submissionUrl) {
            console.log(`Fetching stats for TikTok video ${submissionUrl} for user ${userId}`);
            const fetched = await fetchVideoStats(platform, submissionUrl, userId);
            console.log("Fetched TikTok stats:", fetched);
            initialStats = fetched;
        }

        const updated = await prisma.campaignCollaboration.update({
            where: { id: id },
            data: {
                submissionUrl,
                submissionPlatform: platform,
                videoId, // Store the YouTube video ID
                status: "Under_Review",
                videoStats: initialStats
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error submitting content:", error);
        res.status(500).json({
            error: "Failed to submit content",
            details: error.message
        });
    }
});

export default router;
