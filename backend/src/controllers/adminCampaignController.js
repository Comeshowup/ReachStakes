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

export const getCampaignApprovals = async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { status, search, priority, sortBy = 'updatedAt', sortDir = 'desc' } = req.query;

    // Build filter — default to Under_Review so admins see pending content first
    const statusFilter = status && status !== 'all'
      ? status
      : undefined;

    const where = {
      campaignId,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search ? {
        OR: [
          { creator: { name: { contains: search, mode: 'insensitive' } } },
          { submissionTitle: { contains: search, mode: 'insensitive' } },
        ]
      } : {}),
    };

    const collaborations = await prisma.campaignCollaboration.findMany({
      where,
      orderBy: { [sortBy === 'submittedAt' ? 'createdAt' : sortBy]: sortDir },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            creatorProfile: { select: { handle: true, avatarUrl: true, primaryPlatform: true } },
          },
        },
      },
    });

    // Compute KPIs across the full campaign (not filtered)
    const allCollabs = await prisma.campaignCollaboration.findMany({
      where: { campaignId },
      select: { status: true, updatedAt: true },
    });

    const pending = allCollabs.filter(c => c.status === 'Under_Review');
    const approved = allCollabs.filter(c => c.status === 'Approved');
    const rejected = allCollabs.filter(c => c.status === 'Rejected');

    // Map to frontend shape
    const items = collaborations.map(c => ({
      id: String(c.id),
      collabId: c.id,
      creator: {
        id: String(c.creatorId),
        name: c.creator?.name || 'Unknown',
        avatar: c.creator?.creatorProfile?.avatarUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.creator?.name || c.creatorId}`,
        handle: c.creator?.creatorProfile?.handle || null,
        platform: c.creator?.creatorProfile?.primaryPlatform || null,
      },
      content: {
        type: c.submissionPlatform === 'YouTube' ? 'video' : 'image',
        url: c.submissionUrl || null,
        caption: c.submissionTitle || c.submissionNotes || '',
        thumbnail: c.submissionUrl || null,
      },
      status: (() => {
        if (c.status === 'Under_Review') return 'pending';
        if (c.status === 'Approved' || c.status === 'Paid') return 'approved';
        if (c.status === 'Rejected') return 'rejected';
        return 'pending';
      })(),
      rawStatus: c.status,
      riskScore: 0,
      flags: [],
      priority: 'medium',
      submittedAt: c.updatedAt?.toISOString() || c.createdAt?.toISOString(),
      slaDueAt: null,
      reviewedAt: null,
      feedbackNotes: c.feedbackNotes || null,
      agreedPrice: c.agreedPrice ? Number(c.agreedPrice) : null,
      platform: c.submissionPlatform || null,
      auditLog: [
        { action: 'submitted', at: c.createdAt?.toISOString(), actor: c.creator?.name || 'Creator' },
      ],
    }));

    res.json({
      items,
      kpi: {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        total: allCollabs.length,
        avgReviewTime: '—',
      },
    });
  } catch (err) {
    console.error('[adminCampaign] getCampaignApprovals:', err);
    res.status(500).json({ error: 'Failed to fetch approvals' });
  }
};

export const updateApprovalDecision = async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const collabId = parseInt(req.params.collabId);
    const { action } = req.params; // 'approve' | 'reject' | 'changes'
    const { note, reason } = req.body;

    const collab = await prisma.campaignCollaboration.findUnique({
      where: { id: collabId },
    });

    if (!collab || collab.campaignId !== campaignId) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    let newStatus;
    if (action === 'approve') newStatus = 'Approved';
    else if (action === 'reject') newStatus = 'Rejected';
    else if (action === 'changes') newStatus = 'Revision';
    else return res.status(400).json({ error: 'Invalid action. Use approve, reject, or changes.' });

    const updated = await prisma.campaignCollaboration.update({
      where: { id: collabId },
      data: {
        status: newStatus,
        feedbackNotes: note || reason || null,
      },
    });

    // Log the event on the campaign timeline
    await prisma.campaignEvent.create({
      data: {
        campaignId,
        type: `submission_${action}d`,
        description: `Admin ${action}d submission from creator ${collab.creatorId}${
          reason ? ` — ${reason}` : ''
        }`,
        createdBy: req.user.id,
        metadata: { collabId, action, note, reason },
      },
    });

    res.json({ success: true, id: collabId, status: newStatus });
  } catch (err) {
    console.error('[adminCampaign] updateApprovalDecision:', err);
    res.status(500).json({ error: 'Failed to update approval' });
  }
};

export const inviteCampaignCreators = async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { creatorIds, offer, message } = req.body;

    if (!creatorIds || !Array.isArray(creatorIds)) {
      return res.status(400).json({ error: 'creatorIds required' });
    }

    const { amount, deliverables } = offer || {};

    const results = await Promise.all(
      creatorIds.map(async (creatorId) => {
        const collab = await prisma.campaignCollaboration.findFirst({
          where: { campaignId, creatorId },
        });

        if (collab) {
          return prisma.campaignCollaboration.update({
            where: { id: collab.id },
            data: {
              status: 'Invited',
              agreedPrice: amount,
              deliverables,
            },
          });
        }

        return prisma.campaignCollaboration.create({
          data: {
            campaignId,
            creatorId,
            status: 'Invited',
            agreedPrice: amount,
            deliverables,
          },
        });
      })
    );

    // Optionally create CampaignMessages if message exists
    if (message) {
      await Promise.all(
        results.map((collab) =>
          prisma.campaignMessage.create({
            data: {
              campaignId,
              collaborationId: collab.id,
              threadId: `collab-${collab.id}`,
              senderId: req.user.id,
              content: message,
            },
          })
        )
      );
    }

    await prisma.campaignEvent.create({
      data: {
        campaignId,
        type: 'creators_invited',
        description: `Invited ${creatorIds.length} creators`,
        createdBy: req.user.id,
        metadata: { creatorIds, offer },
      },
    });

    res.json({ success: true, count: creatorIds.length });
  } catch (err) {
    console.error('[adminCampaign] inviteCampaignCreators:', err);
    res.status(500).json({ error: 'Failed to invite creators' });
  }
};

export const updateCreatorInviteStatus = async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const collaborationId = parseInt(req.params.collaborationId);
    const { action } = req.params;

    const collab = await prisma.campaignCollaboration.findUnique({
      where: { id: collaborationId },
    });

    if (!collab || collab.campaignId !== campaignId) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    if (action === 'cancel') {
      await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: { status: 'Rejected' },
      });

      await prisma.campaignEvent.create({
        data: {
          campaignId,
          type: 'invite_cancelled',
          description: `Cancelled invite for creator ${collab.creatorId}`,
          createdBy: req.user.id,
        },
      });
      res.json({ success: true, status: 'Rejected' });
    } else if (action === 'resend') {
      await prisma.campaignEvent.create({
        data: {
          campaignId,
          type: 'invite_resent',
          description: `Resent invite to creator ${collab.creatorId}`,
          createdBy: req.user.id,
        },
      });
      res.json({ success: true, status: collab.status });
    } else if (action === 'accept') {
      await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: { status: 'In_Progress' },
      });

      await prisma.campaignEvent.create({
        data: {
          campaignId,
          type: 'application_accepted',
          description: `Accepted application from creator ${collab.creatorId}`,
          createdBy: req.user.id,
        },
      });
      res.json({ success: true, status: 'In_Progress' });
    } else if (action === 'reject') {
      await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: { status: 'Rejected' },
      });

      await prisma.campaignEvent.create({
        data: {
          campaignId,
          type: 'application_rejected',
          description: `Rejected application from creator ${collab.creatorId}`,
          createdBy: req.user.id,
        },
      });
      res.json({ success: true, status: 'Rejected' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    console.error('[adminCampaign] updateCreatorInviteStatus:', err);
    res.status(500).json({ error: 'Failed to update invite' });
  }
};
