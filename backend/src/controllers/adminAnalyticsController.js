import { prisma } from '../config/db.js';

export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCampaigns,
      activeCampaigns,
      totalCreators,
      totalBrands,
      openIssues,
      escalatedIssues,
      revenueData,
      pendingPayouts,
      recentCampaigns,
    ] = await Promise.all([
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: 'Active' } }),
      prisma.user.count({ where: { role: 'creator' } }),
      prisma.user.count({ where: { role: 'brand' } }),
      prisma.campaignIssue.count({ where: { status: { in: ['Open', 'InProgress'] } } }),
      prisma.campaignIssue.count({ where: { status: 'Escalated' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true, platformFee: true },
        where: { status: 'Completed', transactionDate: { gte: thirtyDaysAgo } },
      }),
      prisma.creatorPayout.count({ where: { status: 'Pending' } }),
      prisma.campaign.findMany({
        take: 5, orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, status: true, createdAt: true, _count: { select: { collaborations: true } } },
      }),
    ]);

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalCreators,
      totalBrands,
      openIssues,
      escalatedIssues,
      last30dRevenue: revenueData._sum.amount || 0,
      last30dPlatformFee: revenueData._sum.platformFee || 0,
      pendingPayouts,
      recentCampaigns,
    });
  } catch (err) {
    console.error('[adminAnalytics] getOverview:', err);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

export const getCampaignMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [byStatus, byPlatform, recent] = await Promise.all([
      prisma.campaign.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.campaign.groupBy({ by: ['platformRequired'], _count: { id: true }, where: { platformRequired: { not: null } } }),
      prisma.campaign.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, status: true, targetBudget: true, createdAt: true,
          _count: { select: { collaborations: true, issues: true } },
        },
      }),
    ]);

    res.json({ byStatus, byPlatform, recent });
  } catch (err) {
    console.error('[adminAnalytics] getCampaignMetrics:', err);
    res.status(500).json({ error: 'Failed to fetch campaign metrics' });
  }
};

export const getCreatorMetrics = async (req, res) => {
  try {
    const [byPlatform, byVerification, topCreators] = await Promise.all([
      prisma.creatorProfile.groupBy({ by: ['primaryPlatform'], _count: { userId: true }, where: { primaryPlatform: { not: null } } }),
      prisma.creatorProfile.groupBy({ by: ['verificationTier'], _count: { userId: true } }),
      prisma.creatorProfile.findMany({
        take: 10,
        orderBy: { completedCampaigns: 'desc' },
        select: {
          userId: true, handle: true, avatarUrl: true, primaryPlatform: true,
          completedCampaigns: true, engagementRate: true, rating: true, verificationTier: true,
          user: { select: { name: true } },
        },
      }),
    ]);

    res.json({ byPlatform, byVerification, topCreators });
  } catch (err) {
    console.error('[adminAnalytics] getCreatorMetrics:', err);
    res.status(500).json({ error: 'Failed to fetch creator metrics' });
  }
};

export const getRevenueMetrics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const [byType, dailyRevenue, totalEMV] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['type', 'status'],
        _sum: { amount: true },
        where: { transactionDate: { gte: since } },
      }),
      prisma.analyticsDaily.groupBy({
        by: ['recordDate'],
        _sum: { revenueGenerated: true, spendAmount: true },
        where: { recordDate: { gte: since } },
        orderBy: { recordDate: 'asc' },
      }),
      prisma.campaignCollaboration.aggregate({
        _sum: { estimatedEmv: true },
        where: { status: { in: ['Approved', 'Paid'] } },
      }),
    ]);

    res.json({ byType, dailyRevenue, totalEMV: totalEMV._sum.estimatedEmv || 0 });
  } catch (err) {
    console.error('[adminAnalytics] getRevenueMetrics:', err);
    res.status(500).json({ error: 'Failed to fetch revenue metrics' });
  }
};
