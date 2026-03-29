import { prisma } from '../config/db.js';

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize) || 25);
  return { skip: (page - 1) * pageSize, take: pageSize, page, pageSize };
};

export const listTasks = async (req, res) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const { status, priority, campaignId, assigneeId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (campaignId) where.campaignId = parseInt(campaignId);
    if (assigneeId) where.assigneeId = parseInt(assigneeId);

    const [total, tasks] = await Promise.all([
      prisma.campaignTask.count({ where }),
      prisma.campaignTask.findMany({
        where, skip, take,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          campaign: { select: { id: true, title: true } },
          assignee: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    res.json({ data: tasks, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('[adminTask] listTasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { campaignId, collaborationId, assigneeId, title, description, priority, dueDate, tags } = req.body;
    if (!campaignId || !title) return res.status(400).json({ error: 'campaignId and title are required' });

    const task = await prisma.campaignTask.create({
      data: {
        campaignId: parseInt(campaignId),
        collaborationId: collaborationId ? parseInt(collaborationId) : null,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        createdById: req.user.id,
        title,
        description,
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || null,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('[adminTask] createTask:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, priority, assigneeId, title, description, dueDate, tags } = req.body;

    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assigneeId !== undefined) data.assigneeId = assigneeId ? parseInt(assigneeId) : null;
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) data.tags = tags;

    if (status === 'Done' && !data.completedAt) data.completedAt = new Date();

    const task = await prisma.campaignTask.update({ where: { id }, data });
    res.json(task);
  } catch (err) {
    console.error('[adminTask] updateTask:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.campaignTask.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('[adminTask] deleteTask:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
