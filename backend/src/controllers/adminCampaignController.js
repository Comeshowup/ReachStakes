import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listCampaigns = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { status, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) where.title = { contains: search };

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where }),
      prisma.campaign.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: { select: { id: true, name: true, brandProfile: { select: { companyName: true, logoUrl: true } } } },
          _count: { select: { collaborations: true, issues: true, tasks: true } },
        },
      }),
    ]);

    res.json({ data: campaigns, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCampaign] listCampaigns:', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getCampaignDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true, email: true, brandProfile: { select: { companyName: true, logoUrl: true, industry: true } } } },
        collaborations: {
          include: {
            creator: { select: { id: true, name: true, creatorProfile: { select: { handle: true, avatarUrl: true, primaryPlatform: true } } } },
          },
        },
        campaignEscrow: true,
        _count: { select: { collaborations: true, issues: true, tasks: true, invitations: true } },
      },
    });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    console.error('[adminCampaign] getCampaignDetail:', err);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

export const updateCampaignStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status },
    });

    // Log event
    await prisma.campaignEvent.create({
      data: {
        campaignId: id,
        type: 'status_changed',
        description: `Campaign status changed to ${status}`,
        createdBy: req.user.id,
        metadata: { newStatus: status },
      },
    });

    res.json(campaign);
  } catch (err) {
    console.error('[adminCampaign] updateCampaignStatus:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getCampaignCreators = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);

    const [total, collaborations] = await Promise.all([
      prisma.campaignCollaboration.count({ where: { campaignId: id } }),
      prisma.campaignCollaboration.findMany({
        where: { campaignId: id },
        skip,
        take,
        include: {
          creator: {
            select: {
              id: true, name: true, email: true,
              creatorProfile: { select: { handle: true, avatarUrl: true, primaryPlatform: true, followersCount: true, engagementRate: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ data: collaborations, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCampaign] getCampaignCreators:', err);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
};

export const getCampaignDeliverables = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const collaborations = await prisma.campaignCollaboration.findMany({
      where: { campaignId: id },
      select: {
        id: true,
        status: true,
        deliverables: true,
        milestones: true,
        submissionUrl: true,
        submissionTitle: true,
        submissionPlatform: true,
        deliverableVersion: true,
        agreedPrice: true,
        payoutReleased: true,
        creator: { select: { id: true, name: true, creatorProfile: { select: { handle: true, avatarUrl: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(collaborations);
  } catch (err) {
    console.error('[adminCampaign] getCampaignDeliverables:', err);
    res.status(500).json({ error: 'Failed to fetch deliverables' });
  }
};

export const getCampaignTimeline = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const [total, events] = await Promise.all([
      prisma.campaignEvent.count({ where: { campaignId: id } }),
      prisma.campaignEvent.findMany({
        where: { campaignId: id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ data: events, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCampaign] getCampaignTimeline:', err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
};

export const getCampaignPayments = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [transactions, escrow] = await Promise.all([
      prisma.transaction.findMany({
        where: { campaignId: id },
        orderBy: { transactionDate: 'desc' },
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.campaignEscrow.findUnique({ where: { campaignId: id } }),
    ]);

    res.json({ transactions, escrow });
  } catch (err) {
    console.error('[adminCampaign] getCampaignPayments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getCampaignActivity = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);

    const [total, events] = await Promise.all([
      prisma.campaignEvent.count({ where: { campaignId: id } }),
      prisma.campaignEvent.findMany({
        where: { campaignId: id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({ data: events, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCampaign] getCampaignActivity:', err);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

export const getCampaignStats = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        campaignEscrow: true,
        _count: { select: { collaborations: true, issues: true, tasks: true } },
      },
    });

    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const approvedCount = await prisma.campaignCollaboration.count({
      where: { campaignId: id, status: { in: ['Approved', 'Paid'] } },
    });

    const openIssueCount = await prisma.campaignIssue.count({
      where: { campaignId: id, status: { in: ['Open', 'InProgress', 'Escalated'] } },
    });

    res.json({
      totalCreators: campaign._count.collaborations,
      approvedDeliverables: approvedCount,
      openIssues: openIssueCount,
      totalTasks: campaign._count.tasks,
      escrow: campaign.campaignEscrow,
      targetBudget: campaign.targetBudget,
      escrowBalance: campaign.escrowBalance,
      totalFunded: campaign.totalFunded,
      totalReleased: campaign.totalReleased,
    });
  } catch (err) {
    console.error('[adminCampaign] getCampaignStats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
