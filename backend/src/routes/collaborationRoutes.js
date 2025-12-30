import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { fetchVideoStats } from "../utils/videoStats.js";

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
            feedback: collab.feedbackNotes
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
        const { brandId } = req.params;

        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: {
                    brandId: brandId
                }
            },
            include: {
                campaign: true,
                creator: true // Get creator details
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
        const { creatorId } = req.params;

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

// Update Collaboration Status (e.g., APPROVED, REJECTED, COMPLETED)
router.patch("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.campaignCollaboration.update({
            where: { id: id },
            data: { status: status }
        });

        res.json(updated);
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// Submit Content URL
router.post("/:id/submit", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { submissionUrl, platform, videoId } = req.body;
        const userId = req.user.id; // protect middleware ensures this exists

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
