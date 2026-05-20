import express from "express";
import { prisma } from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";
import { fetchVideoStats, getSocialAccountForUser, fetchAudienceDemographics } from "../utils/videoStats.js";
import { executePayout } from "../controllers/conciergeControllers.js";
import { DealPricingService } from "../services/dealPricing.service.js";

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
            brandLogo: collab.campaign.brand.brandProfile?.logoUrl,
            platform: collab.submissionPlatform || collab.campaign.platformRequired || "Other",
            status: collab.status,
            date: collab.updatedAt,
            createdAt: collab.createdAt,
            deadline: collab.offerExpiresAt || collab.campaign.deadline || null,
            link: collab.submissionUrl,
            stats: collab.videoStats,
            feedback: collab.feedbackNotes,
            // Payment negotiation
            proposedPrice: collab.proposedPrice ? parseFloat(collab.proposedPrice) : null,
            agreedPrice: collab.agreedPrice ? parseFloat(collab.agreedPrice) : null,
            pricingModel: collab.pricingModel || collab.campaign.pricingModel || 'flat_fee',
            estimatedViews: collab.estimatedViews || null,
            calculatedCpm: collab.calculatedCpm ? parseFloat(collab.calculatedCpm) : null,
            offerTerms: collab.offerTerms || null,
            offerExpiresAt: collab.offerExpiresAt || null,
            offerAcceptedAt: collab.offerAcceptedAt || null,
            payoutReleased: collab.payoutReleased || false,
            payoutDate: collab.payoutDate || null,
            escrowStatus: collab.campaign.escrowBalance > 0 ? 'Locked' : 'Not Funded',
            // New Fields
            deliverables: collab.deliverables,
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

// ── Brand Approvals Queue ─────────────────────────────────────────────────────
// GET /api/collaborations/brand/:brandId/approvals
// Returns only submissions awaiting brand review (Under_Review or Revision)
// with a submissionUrl. Includes rich creator, campaign, and milestone data.
router.get("/brand/:brandId/approvals", protect, async (req, res) => {
    try {
        const brandId = parseInt(req.params.brandId);

        // Authorization: only the brand owner or an admin
        if (req.user.id !== brandId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Not authorized" });
        }

        // CollabStatus enum values: Under_Review, Revision (no Changes_Requested in schema)
        const collaborations = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId },
                status: { in: ['Under_Review', 'Revision'] },
                submissionUrl: { not: null }
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        escrowBalance: true,
                        targetBudget: true,
                        payoutSpeed: true,
                        platformRequired: true,
                        pricingModel: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        // avatar is NOT on User model — fetched from creatorProfile.avatarUrl
                        creatorProfile: {
                            select: {
                                handle: true,
                                avatarUrl: true,
                                primaryPlatform: true,
                                nicheTags: true,
                                socialLinks: true
                            }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const mapped = collaborations.map(c => {
            // Build requirements from milestones if present
            let requirements = [];
            if (c.milestones && Array.isArray(c.milestones)) {
                requirements = c.milestones.map((m, i) => ({
                    id: `req-${c.id}-${i}`,
                    label: typeof m === 'string' ? m : (m.title || m.label || `Milestone ${i + 1}`),
                    isMet: typeof m === 'object' ? (m.completed || false) : false,
                    overridden: false,
                    proof: null,
                    comments: []
                }));
            }

            // Fallback requirements
            if (requirements.length === 0) {
                requirements = [
                    {
                        id: `req-${c.id}-platform`,
                        label: 'Content submitted on correct platform',
                        isMet: !!c.submissionUrl,
                        overridden: false,
                        proof: c.submissionUrl ? { type: 'link', value: c.submissionUrl } : null,
                        comments: []
                    },
                    {
                        id: `req-${c.id}-guidelines`,
                        label: 'Campaign guidelines followed',
                        isMet: c.status === 'Under_Review',
                        overridden: false,
                        proof: null,
                        comments: []
                    }
                ];
            }

            // Determine submission type based on platform
            const platform = c.submissionPlatform || c.campaign.platformRequired || 'Other';
            const isScript = platform === 'Blog' || platform === 'Email';

            // Map DB status → sidebar status key (CollabStatus enum: Under_Review, Revision)
            const statusMap = {
                'Under_Review': 'needs_review',
                'Revision': 'waiting'
            };

            // Build activity timeline from feedback notes
            const timeline = [];
            if (c.feedbackNotes) {
                timeline.push({
                    id: `t-feedback-${c.id}`,
                    role: 'brand',
                    author: 'Brand Manager',
                    date: new Date(c.updatedAt).toLocaleString(),
                    type: 'message',
                    text: c.feedbackNotes
                });
            }
            timeline.push({
                id: `t-submit-${c.id}`,
                role: 'creator',
                author: c.creator?.name || 'Creator',
                date: new Date(c.updatedAt).toLocaleString(),
                type: 'message',
                text: c.submissionNotes || `Submitted ${platform} content for review.`
            });
            timeline.push({
                id: `t-status-${c.id}`,
                role: 'system',
                author: 'System',
                date: new Date(c.updatedAt).toLocaleString(),
                type: 'status',
                text: `Status changed to ${c.status.replace('_', ' ')}`
            });

            // Build smart insights from video stats
            const insights = [];
            if (c.videoStats) {
                const stats = c.videoStats;
                if (stats.views) insights.push({ type: 'detected', text: `${Number(stats.views).toLocaleString()} views detected` });
                if (stats.likes)  insights.push({ type: 'detected', text: `${Number(stats.likes).toLocaleString()} likes` });
                if (stats.comments) insights.push({ type: 'info', text: `${Number(stats.comments).toLocaleString()} comments` });
            }
            if (c.engagementRate) {
                insights.push({ type: 'detected', text: `Engagement rate: ${Number(c.engagementRate).toFixed(2)}%` });
            }

            return {
                id: c.id,  // real numeric DB id
                campaign: c.campaign.title,
                creator: c.creator?.name || 'Creator',
                avatar: c.creator?.creatorProfile?.avatarUrl
                    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.creatorId}`,
                handle: c.creator?.creatorProfile?.handle
                    || c.creator?.email
                    || 'Creator',
                version: 1,  // schema doesn't track version; defaulting to 1
                submittedAt: new Date(c.updatedAt).toLocaleDateString(),
                status: statusMap[c.status] || 'needs_review',
                type: isScript ? 'script' : 'video',
                // Video fields
                videoSrc: platform === 'Other' ? c.submissionUrl : null,  // direct video only for "Other"
                platform: platform,
                videoId: c.videoId || null,
                submissionUrl: c.submissionUrl,
                sponsorTimestamp: null,
                ctaTimestamp: null,
                // Financial
                // agreedPrice is set only once a brand creates/accepts a deal.
                // Never fall back to total campaign budget as an implicit creator fee.
                escrow: Number(c.agreedPrice || 0),
                creatorFee: Number(c.agreedPrice || 0),
                proposedPrice: Number(c.proposedPrice || 0),
                pricingModel: c.pricingModel || c.campaign.pricingModel || 'flat_fee',
                estimatedViews: c.estimatedViews || null,
                calculatedCpm: c.calculatedCpm ? Number(c.calculatedCpm) : null,
                budgetRemaining: Number(c.campaign.escrowBalance || 0),
                roas: null,
                // Content
                requirements,
                timeline,
                insights,
                annotations: [],
                scriptContent: isScript ? (c.submissionNotes || '') : ''
            };
        });

        res.json({ status: 'success', count: mapped.length, data: mapped });
    } catch (error) {
        console.error("Error fetching brand approvals:", error);
        res.status(500).json({ error: "Failed to fetch approvals", details: error.message });
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

// Negotiate a campaign deal offer.
// Either the brand or creator may counter; acceptance converts proposedPrice into agreedPrice.
router.patch("/:id/negotiate", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { action = 'counter', message, deliverables, milestones } = req.body;

        if (!['counter', 'accept', 'decline'].includes(action)) {
            return res.status(400).json({ error: "action must be 'counter', 'accept', or 'decline'" });
        }

        const existing = await prisma.campaignCollaboration.findUnique({
            where: { id },
            include: {
                campaign: {
                    include: {
                        collaborations: {
                            select: { id: true, status: true, agreedPrice: true }
                        }
                    }
                }
            }
        });

        if (!existing) return res.status(404).json({ error: "Collaboration not found" });

        const isBrand = existing.campaign.brandId === req.user.id;
        const isCreator = existing.creatorId === req.user.id;
        if (!isBrand && !isCreator && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Not authorized to negotiate this deal." });
        }

        const actorRole = isBrand ? 'brand' : 'creator';
        const offer = DealPricingService.buildOffer({
            ...req.body,
            proposedPrice: req.body.proposedPrice ?? req.body.amount ?? existing.proposedPrice,
            pricingModel: req.body.pricingModel ?? existing.pricingModel,
            estimatedViews: req.body.estimatedViews ?? existing.estimatedViews,
        });

        if (action === 'counter' && !offer.proposedPrice) {
            return res.status(400).json({ error: "Counter offers require an amount." });
        }

        const currentOfferOwner = existing.offerTerms?.currentOffer?.proposedBy || null;
        if (action === 'accept' && currentOfferOwner === actorRole) {
            return res.status(400).json({ error: "You cannot accept your own offer. Wait for the other party to respond." });
        }

        const acceptedPrice = Number(req.body.agreedPrice || existing.proposedPrice || existing.agreedPrice || 0);
        DealPricingService.assertOfferAllowed({
            campaign: existing.campaign,
            currentCollaboration: existing,
            agreedPrice: action === 'accept' ? acceptedPrice : undefined,
            proposedPrice: action === 'counter' ? offer.proposedPrice : undefined,
            estimatedViews: offer.estimatedViews,
            nextStatus: action === 'accept' ? 'In_Progress' : action === 'decline' ? 'Rejected' : existing.status,
        });

        const offerTerms = DealPricingService.buildOfferTerms({
            existingTerms: existing.offerTerms,
            actorRole,
            action,
            offer: action === 'accept'
                ? { agreedPrice: acceptedPrice, pricingModel: offer.pricingModel }
                : offer,
            message,
            deliverables,
            milestones,
        });

        const data = {
            feedbackNotes: message || existing.feedbackNotes,
            offerTerms,
        };

        if (action === 'counter') {
            data.status = existing.status === 'Applied' ? 'Applied' : 'Invited';
            data.proposedPrice = offer.proposedPrice;
            data.agreedPrice = null;
            data.pricingModel = offer.pricingModel;
            data.estimatedViews = offer.estimatedViews;
            data.calculatedCpm = offer.calculatedCpm;
            data.offerExpiresAt = offer.offerExpiresAt;
            if (deliverables) data.deliverables = deliverables;
            if (milestones) data.milestones = milestones;
        } else if (action === 'accept') {
            if (!acceptedPrice) {
                return res.status(400).json({ error: "No offer amount is available to accept." });
            }
            data.status = 'In_Progress';
            data.agreedPrice = acceptedPrice;
            data.offerAcceptedAt = new Date();
        } else if (action === 'decline') {
            data.status = 'Rejected';
        }

        const updated = await prisma.campaignCollaboration.update({
            where: { id },
            data,
            include: { campaign: true }
        });

        if (message) {
            await prisma.campaignMessage.create({
                data: {
                    campaignId: existing.campaignId,
                    collaborationId: existing.id,
                    threadId: `collab-${existing.id}`,
                    senderId: req.user.id,
                    content: message,
                    type: 'Text',
                }
            });
        }

        await prisma.campaignEvent.create({
            data: {
                campaignId: existing.campaignId,
                type: `deal_${action}`,
                description: `${actorRole} ${action === 'counter' ? 'sent a counter offer' : action === 'accept' ? 'accepted the deal' : 'declined the deal'}`,
                createdBy: req.user.id,
                metadata: {
                    collaborationId: existing.id,
                    actorRole,
                    amount: action === 'accept' ? acceptedPrice : offer.proposedPrice,
                    pricingModel: offer.pricingModel,
                },
            },
        });

        res.json({ status: 'success', data: updated });
    } catch (error) {
        console.error("Error negotiating deal:", error);
        res.status(400).json({ error: error.message || "Failed to negotiate deal" });
    }
});

// Submit Content URL
// Update Collaboration Status (Brand Decision)
router.patch("/:id/decision", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status, feedback } = req.body;
        const offer = DealPricingService.buildOffer(req.body);

        const existing = await prisma.campaignCollaboration.findUnique({
            where: { id },
            include: {
                campaign: {
                    include: {
                        collaborations: {
                            select: {
                                id: true,
                                status: true,
                                agreedPrice: true
                            }
                        }
                    }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({ error: "Collaboration not found" });
        }

        if (existing.campaign.brandId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only the campaign owner can make deal decisions." });
        }

        DealPricingService.assertOfferAllowed({
            campaign: existing.campaign,
            currentCollaboration: existing,
            agreedPrice: offer.agreedPrice,
            nextStatus: status || existing.status,
        });

        // Build update payload — only include agreedPrice if explicitly provided
        const updateData = {
            feedbackNotes: feedback,
        };
        if (status) updateData.status = status;
        if (offer.agreedPrice !== undefined && offer.agreedPrice !== null) {
            updateData.agreedPrice = offer.agreedPrice;
            updateData.pricingModel = offer.pricingModel;
            updateData.estimatedViews = offer.estimatedViews;
            updateData.calculatedCpm = offer.calculatedCpm;
            updateData.offerTerms = offer.offerTerms;
            updateData.offerExpiresAt = offer.offerExpiresAt;
            if (status === 'In_Progress') {
                updateData.offerAcceptedAt = new Date();
            }
        }

        const updated = await prisma.campaignCollaboration.update({
            where: { id: id },
            data: updateData,
            include: { campaign: true } // Fetch campaign for payout check
        });

        // Fast Payouts Logic: If Approved and Instant, trigger payout
        if (status === 'Approved' && updated.campaign.payoutSpeed === 'Instant') {
            console.log(`[Fast Payout] Triggering instant payout for Collaboration ${id}`);
            try {
                await executePayout(id, req.user.id);
                console.log(`[Fast Payout] Payout executed successfully for ${id}`);
            } catch (payoutError) {
                console.error(`[Fast Payout] Payout failed for ${id}:`, payoutError.message);
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
