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
