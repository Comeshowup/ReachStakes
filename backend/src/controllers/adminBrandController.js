import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listBrands = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { search } = req.query;

    const where = { role: 'brand' };
    if (search) where.name = { contains: search };

    const [total, brands] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where, skip, take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, createdAt: true,
          brandProfile: {
            select: { companyName: true, logoUrl: true, industry: true, companySize: true, hiringStatus: true, onboardingCompleted: true },
          },
          _count: { select: { brandCampaigns: true } },
        },
      }),
    ]);

    res.json({ data: brands, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminBrand] listBrands:', err);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
};

export const getBrandDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const brand = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, createdAt: true,
        brandProfile: true,
        _count: { select: { brandCampaigns: true, transactions: true } },
      },
    });

    if (!brand || brand.role !== 'brand') return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    console.error('[adminBrand] getBrandDetail:', err);
    res.status(500).json({ error: 'Failed to fetch brand' });
  }
};

export const getBrandCampaigns = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { skip, take, page, pageSize } = parsePagination(req.query);

    const [total, campaigns] = await Promise.all([
      prisma.campaign.count({ where: { brandId: id } }),
      prisma.campaign.findMany({
        where: { brandId: id }, skip, take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { collaborations: true } } },
      }),
    ]);

    res.json({ data: campaigns, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminBrand] getBrandCampaigns:', err);
    res.status(500).json({ error: 'Failed to fetch brand campaigns' });
  }
};
