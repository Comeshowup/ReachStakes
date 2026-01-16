import { prisma } from "../config/db.js";

export const getPublicProfile = async (req, res) => {
    try {
        const { handle } = req.params;

        // Find user by handle in CreatorProfile
        const creatorProfile = await prisma.creatorProfile.findFirst({
            where: { handle: handle },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                        socialAccounts: {
                            select: {
                                platform: true,
                                username: true,
                                handle: true,
                                profileUrl: true
                            }
                        }
                    }
                },
                services: true,
                demographics: true
            }
        });

        if (!creatorProfile) {
            return res.status(404).json({ status: "error", message: "Profile not found" });
        }

        // Standardize response for Media Kit
        const publicData = {
            fullName: creatorProfile.fullName,
            handle: creatorProfile.handle,
            tagline: creatorProfile.tagline,
            avatarUrl: creatorProfile.avatarUrl,
            about: creatorProfile.about,
            location: creatorProfile.location,
            nicheTags: creatorProfile.nicheTags,
            stats: {
                followers: creatorProfile.followersCount,
                engagement: creatorProfile.engagementRate,
                rating: creatorProfile.rating
            },
            socialAccounts: creatorProfile.user.socialAccounts,
            services: creatorProfile.services,
            brandAffiliations: creatorProfile.brandAffiliations
        };

        res.json({ status: "success", data: publicData });

    } catch (error) {
        console.error("Error fetching public profile:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch profile" });
    }
};

export const discoverCreators = async (req, res) => {
    try {
        const creators = await prisma.user.findMany({
            where: {
                role: 'creator'
            },
            include: {
                creatorProfile: true,
                socialAccounts: {
                    select: {
                        platform: true,
                        username: true,
                        handle: true,
                        profileUrl: true
                    }
                }
            }
        });

        // Map to a cleaner format or directly return
        const discoveryData = creators.map(user => ({
            id: user.id,
            name: user.name,
            ...user.creatorProfile,
            socialAccounts: user.socialAccounts
        }));

        res.json({
            status: 'success',
            data: discoveryData
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to discover creators' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes auth middleware populates req.user

        // Delete user and all related data (cascading delete should be set up in Prisma schema, 
        // otherwise we might need to delete related records manually first, but for now assuming cascade or simple user delete)
        await prisma.user.delete({
            where: { id: userId }
        });

        res.json({ status: 'success', message: 'Account deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ status: 'error', message: 'Failed to delete account' });
    }
};

// GET /api/users/me/profile - Get authenticated creator's full profile
export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                creatorProfile: {
                    include: {
                        services: true,
                        demographics: true
                    }
                },
                socialAccounts: {
                    select: {
                        id: true,
                        platform: true,
                        username: true,
                        handle: true,
                        profileUrl: true
                    }
                }
            }
        });

        if (!user || !user.creatorProfile) {
            return res.status(404).json({ status: "error", message: "Creator profile not found" });
        }

        const profile = {
            id: user.id,
            email: user.email,
            name: user.name,
            ...user.creatorProfile,
            socialAccounts: user.socialAccounts
        };

        res.json({ status: "success", data: profile });
    } catch (error) {
        console.error("Error fetching my profile:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch profile" });
    }
};

// GET /api/users/me/earnings - Get creator's financial summary and transactions
export const getMyEarnings = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all transactions for this creator
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        brand: {
                            select: {
                                brandProfile: {
                                    select: { companyName: true, logoUrl: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { transactionDate: "desc" }
        });

        // Get collaborations with earnings data
        const collaborations = await prisma.campaignCollaboration.findMany({
            where: { creatorId: userId },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        brand: {
                            select: {
                                brandProfile: {
                                    select: { companyName: true, logoUrl: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate summary stats
        const paidTransactions = transactions.filter(t => t.status === "Completed" && t.type === "Payment");
        const pendingTransactions = transactions.filter(t => t.status === "Pending" && t.type === "Payment");

        const totalPayouts = paidTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const pendingEarnings = pendingTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

        // Monthly chart data (last 6 months)
        const chartData = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            const monthTotal = paidTransactions
                .filter(t => {
                    const txDate = new Date(t.transactionDate);
                    return txDate >= monthStart && txDate <= monthEnd;
                })
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            chartData.push({
                name: date.toLocaleString('default', { month: 'short' }),
                value: monthTotal
            });
        }

        // Transaction history for table
        const payoutHistory = paidTransactions.map(t => ({
            id: `TX-${t.id}`,
            date: new Date(t.transactionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            description: t.description || `Payment for ${t.campaign?.title || 'Campaign'}`,
            campaignTitle: t.campaign?.title,
            status: t.status === "Completed" ? "Paid" : t.status,
            amount: parseFloat(t.amount)
        }));

        // Campaign earnings breakdown
        const campaignEarnings = collaborations
            .filter(c => c.agreedPrice)
            .map(c => ({
                id: `CMP-${c.id}`,
                name: c.campaign.title,
                brand: c.campaign.brand?.brandProfile?.companyName || "Unknown",
                brandLogo: c.campaign.brand?.brandProfile?.logoUrl || null,
                status: c.status,
                earnedToDate: c.payoutReleased ? parseFloat(c.agreedPrice) : 0,
                totalValue: parseFloat(c.agreedPrice),
                payoutReleased: c.payoutReleased
            }));

        res.json({
            status: "success",
            data: {
                stats: {
                    totalPayouts,
                    pendingEarnings,
                    completedCampaigns: paidTransactions.length,
                    currency: "USD"
                },
                chartData,
                payoutHistory,
                campaignEarnings
            }
        });
    } catch (error) {
        console.error("Error fetching earnings:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch earnings" });
    }
};

// GET /api/users/me/posts
export const getMyPosts = async (req, res) => {
    try {
        const userId = req.user.id;
        const posts = await prisma.communityPost.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Format
        const formatted = posts.map(p => ({
            id: p.id,
            content: p.contentText,
            date: new Date(p.createdAt).toLocaleDateString(), // or relative time
            mediaType: p.mediaType !== 'none' ? p.mediaType : null,
            mediaUrl: p.mediaUrl,
            likes: 0,
            comments: 0
        }));

        res.json({ status: "success", data: formatted });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch posts" });
    }
};

// POST /api/users/me/posts
export const createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content, mediaType, mediaUrl } = req.body;

        if (!content) return res.status(400).json({ status: "error", message: "Content required" });

        const post = await prisma.communityPost.create({
            data: {
                userId,
                contentText: content,
                mediaType: mediaType || 'none',
                mediaUrl: mediaUrl || null,
                type: 'General'
            }
        });

        res.status(201).json({
            status: "success",
            data: {
                id: post.id,
                content: post.contentText,
                date: "Just now",
                mediaType: post.mediaType !== 'none' ? post.mediaType : null,
                mediaUrl: post.mediaUrl,
                likes: 0,
                comments: 0
            }
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ status: "error", message: "Failed to create post" });
    }
};

// DELETE /api/users/me/posts/:id
export const deletePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = parseInt(req.params.id);

        const post = await prisma.communityPost.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ status: "error", message: "Post not found" });
        if (post.userId !== userId) return res.status(403).json({ status: "error", message: "Unauthorized" });

        await prisma.communityPost.delete({ where: { id: postId } });
        res.json({ status: "success", message: "Post deleted" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ status: "error", message: "Failed to delete post" });
    }
};

// GET /api/users/me/dashboard-stats - Get creator's dashboard statistics (Phase 1 Activation)
export const getMyDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user with profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                creatorProfile: true,
                socialAccounts: { select: { id: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Get campaign collaborations
        const collaborations = await prisma.campaignCollaboration.findMany({
            where: { creatorId: userId },
            include: {
                campaign: {
                    select: { title: true, isGuaranteedPay: true }
                }
            }
        });

        // Calculate stats
        const activeCampaigns = collaborations.filter(c => c.status === 'In_Progress').length;
        const pendingInvites = collaborations.filter(c => c.status === 'Invited').length;
        const appliedCampaigns = collaborations.filter(c => c.status === 'Applied').length;
        const approvedCampaigns = collaborations.filter(c => c.status === 'Approved' || c.status === 'Paid').length;

        // Get completed payouts
        const completedPayouts = await prisma.creatorPayout.findMany({
            where: {
                creatorId: userId,
                status: 'Completed'
            }
        });

        const totalEarnings = completedPayouts.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        // Get pending earnings (approved but not yet paid)
        const pendingEarnings = collaborations
            .filter(c => c.status === 'Approved' && !c.payoutReleased && c.agreedPrice)
            .reduce((sum, c) => sum + parseFloat(c.agreedPrice || 0), 0);

        // Calculate quick win tasks completion
        const profile = user.creatorProfile;
        const quickWinTasks = {
            profileComplete: !!(profile?.fullName && profile?.tagline && profile?.avatarUrl),
            socialLinked: (user.socialAccounts?.length || 0) > 0,
            firstApplied: appliedCampaigns > 0 || activeCampaigns > 0 || approvedCampaigns > 0
        };

        // Calculate match score (simple algorithm based on profile completeness)
        const profileFields = [
            profile?.fullName,
            profile?.tagline,
            profile?.avatarUrl,
            profile?.about,
            profile?.nicheTags,
            profile?.location,
            profile?.basePrice
        ];
        const completedFields = profileFields.filter(Boolean).length;
        const matchScore = Math.round((completedFields / profileFields.length) * 100);

        // Engagement rate from profile
        const engagementRate = profile?.engagementRate ? parseFloat(profile.engagementRate) : 0;

        res.json({
            status: "success",
            data: {
                stats: [
                    {
                        label: "Active Campaigns",
                        value: activeCampaigns.toString(),
                        change: activeCampaigns > 0 ? "In Progress" : "Apply now!",
                        color: "text-blue-500",
                        icon: "Briefcase"
                    },
                    {
                        label: "Pending Invites",
                        value: pendingInvites.toString(),
                        change: pendingInvites > 0 ? "New!" : "None",
                        color: "text-purple-500",
                        icon: "Users"
                    },
                    {
                        label: "Total Earnings",
                        value: `$${totalEarnings.toLocaleString()}`,
                        change: totalEarnings > 0 ? "+earned" : "Start earning!",
                        color: "text-green-500",
                        icon: "DollarSign"
                    },
                    {
                        label: "Avg. Engagement",
                        value: `${engagementRate.toFixed(1)}%`,
                        change: engagementRate > 3 ? "Great!" : "Link social",
                        color: "text-orange-500",
                        icon: "Activity"
                    }
                ],
                pendingEarnings,
                quickWinTasks,
                matchScore,
                userName: user.name,
                onboardingStep: profile?.creatorOnboardingStep || 0,
                completedCampaigns: profile?.completedCampaigns || 0
            }
        });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch dashboard stats" });
    }
};

// PUT /api/users/me/onboarding - Update onboarding progress
export const updateOnboardingProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { step, quickWinTasks } = req.body;

        const updateData = {};

        if (step !== undefined) {
            updateData.creatorOnboardingStep = step;
            if (step >= 4) {
                updateData.creatorOnboardingCompletedAt = new Date();
            }
        }

        if (quickWinTasks) {
            updateData.quickWinTasks = quickWinTasks;
        }

        const updatedProfile = await prisma.creatorProfile.update({
            where: { userId },
            data: updateData
        });

        res.json({
            status: "success",
            data: {
                onboardingStep: updatedProfile.creatorOnboardingStep,
                onboardingCompleted: updatedProfile.creatorOnboardingCompletedAt !== null,
                quickWinTasks: updatedProfile.quickWinTasks
            }
        });
    } catch (error) {
        console.error("Error updating onboarding:", error);
        res.status(500).json({ status: "error", message: "Failed to update onboarding progress" });
    }
};

// GET /api/creators/profile - Get creator profile for editing
export const getCreatorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await prisma.creatorProfile.findUnique({
            where: { userId },
            include: {
                services: true,
                demographics: true
            }
        });

        if (!profile) {
            return res.status(404).json({ status: "error", message: "Creator profile not found" });
        }

        res.json({ status: "success", data: profile });
    } catch (error) {
        console.error("Error fetching creator profile:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch profile" });
    }
};

// PUT /api/creators/profile - Update creator profile
export const updateCreatorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, handle, tagline, avatarUrl, nicheTags, basePrice, location } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (handle) updateData.handle = handle;
        if (tagline) updateData.tagline = tagline;
        if (avatarUrl) updateData.avatarUrl = avatarUrl;
        if (nicheTags) updateData.nicheTags = nicheTags;
        if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
        if (location) updateData.location = location;

        const updatedProfile = await prisma.creatorProfile.update({
            where: { userId },
            data: updateData
        });

        res.json({
            status: "success",
            data: updatedProfile,
            message: "Profile updated successfully"
        });
    } catch (error) {
        console.error("Error updating creator profile:", error);
        res.status(500).json({ status: "error", message: "Failed to update profile" });
    }
};
