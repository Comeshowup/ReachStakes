import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listPayments = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { type, status } = req.query;

    // Combine transactions and payouts
    const txWhere = {};
    if (type) txWhere.type = type;
    if (status) txWhere.status = status;

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where: txWhere }),
      prisma.transaction.findMany({
        where: txWhere, skip, take,
        orderBy: { transactionDate: 'desc' },
        include: {
          user: { select: { id: true, name: true, role: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
    ]);

    res.json({ data: transactions, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminPayment] listPayments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

export const getPaymentSummary = async (req, res) => {
  try {
    const [
      totalFunded,
      totalReleased,
      pendingPayouts,
      failedPayouts,
      platformRevenue,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'Deposit', status: 'Completed' },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'Payment', status: 'Completed' },
      }),
      prisma.creatorPayout.count({ where: { status: 'Pending' } }),
      prisma.creatorPayout.count({ where: { status: 'Failed' } }),
      prisma.transaction.aggregate({
        _sum: { platformFee: true },
        where: { status: 'Completed' },
      }),
    ]);

    res.json({
      totalFunded: totalFunded._sum.amount || 0,
      totalReleased: totalReleased._sum.amount || 0,
      pendingPayouts,
      failedPayouts,
      platformRevenue: platformRevenue._sum.platformFee || 0,
    });
  } catch (err) {
    console.error('[adminPayment] getPaymentSummary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

export const retryPayout = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payout = await prisma.creatorPayout.findUnique({ where: { id } });
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    if (payout.status !== 'Failed') return res.status(400).json({ error: 'Only failed payouts can be retried' });
    if (payout.retryCount >= 3) return res.status(400).json({ error: 'Max retry attempts reached' });

    const updated = await prisma.creatorPayout.update({
      where: { id },
      data: { status: 'Pending', retryCount: { increment: 1 }, failureReason: null },
    });

    res.json(updated);
  } catch (err) {
    console.error('[adminPayment] retryPayout:', err);
    res.status(500).json({ error: 'Failed to retry payout' });
  }
};

export const releaseEscrow = async (req, res) => {
  try {
    const { collaborationId, releaseAmount, releaseNote } = req.body;
    if (!collaborationId || !releaseAmount) {
      return res.status(400).json({ error: 'collaborationId and releaseAmount are required' });
    }

    const collab = await prisma.campaignCollaboration.findUnique({
      where: { id: parseInt(collaborationId) },
      include: { campaign: { include: { campaignEscrow: true } } },
    });

    if (!collab) return res.status(404).json({ error: 'Collaboration not found' });
    if (collab.payoutReleased) return res.status(409).json({ error: 'Payout already released for this collaboration' });

    const amount = parseFloat(releaseAmount);
    const escrow = collab.campaign.campaignEscrow;
    if (!escrow || parseFloat(escrow.remainingAmount) < amount) {
      return res.status(400).json({ error: 'Insufficient escrow balance' });
    }

    // Idempotency key to prevent double release
    const idempotencyKey = `campaign_${collab.campaignId}_collab_${collaborationId}_release_${Date.now()}`;

    const [payout, updatedEscrow] = await prisma.$transaction([
      prisma.creatorPayout.create({
        data: {
          creatorId: collab.creatorId,
          collaborationId: parseInt(collaborationId),
          amount,
          idempotencyKey,
          status: 'Pending',
        },
      }),
      prisma.campaignEscrow.update({
        where: { campaignId: collab.campaignId },
        data: {
          releasedAmount: { increment: amount },
          remainingAmount: { decrement: amount },
        },
      }),
    ]);

    // Also log to escrow ledger
    await prisma.escrowLedger.create({
      data: {
        brandId: collab.campaign.brandId,
        campaignId: collab.campaignId,
        type: 'Release',
        amount,
        description: releaseNote || `Escrow release for collaboration ${collaborationId}`,
      },
    });

    res.status(201).json({ payout, escrow: updatedEscrow });
  } catch (err) {
    console.error('[adminPayment] releaseEscrow:', err);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
};
