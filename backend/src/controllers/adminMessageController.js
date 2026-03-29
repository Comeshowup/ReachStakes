import { prisma } from '../config/db.js';

// Build a thread ID for a campaign (general or per-creator)
const buildThreadId = (campaignId, creatorId = null) =>
  creatorId
    ? `campaign_${campaignId}_creator_${creatorId}`
    : `campaign_${campaignId}_general`;

export const listThreads = async (req, res) => {
  try {
    const { campaignId } = req.query;
    const where = {};
    if (campaignId) where.campaignId = parseInt(campaignId);

    // Get latest message per thread
    const threads = await prisma.campaignMessage.findMany({
      where,
      distinct: ['threadId'],
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { id: true, title: true } },
        sender: { select: { id: true, name: true } },
      },
    });

    res.json(threads);
  } catch (err) {
    console.error('[adminMessage] listThreads:', err);
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
};

export const getThreadMessages = async (req, res) => {
  try {
    const { threadId } = req.params;
    const messages = await prisma.campaignMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    res.json(messages);
  } catch (err) {
    console.error('[adminMessage] getThreadMessages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, type, isInternal, attachments, campaignId } = req.body;
    if (!content || !campaignId) return res.status(400).json({ error: 'content and campaignId are required' });

    const message = await prisma.campaignMessage.create({
      data: {
        campaignId: parseInt(campaignId),
        threadId,
        senderId: req.user.id,
        content,
        type: type || 'Text',
        isInternal: !!isInternal,
        attachments: attachments || null,
        readBy: JSON.stringify([{ userId: req.user.id, readAt: new Date().toISOString() }]),
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('[adminMessage] sendMessage:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const markThreadRead = async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id;
    const now = new Date().toISOString();

    const messages = await prisma.campaignMessage.findMany({ where: { threadId }, select: { id: true, readBy: true } });

    for (const msg of messages) {
      const readBy = Array.isArray(msg.readBy) ? msg.readBy : [];
      if (!readBy.find((r) => r.userId === userId)) {
        readBy.push({ userId, readAt: now });
        await prisma.campaignMessage.update({ where: { id: msg.id }, data: { readBy } });
      }
    }

    res.json({ success: true, markedCount: messages.length });
  } catch (err) {
    console.error('[adminMessage] markThreadRead:', err);
    res.status(500).json({ error: 'Failed to mark read' });
  }
};
