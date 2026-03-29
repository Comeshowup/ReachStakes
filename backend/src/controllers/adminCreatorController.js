import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listCreators = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { search, platform, payoutStatus } = req.query;

    const where = { role: 'creator' };
    if (search) where.name = { contains: search };

    const profileWhere = {};
    if (platform) profileWhere.primaryPlatform = platform;
    if (payoutStatus) profileWhere.payoutStatus = payoutStatus;

    const [total, creators] = await Promise.all([
      prisma.user.count({ where: { ...where, creatorProfile: Object.keys(profileWhere).length ? { is: profileWhere } : undefined } }),
      prisma.user.findMany({
        where: { ...where, creatorProfile: Object.keys(profileWhere).length ? { is: profileWhere } : undefined },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, createdAt: true,
          creatorProfile: {
            select: {
              handle: true, avatarUrl: true, primaryPlatform: true,
              followersCount: true, engagementRate: true, rating: true,
              verificationTier: true, completedCampaigns: true,
              payoutStatus: true, onboardingStatus: true,
            },
          },
          _count: { select: { creatorCollabs: true } },
        },
      }),
    ]);

    res.json({ data: creators, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCreator] listCreators:', err);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
};

export const getCreatorDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const creator = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, createdAt: true,
        creatorProfile: {
          include: { demographics: true, services: true, beneficiaries: true },
        },
        socialAccounts: true,
        _count: { select: { creatorCollabs: true, transactions: true } },
      },
    });

    if (!creator || creator.role !== 'creator') return res.status(404).json({ error: 'Creator not found' });
    res.json(creator);
  } catch (err) {
    console.error('[adminCreator] getCreatorDetail:', err);
    res.status(500).json({ error: 'Failed to fetch creator' });
  }
};

export const getCreatorCampaigns = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);

    const [total, collabs] = await Promise.all([
      prisma.campaignCollaboration.count({ where: { creatorId: id } }),
      prisma.campaignCollaboration.findMany({
        where: { creatorId: id },
        skip, take,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, title: true, status: true, deadline: true, targetBudget: true, brand: { select: { name: true } } } },
        },
      }),
    ]);

    res.json({ data: collabs, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCreator] getCreatorCampaigns:', err);
    res.status(500).json({ error: 'Failed to fetch creator campaigns' });
  }
};

export const getCreatorPayouts = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);

    const [total, payouts] = await Promise.all([
      prisma.creatorPayout.count({ where: { creatorId: id } }),
      prisma.creatorPayout.findMany({
        where: { creatorId: id },
        skip, take,
        orderBy: { initiatedAt: 'desc' },
      }),
    ]);

    res.json({ data: payouts, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminCreator] getCreatorPayouts:', err);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
};
