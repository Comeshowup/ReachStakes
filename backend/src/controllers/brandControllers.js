import { prisma } from "../config/db.js";
import { calculateProfileStrength, recalculateAndPersist } from "../services/brandProfile.service.js";

// ─── URL validator ───
function isValidUrl(str) {
    if (!str) return true;
    try { new URL(str); return true; } catch { return false; }
}

// ─── Resolve file URL (prefix relative /uploads paths with backend origin) ───
function resolveFileUrl(req, urlOrPath) {
    if (!urlOrPath) return null;
    // Already a full URL or base64 data URI — return as is
    if (urlOrPath.startsWith('http') || urlOrPath.startsWith('data:')) return urlOrPath;
    // Relative path like /uploads/... — prefix with backend origin
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${urlOrPath}`;
}

// ─── Get authenticated brand's profile ───
export const getBrandProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                brandProfile: true,
                brandCampaigns: {
                    select: { id: true, status: true }
                }
            }
        });

        if (!user || user.role !== 'brand') {
            return res.status(403).json({ status: "error", message: "Access denied. Brand account required." });
        }

        if (!user.brandProfile) {
            return res.status(404).json({ status: "error", message: "Brand profile not found" });
        }

        const bp = user.brandProfile;
        const socialLinks = bp.socialLinks || {};

        // Calculate stats
        const totalCampaigns = user.brandCampaigns.length;
        const activeCampaigns = user.brandCampaigns.filter(c => c.status === 'Active').length;

        // Profile strength
        const { score, checklist } = calculateProfileStrength(bp);

        // Format response to match frontend expectations
        const profileData = {
            id: user.id,
            name: bp.companyName,
            email: user.email,
            tagline: bp.tagline || '',
            industry: bp.industry || '',
            location: bp.location || '',
            about: bp.about || '',
            logo: resolveFileUrl(req, bp.logoUrl),
            banner: resolveFileUrl(req, bp.bannerUrl),
            companySize: bp.companySize || 'Startup',
            hiringStatus: bp.hiringStatus || 'Active',
            websiteUrl: bp.websiteUrl || '',
            brandGuidelines: resolveFileUrl(req, bp.brandGuidelines),
            mediaKit: resolveFileUrl(req, bp.mediaKit),
            socials: {
                website: bp.websiteUrl || '',
                instagram: socialLinks.instagram || '',
                linkedin: socialLinks.linkedin || '',
                twitter: socialLinks.twitter || '',
            },
            contact: {
                email: bp.contactEmail || user.email,
            },
            stats: {
                campaigns: totalCampaigns,
                activeCampaigns: activeCampaigns,
                hiringSince: bp.hiringSince || new Date().getFullYear(),
                rating: 'N/A'
            },
            profileStrength: score,
            completionChecklist: checklist,
            onboarding: {
                primaryGoal: bp.primaryGoal || '',
                budgetRange: bp.budgetRange || '',
                launchTimeline: bp.launchTimeline || '',
                teamEmails: bp.teamEmails || []
            }
        };

        res.json({ status: "success", data: profileData });

    } catch (error) {
        console.error("Error fetching brand profile:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch brand profile" });
    }
};

// ─── Update brand profile ───
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
            banner,
            companySize,
            hiringStatus,
            websiteUrl,
            socials,
            contact,
        } = req.body;

        // Verify user is a brand
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { brandProfile: true }
        });

        if (!user || user.role !== 'brand') {
            return res.status(403).json({ status: "error", message: "Access denied. Brand account required." });
        }

        // Validate social URLs
        const socialFields = ['website', 'instagram', 'linkedin', 'twitter'];
        for (const field of socialFields) {
            const url = socials?.[field];
            if (url && !isValidUrl(url)) {
                return res.status(400).json({
                    status: "error",
                    message: `Invalid ${field} URL`
                });
            }
        }

        // Build social links JSON
        const existingSocials = user.brandProfile?.socialLinks || {};
        const updatedSocials = socials ? {
            ...existingSocials,
            instagram: socials.instagram ?? existingSocials.instagram,
            linkedin: socials.linkedin ?? existingSocials.linkedin,
            twitter: socials.twitter ?? existingSocials.twitter,
        } : undefined;

        // Build update data — only include fields that were sent
        const updateData = {};
        if (name !== undefined) updateData.companyName = name;
        if (tagline !== undefined) updateData.tagline = tagline;
        if (industry !== undefined) updateData.industry = industry;
        if (location !== undefined) updateData.location = location;
        if (about !== undefined) updateData.about = about;
        if (logo !== undefined) updateData.logoUrl = logo;
        if (banner !== undefined) updateData.bannerUrl = banner;
        if (companySize !== undefined) updateData.companySize = companySize;
        if (hiringStatus !== undefined) updateData.hiringStatus = hiringStatus;
        if (socials?.website !== undefined) updateData.websiteUrl = socials.website;
        if (updatedSocials) updateData.socialLinks = updatedSocials;
        if (contact?.email !== undefined) updateData.contactEmail = contact.email;

        // Onboarding fields
        if (req.body.onboardingCompleted !== undefined) updateData.onboardingCompleted = req.body.onboardingCompleted;
        if (req.body.primaryGoal !== undefined) updateData.primaryGoal = req.body.primaryGoal;
        if (req.body.budgetRange !== undefined) updateData.budgetRange = req.body.budgetRange;
        if (req.body.launchTimeline !== undefined) updateData.launchTimeline = req.body.launchTimeline;
        if (req.body.teamEmails !== undefined) updateData.teamEmails = req.body.teamEmails;

        // Update brand profile
        await prisma.brandProfile.update({
            where: { userId },
            data: updateData,
        });

        // Also update user name if provided
        if (name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name }
            });
        }

        // Recalculate and persist profile strength
        const { score, checklist } = await recalculateAndPersist(userId);

        res.json({
            status: "success",
            message: "Profile updated successfully",
            data: { profileStrength: score, completionChecklist: checklist }
        });

    } catch (error) {
        console.error("Error updating brand profile:", error);
        res.status(500).json({ status: "error", message: "Failed to update profile" });
    }
};

// ─── Upload brand logo ───
export const uploadBrandLogo = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        const logoUrl = `/uploads/brands/logos/${req.file.filename}`;

        await prisma.brandProfile.update({
            where: { userId },
            data: { logoUrl },
        });

        const { score } = await recalculateAndPersist(userId);

        res.json({
            status: "success",
            message: "Logo uploaded successfully",
            data: { logoUrl, profileStrength: score }
        });

    } catch (error) {
        console.error("Error uploading logo:", error);
        res.status(500).json({ status: "error", message: "Failed to upload logo" });
    }
};

// ─── Upload brand cover image ───
export const uploadBrandCover = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        const bannerUrl = `/uploads/brands/covers/${req.file.filename}`;

        await prisma.brandProfile.update({
            where: { userId },
            data: { bannerUrl },
        });

        const { score } = await recalculateAndPersist(userId);

        res.json({
            status: "success",
            message: "Cover image uploaded successfully",
            data: { coverImageUrl: bannerUrl, profileStrength: score }
        });

    } catch (error) {
        console.error("Error uploading cover:", error);
        res.status(500).json({ status: "error", message: "Failed to upload cover image" });
    }
};

// ─── Upload brand document (guidelines or media kit) ───
export const uploadBrandDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.body; // 'brandGuidelines' or 'mediaKit'

        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        if (!['brandGuidelines', 'mediaKit'].includes(type)) {
            return res.status(400).json({ status: "error", message: "Invalid document type. Use 'brandGuidelines' or 'mediaKit'" });
        }

        const fileUrl = `/uploads/brands/documents/${req.file.filename}`;

        await prisma.brandProfile.update({
            where: { userId },
            data: { [type]: fileUrl },
        });

        const { score } = await recalculateAndPersist(userId);

        res.json({
            status: "success",
            message: `${type === 'brandGuidelines' ? 'Brand guidelines' : 'Media kit'} uploaded successfully`,
            data: { fileUrl, type, profileStrength: score }
        });

    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ status: "error", message: "Failed to upload document" });
    }
};

// ─── Get brand's community posts ───
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

        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.contentText || '',
            date: formatDate(post.createdAt),
            mediaType: post.mediaType !== 'none' ? post.mediaType : null,
            mediaUrl: post.mediaUrl || null,
            type: post.type,
            likes: 0,
            comments: 0
        }));

        res.json({ status: "success", data: formattedPosts });

    } catch (error) {
        console.error("Error fetching brand posts:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch posts" });
    }
};

// ─── Create a new community post ───
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

// ─── Delete a community post ───
export const deleteBrandPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);

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

// ─── Get brand's campaigns with stats ───
export const getBrandCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;

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

        const formattedCampaigns = campaigns.map(campaign => {
            const creatorCount = campaign.collaborations.length;

            let totalViews = 0;
            campaign.collaborations.forEach(collab => {
                if (collab.videoStats) {
                    const stats = typeof collab.videoStats === 'string'
                        ? JSON.parse(collab.videoStats)
                        : collab.videoStats;
                    totalViews += stats.views || stats.viewCount || 0;
                }
            });

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

// ─── Helper: format date ───
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
