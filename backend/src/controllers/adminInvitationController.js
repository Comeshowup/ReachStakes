import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listInvitations = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { status, campaignId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (campaignId) where.campaignId = parseInt(campaignId);

    const [total, invitations] = await Promise.all([
      prisma.campaignInvitation.count({ where }),
      prisma.campaignInvitation.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, status: true } },
          creator: { select: { id: true, name: true, creatorProfile: { select: { handle: true, avatarUrl: true } } } },
          invitedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    res.json({ data: invitations, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminInvitation] listInvitations:', err);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

export const createInvitation = async (req, res) => {
  try {
    const { campaignId, creatorId, message, agreedRate } = req.body;
    if (!campaignId || !creatorId) return res.status(400).json({ error: 'campaignId and creatorId are required' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day TTL

    const invitation = await prisma.campaignInvitation.create({
      data: {
        campaignId: parseInt(campaignId),
        creatorId: parseInt(creatorId),
        invitedById: req.user.id,
        message,
        agreedRate: agreedRate ? parseFloat(agreedRate) : null,
        expiresAt,
      },
    });

    // Create campaign event
    await prisma.campaignEvent.create({
      data: {
        campaignId: parseInt(campaignId),
        type: 'creator_invited',
        description: `Creator (ID: ${creatorId}) invited to campaign`,
        createdBy: req.user.id,
        metadata: { invitationId: invitation.id, creatorId },
      },
    });

    res.status(201).json(invitation);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Creator already invited to this campaign' });
    console.error('[adminInvitation] createInvitation:', err);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const revokeInvitation = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const invitation = await prisma.campaignInvitation.update({
      where: { id },
      data: { status: 'Revoked' },
    });
    res.json(invitation);
  } catch (err) {
    console.error('[adminInvitation] revokeInvitation:', err);
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
};

export const batchInviteCreators = async (req, res) => {
  try {
    const { campaignId, creatorIds, message, agreedRate } = req.body;
    if (!campaignId || !Array.isArray(creatorIds) || creatorIds.length === 0) {
      return res.status(400).json({ error: 'campaignId and creatorIds[] are required' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const results = { created: [], skipped: [] };

    for (const creatorId of creatorIds) {
      try {
        await prisma.campaignInvitation.create({
          data: {
            campaignId: parseInt(campaignId),
            creatorId: parseInt(creatorId),
            invitedById: req.user.id,
            message,
            agreedRate: agreedRate ? parseFloat(agreedRate) : null,
            expiresAt,
          },
        });
        results.created.push(creatorId);
      } catch (e) {
        results.skipped.push({ creatorId, reason: 'Already invited or error' });
      }
    }

    res.status(201).json(results);
  } catch (err) {
    console.error('[adminInvitation] batchInviteCreators:', err);
    res.status(500).json({ error: 'Failed to batch invite' });
  }
};
