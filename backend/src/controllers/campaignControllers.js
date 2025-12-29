import { prisma } from "../config/db.js";

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private/Brand
export const createCampaign = async (req, res) => {
    try {
        const { title, description, platformRequired, campaignType, budgetMin, budgetMax, deadline } = req.body;

        // Ensure user is a brand
        // (Handled by middleware, but extra safety check if needed, though authorize('brand') covers it)

        const campaign = await prisma.campaign.create({
            data: {
                brandId: req.user.id,
                title,
                description,
                platformRequired,
                campaignType,
                budgetMin: budgetMin ? parseFloat(budgetMin) : null,
                budgetMax: budgetMax ? parseFloat(budgetMax) : null,
                deadline: deadline ? new Date(deadline) : null,
                status: 'Active' // Default to Active or Draft based on logic, schema says default Draft
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
                agreedPrice: agreedPrice ? parseFloat(agreedPrice) : null,
                feedbackNotes: pitch // storing pitch in feedbackNotes or similar field if desired
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