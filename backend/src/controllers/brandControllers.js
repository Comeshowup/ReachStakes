import { prisma } from "../config/db.js";

// Get authenticated brand's profile
export const getBrandProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                brandProfile: true,
                brandCampaigns: {
                    select: {
                        id: true,
                        status: true
                    }
                }
            }
        });

        if (!user || user.role !== 'brand') {
            return res.status(403).json({ status: "error", message: "Access denied. Brand account required." });
        }

        if (!user.brandProfile) {
            return res.status(404).json({ status: "error", message: "Brand profile not found" });
        }

        // Calculate stats
        const totalCampaigns = user.brandCampaigns.length;
        const activeCampaigns = user.brandCampaigns.filter(c => c.status === 'Active').length;

        // Format response to match frontend expectations
        const profileData = {
            id: user.id,
            name: user.brandProfile.companyName,
            email: user.email,
            tagline: user.brandProfile.tagline || '',
            industry: user.brandProfile.industry || '',
            location: user.brandProfile.location || '',
            about: user.brandProfile.about || '',
            logo: user.brandProfile.logoUrl || null,
            banner: null, // Can be extended in schema if needed
            companySize: user.brandProfile.companySize || 'Startup',
            hiringStatus: user.brandProfile.hiringStatus || 'Active',
            websiteUrl: user.brandProfile.websiteUrl || '',
            socials: user.brandProfile.socialLinks || {},
            contact: {
                email: user.brandProfile.contactEmail || user.email,
                phone: '' // Can be added to schema if needed
            },
            stats: {
                campaigns: totalCampaigns,
                activeCampaigns: activeCampaigns,
                hiringSince: user.brandProfile.hiringSince || new Date().getFullYear(),
                rating: '4.8/5' // Can be calculated from collaborations
            }
        };

        res.json({ status: "success", data: profileData });

    } catch (error) {
        console.error("Error fetching brand profile:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch brand profile" });
    }
};

// Update brand profile
export const updateBrandProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name,
            tagline,
            industry,
            location,
            about,
            logo,
            companySize,
            hiringStatus,
            websiteUrl,
            socials,
            contact,
            skills
        } = req.body;

        // Verify user is a brand
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { brandProfile: true }
        });

        if (!user || user.role !== 'brand') {
            return res.status(403).json({ status: "error", message: "Access denied. Brand account required." });
        }

        // Update brand profile
        const updatedProfile = await prisma.brandProfile.update({
            where: { userId: userId },
            data: {
                companyName: name || undefined,
                tagline: tagline || undefined,
                industry: industry || undefined,
                location: location || undefined,
                about: about || undefined,
                logoUrl: logo || undefined,
                companySize: companySize || undefined,
                hiringStatus: hiringStatus || undefined,
                websiteUrl: websiteUrl || undefined,
                socialLinks: socials || undefined,
                contactEmail: contact?.email || undefined
            }
        });

        // Also update user name if provided
        if (name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name: name }
            });
        }

        res.json({
            status: "success",
            message: "Profile updated successfully",
            data: updatedProfile
        });

    } catch (error) {
        console.error("Error updating brand profile:", error);
        res.status(500).json({ status: "error", message: "Failed to update profile" });
    }
};

// Get brand's community posts
export const getBrandPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await prisma.communityPost.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
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
        });

        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.contentText || '',
            date: formatDate(post.createdAt),
            mediaType: post.mediaType !== 'none' ? post.mediaType : null,
            mediaUrl: post.mediaUrl || null,
            type: post.type,
            likes: 0, // Can be extended with likes table
            comments: 0 // Can be extended with comments table
        }));

        res.json({ status: "success", data: formattedPosts });

    } catch (error) {
        console.error("Error fetching brand posts:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch posts" });
    }
};

// Create a new community post
export const createBrandPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, mediaType, mediaUrl, type } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ status: "error", message: "Post content is required" });
        }

        const post = await prisma.communityPost.create({
            data: {
                userId: userId,
                type: type || 'General',
                contentText: content,
                mediaType: mediaType || 'none',
                mediaUrl: mediaUrl || null
            }
        });

        res.status(201).json({
            status: "success",
            data: {
                id: post.id,
                content: post.contentText,
                date: 'Just now',
                mediaType: post.mediaType !== 'none' ? post.mediaType : null,
                mediaUrl: post.mediaUrl,
                type: post.type,
                likes: 0,
                comments: 0
            }
        });

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ status: "error", message: "Failed to create post" });
    }
};

// Delete a community post
export const deleteBrandPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);

        // Verify the post belongs to the user
        const post = await prisma.communityPost.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ status: "error", message: "Post not found" });
        }

        if (post.userId !== userId) {
            return res.status(403).json({ status: "error", message: "Not authorized to delete this post" });
        }

        await prisma.communityPost.delete({
            where: { id: postId }
        });

        res.json({ status: "success", message: "Post deleted successfully" });

    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ status: "error", message: "Failed to delete post" });
    }
};

// Get brand's campaigns with stats
export const getBrandCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[DEBUG] getBrandCampaigns - UserID: ${userId}`);

        const campaigns = await prisma.campaign.findMany({
            where: { brandId: userId },
            include: {
                collaborations: {

                    select: {
                        id: true,
                        status: true,
                        videoStats: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format campaigns for frontend
        const formattedCampaigns = campaigns.map(campaign => {
            const creatorCount = campaign.collaborations.length;

            // Calculate total views from video stats
            let totalViews = 0;
            campaign.collaborations.forEach(collab => {
                if (collab.videoStats) {
                    const stats = typeof collab.videoStats === 'string'
                        ? JSON.parse(collab.videoStats)
                        : collab.videoStats;
                    totalViews += stats.views || stats.viewCount || 0;
                }
            });

            // Calculate simple ROI estimate
            const roi = totalViews > 0 ? `${((totalViews / 1000) * 2.5).toFixed(1)}x` : '-';

            return {
                id: campaign.id,
                name: campaign.title,
                status: campaign.status,
                platform: campaign.platformRequired,
                type: campaign.campaignType,
                targetBudget: parseFloat(campaign.targetBudget) || 0,
                escrowBalance: parseFloat(campaign.escrowBalance) || 0,
                totalFunded: parseFloat(campaign.totalFunded) || 0,
                totalReleased: parseFloat(campaign.totalReleased) || 0,
                fundingProgress: campaign.targetBudget > 0
                    ? Math.round((parseFloat(campaign.escrowBalance) / parseFloat(campaign.targetBudget)) * 100)
                    : 0,
                deadline: campaign.deadline,
                creators: creatorCount,
                roi: roi,
                totalViews: totalViews,
                createdAt: campaign.createdAt
            };
        });

        res.json({ status: "success", data: formattedCampaigns });

    } catch (error) {
        console.error("Error fetching brand campaigns:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch campaigns" });
    }
};

// Helper function to format date
function formatDate(date) {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}
