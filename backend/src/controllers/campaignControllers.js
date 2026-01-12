import { prisma } from "../config/db.js";

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private/Brand
export const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            platformRequired,
            campaignType,
            targetBudget, // Added targetBudget
            budgetMin, // Keeping for backward compatibility if needed
            budgetMax,
            deadline,
            // New Contractual Fields
            usageRights,
            usageCategory,
            exclusivity,
            exclusivityPeriod,
            isWhitelistingRequired
        } = req.body;

        // Ensure user is a brand
        // (Handled by middleware, but extra safety check if needed, though authorize('brand') covers it)

        const campaign = await prisma.campaign.create({
            data: {
                brandId: req.user.id,
                title,
                description,
                platformRequired,
                campaignType,
                campaignType,
                targetBudget: budgetMin ? parseFloat(budgetMin) : (targetBudget ? parseFloat(targetBudget) : null), // Handle legacy or new
                deadline: deadline ? new Date(deadline) : null,
                status: 'Draft', // Default to Draft for new requests
                // New Contractual Fields
                usageRights,
                usageCategory,
                exclusivity,
                exclusivityPeriod: exclusivityPeriod ? parseInt(exclusivityPeriod) : null,
                isWhitelistingRequired: isWhitelistingRequired === true || isWhitelistingRequired === 'true'
            }
        });

        res.status(201).json({
            status: 'success',
            data: campaign
        });

    } catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create campaign'
        });
    }
};

// @desc    Apply to a campaign
// @route   POST /api/campaigns/:id/apply
// @access  Private/Creator
export const applyToCampaign = async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const { agreedPrice, pitch } = req.body; // 'pitch' is not in schema but maybe 'feedbackNotes' or we just create simple access

        // Verify campaign exists
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({
                status: 'error',
                message: 'Campaign not found'
            });
        }

        // Check if already applied
        const existingCollab = await prisma.campaignCollaboration.findFirst({
            where: {
                campaignId,
                creatorId: req.user.id
            }
        });

        if (existingCollab) {
            return res.status(400).json({
                status: 'error',
                message: 'You have already applied to this campaign'
            });
        }

        // Create collaboration
        const collaboration = await prisma.campaignCollaboration.create({
            data: {
                campaignId,
                creatorId: req.user.id,
                status: 'Applied',
                agreedPrice: agreedPrice && !isNaN(parseFloat(agreedPrice)) ? parseFloat(agreedPrice) : null,
                feedbackNotes: pitch || null,
                milestones: {
                    "Concept": "pending",
                    "Script": "pending",
                    "Draft": "pending",
                    "Final": "pending",
                    "Live": "pending"
                }
            }
        });

        res.status(201).json({
            status: 'success',
            data: collaboration
        });

    } catch (error) {
        console.error("Error applying to campaign:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to apply to campaign'
        });
    }
};

// @desc    Get all campaigns for a specific brand
// @route   GET /api/campaigns/brand/:brandId
// @access  Private
export const getBrandCampaigns = async (req, res) => {
    try {
        const brandId = parseInt(req.params.brandId);

        const campaigns = await prisma.campaign.findMany({
            where: { brandId: brandId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: campaigns
        });
    } catch (error) {
        console.error("Error fetching brand campaigns:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brand campaigns'
        });
    }
};

// @desc    Get all campaigns a creator has joined/is working in
// @route   GET /api/campaigns/creator/:creatorId
// @access  Private
export const getCreatorCampaigns = async (req, res) => {
    try {
        const creatorId = parseInt(req.params.creatorId);

        // Fetch collaborations and include the related campaign details
        const collaborations = await prisma.campaignCollaboration.findMany({
            where: { creatorId: creatorId },
            include: {
                campaign: {
                    include: {
                        brand: {
                            select: {
                                name: true,
                                brandProfile: {
                                    select: {
                                        companyName: true,
                                        logoUrl: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            status: 'success',
            data: collaborations
        });
    } catch (error) {
        console.error("Error fetching creator campaigns:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch creator campaigns'
        });
    }
};

// @desc    Get all active campaigns for discovery
// @route   GET /api/campaigns/all
// @access  Public (or Private)
export const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            // where: { status: 'Active' }, // Uncomment when status field is strictly managed
            orderBy: { createdAt: 'desc' },
            include: {
                brand: {
                    select: {
                        brandProfile: {
                            select: {
                                companyName: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            status: 'success',
            data: campaigns
        });
    } catch (error) {
        console.error("Error fetching all campaigns:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch campaigns'
        });
    }
};

// @desc    Get single campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public (or Private)
export const getCampaignById = async (req, res) => {
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                brand: {
                    select: {
                        brandProfile: {
                            select: {
                                companyName: true,
                                logoUrl: true
                            }
                        }
                    }
                }
            }
        });

        if (!campaign) {
            return res.status(404).json({
                status: 'error',
                message: 'Campaign not found'
            });
        }

        res.json({
            status: 'success',
            data: campaign
        });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch campaign'
        });
    }
};

// @desc    Invite a creator to a campaign
// @route   POST /api/campaigns/:id/invite
// @access  Private/Brand
export const inviteToCampaign = async (req, res) => {
    try {
        const campaignId = parseInt(req.params.id);
        const { creatorId } = req.body;

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId }
        });

        if (!campaign) {
            return res.status(404).json({ status: 'error', message: 'Campaign not found' });
        }

        if (campaign.brandId !== req.user.id) {
            return res.status(403).json({ status: 'error', message: 'Not authorized' });
        }

        const existingCollab = await prisma.campaignCollaboration.findFirst({
            where: { campaignId, creatorId: parseInt(creatorId) }
        });

        if (existingCollab) {
            return res.status(400).json({ status: 'error', message: 'Already exists' });
        }

        const collaboration = await prisma.campaignCollaboration.create({
            data: {
                campaignId,
                creatorId: parseInt(creatorId),
                status: 'Invited',
                milestones: {
                    "Concept": "pending",
                    "Script": "pending",
                    "Draft": "pending",
                    "Final": "pending",
                    "Live": "pending"
                }
            }
        });

        res.status(201).json({ status: 'success', data: collaboration });
    } catch (error) {
        console.error("Error inviting:", error);
        res.status(500).json({ status: 'error', message: 'Failed to invite' });
    }
};

// @desc    Respond to an invitation (Accept/Decline)
// @route   PATCH /api/campaigns/respond/:collabId
// @access  Private/Creator
export const respondToInvite = async (req, res) => {
    try {
        const collabId = parseInt(req.params.collabId);
        const { action } = req.body; // 'accept' or 'decline'

        const collaboration = await prisma.campaignCollaboration.findUnique({
            where: { id: collabId }
        });

        if (!collaboration || collaboration.creatorId !== req.user.id) {
            return res.status(404).json({ status: 'error', message: 'Invitation not found' });
        }

        if (collaboration.status !== 'Invited') {
            return res.status(400).json({ status: 'error', message: 'Not a pending invitation' });
        }

        const updatedStatus = action === 'accept' ? 'Applied' : 'Declined';

        const updated = await prisma.campaignCollaboration.update({
            where: { id: collabId },
            data: { status: updatedStatus }
        });

        res.json({ status: 'success', data: updated });
    } catch (error) {
        console.error("Error responding:", error);
        res.status(500).json({ status: 'error', message: 'Failed to respond' });
    }
};
