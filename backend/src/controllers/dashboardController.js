import { prisma } from "../config/db.js";

// Helper: Calculate days between two dates
const daysBetween = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
};

// Helper: Calculate pacing status
const calculatePacingStatus = (campaign) => {
    if (!campaign.deadline || !campaign.createdAt) return "On Track";

    const totalDays = daysBetween(campaign.createdAt, campaign.deadline);
    const elapsedDays = daysBetween(campaign.createdAt, new Date());

    if (totalDays <= 0) return "On Track";

    const expectedProgress = (elapsedDays / totalDays) * 100;
    const spent = parseFloat(campaign.totalReleased || 0);
    const allocated = parseFloat(campaign.escrowBalance || 0) + spent;
    const actualProgress = allocated > 0 ? (spent / allocated) * 100 : 0;

    const variance = actualProgress - expectedProgress;

    if (variance > 20) return "Overspending";
    if (variance < -20) return "Underspending";
    return "On Track";
};

// @desc    Get dashboard overview with KPIs and overall ROI
// @route   GET /api/dashboard/overview
// @access  Private/Brand
export const getDashboardOverview = async (req, res) => {
    try {
        const brandId = req.user.id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get active campaigns count
        const activeCampaigns = await prisma.campaign.count({
            where: { brandId, status: 'Active' }
        });

        // Get previous month active campaigns for comparison
        const prevMonthCampaigns = await prisma.campaign.count({
            where: {
                brandId,
                status: 'Active',
                createdAt: { lt: thirtyDaysAgo }
            }
        });

        // Get active creators (unique creators in active campaigns)
        const activeCreators = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId, status: 'Active' },
                status: { in: ['In_Progress', 'Under_Review', 'Approved'] }
            },
            select: { creatorId: true },
            distinct: ['creatorId']
        });

        // Get creators from last 30-60 days for comparison
        const prevPeriodCreators = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId },
                createdAt: { lt: thirtyDaysAgo },
                status: { in: ['In_Progress', 'Under_Review', 'Approved'] }
            },
            select: { creatorId: true },
            distinct: ['creatorId']
        });

        // Get content submitted in last 30 days
        const contentSubmitted = await prisma.campaignCollaboration.count({
            where: {
                campaign: { brandId },
                submissionUrl: { not: null },
                updatedAt: { gte: thirtyDaysAgo }
            }
        });

        // Get content submitted in previous period
        const prevContentSubmitted = await prisma.campaignCollaboration.count({
            where: {
                campaign: { brandId },
                submissionUrl: { not: null },
                updatedAt: {
                    gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                    lt: thirtyDaysAgo
                }
            }
        });

        // Get pending actions count
        const contentApprovals = await prisma.campaignCollaboration.count({
            where: {
                campaign: { brandId },
                status: { in: ['Under_Review', 'Revision'] }
            }
        });

        const paymentApprovals = await prisma.transaction.count({
            where: {
                campaign: { brandId },
                status: 'Pending',
                type: 'Payment'
            }
        });

        const creatorApplications = await prisma.campaignCollaboration.count({
            where: {
                campaign: { brandId },
                status: 'Applied'
            }
        });

        const pendingActions = contentApprovals + paymentApprovals + creatorApplications;

        // Calculate Overall ROI from analytics_daily
        const analytics = await prisma.analyticsDaily.aggregate({
            where: {
                brandId,
                campaign: { status: 'Active' },
                recordDate: { gte: thirtyDaysAgo }
            },
            _sum: {
                revenueGenerated: true,
                spendAmount: true
            }
        });

        const totalRevenue = parseFloat(analytics._sum.revenueGenerated || 0);
        const totalSpend = parseFloat(analytics._sum.spendAmount || 0);
        const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

        // Calculate change indicators
        const campaignChange = activeCampaigns - prevMonthCampaigns;
        const creatorChange = prevPeriodCreators.length > 0
            ? Math.round(((activeCreators.length - prevPeriodCreators.length) / prevPeriodCreators.length) * 100)
            : 0;
        const contentChange = contentSubmitted - prevContentSubmitted;

        res.json({
            status: "success",
            data: {
                brand: {
                    id: brandId
                },
                stats: {
                    activeCampaigns: {
                        value: activeCampaigns,
                        change: campaignChange >= 0 ? `+${campaignChange}` : `${campaignChange}`,
                        period: "month"
                    },
                    activeCreators: {
                        value: activeCreators.length,
                        change: creatorChange >= 0 ? `+${creatorChange}%` : `${creatorChange}%`,
                        comparisonPeriod: "last30Days"
                    },
                    contentSubmitted: {
                        value: contentSubmitted,
                        change: contentChange >= 0 ? `+${contentChange}` : `${contentChange}`,
                        comparisonPeriod: "last30Days"
                    },
                    pendingActions: {
                        value: pendingActions,
                        breakdown: {
                            contentApprovals,
                            paymentApprovals,
                            creatorApplications
                        }
                    }
                },
                overallROI: {
                    value: Math.round(overallROI * 10) / 10,
                    displayValue: overallROI >= 0 ? `+${Math.round(overallROI)}%` : `${Math.round(overallROI)}%`,
                    scope: "active_campaigns",
                    period: "last30Days",
                    lastUpdated: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch dashboard overview" });
    }
};

// @desc    Get campaigns summary with pacing status
// @route   GET /api/dashboard/campaigns
// @access  Private/Brand
export const getCampaignsSummary = async (req, res) => {
    try {
        const brandId = req.user.id;

        const campaigns = await prisma.campaign.findMany({
            where: { brandId },
            include: {
                collaborations: {
                    select: {
                        id: true,
                        creatorId: true,
                        status: true,
                        agreedPrice: true,
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                creatorProfile: {
                                    select: { avatarUrl: true }
                                }
                            }
                        }
                    }
                },
                analytics: {
                    where: {
                        recordDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                transactions: {
                    where: { status: 'Completed' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedCampaigns = campaigns.map(campaign => {
            const creatorCount = campaign.collaborations.length;
            const creators = campaign.collaborations.slice(0, 5).map(c => ({
                id: c.creator.id,
                name: c.creator.name,
                avatar: c.creator.creatorProfile?.avatarUrl || null
            }));

            // Calculate ROI
            const totalRevenue = campaign.analytics.reduce((sum, a) => sum + parseFloat(a.revenueGenerated || 0), 0);
            const totalSpend = campaign.analytics.reduce((sum, a) => sum + parseFloat(a.spendAmount || 0), 0);
            const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

            // Calculate budget
            const allocated = parseFloat(campaign.escrowBalance || 0) + parseFloat(campaign.totalReleased || 0);
            const spent = parseFloat(campaign.totalReleased || 0);
            const percentUsed = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

            // Determine overrun reason if applicable
            let overrunReason = null;
            if (percentUsed > 100) {
                const bonusTransactions = campaign.transactions.filter(t =>
                    t.description?.toLowerCase().includes('bonus')
                );
                overrunReason = bonusTransactions.length > 0 ? "performance_bonus" : "additional_funding";
            }

            // Calculate pacing
            const pacingStatus = calculatePacingStatus(campaign);
            const daysRemaining = campaign.deadline
                ? Math.max(0, daysBetween(new Date(), campaign.deadline))
                : null;

            return {
                id: campaign.id,
                title: campaign.title,
                status: campaign.status,
                creatorCount,
                creators,
                roi: {
                    value: Math.round(roi * 10) / 10,
                    displayValue: roi >= 0 ? `+${Math.round(roi)}%` : `${Math.round(roi)}%`,
                    scope: "last30Days"
                },
                budget: {
                    allocated,
                    spent,
                    percentUsed,
                    overrunReason
                },
                pacing: {
                    status: pacingStatus,
                    daysRemaining,
                    deadline: campaign.deadline
                }
            };
        });

        res.json({ status: "success", data: { campaigns: formattedCampaigns } });

    } catch (error) {
        console.error("Error fetching campaigns summary:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch campaigns summary" });
    }
};

// @desc    Get escrow status with allocations
// @route   GET /api/dashboard/escrow
// @access  Private/Brand
export const getEscrowStatus = async (req, res) => {
    try {
        const brandId = req.user.id;

        const campaigns = await prisma.campaign.findMany({
            where: { brandId },
            select: {
                id: true,
                title: true,
                escrowBalance: true,
                totalFunded: true,
                totalReleased: true,
                escrowStatus: true,
                status: true
            }
        });

        const totalFunded = campaigns.reduce((sum, c) => sum + parseFloat(c.totalFunded || 0), 0);
        const lockedBalance = campaigns.reduce((sum, c) => sum + parseFloat(c.escrowBalance || 0), 0);
        const totalReleased = campaigns.reduce((sum, c) => sum + parseFloat(c.totalReleased || 0), 0);
        const available = totalFunded - lockedBalance - totalReleased;

        const allocations = campaigns
            .filter(c => parseFloat(c.escrowBalance || 0) > 0)
            .map(c => ({
                campaignId: c.id,
                campaignTitle: c.title,
                amount: parseFloat(c.escrowBalance || 0),
                status: c.escrowStatus || 'Locked'
            }));

        // Get recent transactions
        const recentTransactions = await prisma.transaction.findMany({
            where: {
                campaign: { brandId },
                type: { in: ['Deposit', 'Payment'] }
            },
            orderBy: { transactionDate: 'desc' },
            take: 5,
            select: {
                type: true,
                amount: true,
                transactionDate: true,
                status: true
            }
        });

        // Determine explanation
        const availableExplanation = available <= 0 && allocations.length > 0
            ? "All funds allocated to active campaigns"
            : null;

        res.json({
            status: "success",
            data: {
                totalBalance: totalFunded,
                available: Math.max(0, available),
                availableExplanation,
                locked: lockedBalance,
                released: totalReleased,
                allocations,
                recentTransactions: recentTransactions.map(t => ({
                    type: t.type,
                    amount: parseFloat(t.amount),
                    date: t.transactionDate,
                    status: t.status
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching escrow status:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch escrow status" });
    }
};

// @desc    Get pending approvals grouped by campaign
// @route   GET /api/dashboard/approvals
// @access  Private/Brand
export const getPendingApprovals = async (req, res) => {
    try {
        const brandId = req.user.id;

        const pendingCollaborations = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId },
                status: { in: ['Under_Review', 'Revision'] },
                submissionUrl: { not: null }
            },
            include: {
                campaign: {
                    select: { id: true, title: true }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        creatorProfile: {
                            select: { avatarUrl: true, handle: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Group by campaign
        const groupedByCampaign = {};
        pendingCollaborations.forEach(collab => {
            const campaignId = collab.campaign.id;
            if (!groupedByCampaign[campaignId]) {
                groupedByCampaign[campaignId] = {
                    campaignId,
                    campaignTitle: collab.campaign.title,
                    submissions: []
                };
            }
            groupedByCampaign[campaignId].submissions.push({
                id: collab.id,
                creator: collab.creator.name,
                handle: collab.creator.creatorProfile?.handle || null,
                avatar: collab.creator.creatorProfile?.avatarUrl || null,
                platform: collab.submissionPlatform,
                status: collab.status === 'Under_Review' ? 'Pending' : collab.status,
                submittedAt: collab.updatedAt,
                version: collab.deliverableVersion || 1,
                submissionUrl: collab.submissionUrl
            });
        });

        res.json({
            status: "success",
            data: {
                totalPending: pendingCollaborations.length,
                groupedByCampaign: Object.values(groupedByCampaign)
            }
        });

    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch pending approvals" });
    }
};

// @desc    Get recent activity feed with typed events
// @route   GET /api/dashboard/activity
// @access  Private/Brand
export const getRecentActivity = async (req, res) => {
    try {
        const brandId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        // Get financial transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                campaign: { brandId },
                status: 'Completed'
            },
            orderBy: { transactionDate: 'desc' },
            take: 10,
            include: {
                campaign: { select: { title: true } }
            }
        });

        // Get content submissions
        const submissions = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId },
                submissionUrl: { not: null }
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
                creator: { select: { name: true } },
                campaign: { select: { title: true } }
            }
        });

        // Get creator applications
        const applications = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId },
                status: 'Applied'
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                creator: {
                    select: {
                        name: true,
                        creatorProfile: { select: { followersCount: true } }
                    }
                },
                campaign: { select: { title: true } }
            }
        });

        // Format activities
        const activities = [];

        transactions.forEach(t => {
            activities.push({
                id: `tx_${t.id}`,
                type: 'financial',
                eventType: t.type === 'Deposit' ? 'deposit' : 'payment_cleared',
                message: t.type === 'Deposit'
                    ? `Deposit of $${parseFloat(t.amount).toLocaleString()} to ${t.campaign?.title || 'escrow'}`
                    : `Payment of $${parseFloat(t.amount).toLocaleString()} cleared`,
                timestamp: t.transactionDate,
                metadata: {
                    amount: parseFloat(t.amount),
                    campaignId: t.campaignId
                }
            });
        });

        submissions.forEach(s => {
            activities.push({
                id: `sub_${s.id}`,
                type: 'content',
                eventType: 'content_submitted',
                message: `${s.creator.name} submitted content for "${s.campaign.title}"`,
                timestamp: s.updatedAt,
                metadata: {
                    creator: s.creator.name,
                    campaignId: s.campaignId
                }
            });
        });

        applications.forEach(a => {
            const followers = a.creator.creatorProfile?.followersCount || 0;
            const followerStr = followers >= 1000 ? `${Math.round(followers / 1000)}K` : followers;
            activities.push({
                id: `app_${a.id}`,
                type: 'creator',
                eventType: 'creator_applied',
                message: `New application from ${a.creator.name}${followers > 0 ? ` (${followerStr} followers)` : ''}`,
                timestamp: a.createdAt,
                metadata: {
                    creator: a.creator.name,
                    campaignId: a.campaignId
                }
            });
        });

        // Sort by timestamp and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limitedActivities = activities.slice(0, limit);

        // Add relative time
        const now = new Date();
        limitedActivities.forEach(a => {
            const diff = now - new Date(a.timestamp);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (days > 0) a.relativeTime = `${days}d ago`;
            else if (hours > 0) a.relativeTime = `${hours}h ago`;
            else if (minutes > 0) a.relativeTime = `${minutes}m ago`;
            else a.relativeTime = 'Just now';
        });

        res.json({
            status: "success",
            data: { activities: limitedActivities }
        });

    } catch (error) {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch activity" });
    }
};

// @desc    Get top performing campaigns
// @route   GET /api/dashboard/top-campaigns
// @access  Private/Brand
export const getTopCampaigns = async (req, res) => {
    try {
        const brandId = req.user.id;
        const limit = parseInt(req.query.limit) || 3;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const campaigns = await prisma.campaign.findMany({
            where: { brandId, status: 'Active' },
            include: {
                collaborations: {
                    select: { creatorId: true },
                    distinct: ['creatorId']
                },
                analytics: {
                    where: { recordDate: { gte: thirtyDaysAgo } }
                }
            }
        });

        // Calculate ROI and sort
        const campaignsWithROI = campaigns.map(campaign => {
            const totalRevenue = campaign.analytics.reduce((sum, a) => sum + parseFloat(a.revenueGenerated || 0), 0);
            const totalSpend = campaign.analytics.reduce((sum, a) => sum + parseFloat(a.spendAmount || 0), 0);
            const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

            return {
                id: campaign.id,
                title: campaign.title,
                roi: Math.round(roi * 10) / 10,
                roiLabel: roi >= 0 ? `+${Math.round(roi)}%` : `${Math.round(roi)}%`,
                roiPeriod: "last30Days",
                status: campaign.status,
                creatorCount: campaign.collaborations.length
            };
        });

        // Sort by ROI descending and take top N
        campaignsWithROI.sort((a, b) => b.roi - a.roi);
        const topCampaigns = campaignsWithROI.slice(0, limit);

        res.json({
            status: "success",
            data: { campaigns: topCampaigns }
        });

    } catch (error) {
        console.error("Error fetching top campaigns:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch top campaigns" });
    }
};
