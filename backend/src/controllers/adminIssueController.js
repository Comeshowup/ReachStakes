import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

// SLA deadline in hours by priority
const SLA_RESOLUTION_HOURS = { Low: 168, Medium: 72, High: 24, Critical: 8 };

export const listIssues = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { status, priority, category, campaignId, assignedToId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (campaignId) where.campaignId = parseInt(campaignId);
    if (assignedToId) where.assignedToId = parseInt(assignedToId);

    const [total, issues] = await Promise.all([
      prisma.campaignIssue.count({ where }),
      prisma.campaignIssue.findMany({
        where, skip, take,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          campaign: { select: { id: true, title: true } },
          reportedBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    res.json({ data: issues, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminIssue] listIssues:', err);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { campaignId, collaborationId, title, description, category, priority } = req.body;
    if (!campaignId || !title || !description) {
      return res.status(400).json({ error: 'campaignId, title, description are required' });
    }

    const resolvedPriority = priority || 'Medium';
    const slaHours = SLA_RESOLUTION_HOURS[resolvedPriority] || 72;
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours);

    const issue = await prisma.campaignIssue.create({
      data: {
        campaignId: parseInt(campaignId),
        collaborationId: collaborationId ? parseInt(collaborationId) : null,
        reportedById: req.user.id,
        title,
        description,
        category: category || 'Other',
        priority: resolvedPriority,
        slaDeadline,
      },
    });

    res.status(201).json(issue);
  } catch (err) {
    console.error('[adminIssue] createIssue:', err);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

export const getIssueDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const issue = await prisma.campaignIssue.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, title: true, status: true } },
        collaboration: {
          select: { id: true, creator: { select: { id: true, name: true, creatorProfile: { select: { handle: true, avatarUrl: true } } } } },
        },
        reportedBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    console.error('[adminIssue] getIssueDetail:', err);
    res.status(500).json({ error: 'Failed to fetch issue' });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, priority, assignedToId, title, description, category } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId ? parseInt(assignedToId) : null;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;

    const issue = await prisma.campaignIssue.update({ where: { id }, data: updateData });
    res.json(issue);
  } catch (err) {
    console.error('[adminIssue] updateIssue:', err);
    res.status(500).json({ error: 'Failed to update issue' });
  }
};

export const addIssueComment = async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);
    const { content, isInternal } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const comment = await prisma.campaignIssueComment.create({
      data: { issueId, authorId: req.user.id, content, isInternal: !!isInternal },
      include: { author: { select: { id: true, name: true } } },
    });

    // Move issue to InProgress if it was Open
    await prisma.campaignIssue.updateMany({
      where: { id: issueId, status: 'Open' },
      data: { status: 'InProgress' },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error('[adminIssue] addIssueComment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const escalateIssue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const issue = await prisma.campaignIssue.update({
      where: { id },
      data: { status: 'Escalated', priority: 'Critical' },
    });
    res.json(issue);
  } catch (err) {
    console.error('[adminIssue] escalateIssue:', err);
    res.status(500).json({ error: 'Failed to escalate issue' });
  }
};

export const resolveIssue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { resolution } = req.body;
    if (!resolution) return res.status(400).json({ error: 'resolution text is required' });

    const issue = await prisma.campaignIssue.update({
      where: { id },
      data: { status: 'Resolved', resolution, resolvedAt: new Date() },
    });
    res.json(issue);
  } catch (err) {
    console.error('[adminIssue] resolveIssue:', err);
    res.status(500).json({ error: 'Failed to resolve issue' });
  }
};
