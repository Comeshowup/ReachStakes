import { prisma } from '../config/db.js';

/**
 * @desc   Get latest 20 notifications for the authenticated user
 * @route  GET /api/notifications
 * @access Private
 */
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        // Add relative time to each notification
        const now = new Date();
        const formatted = notifications.map(n => {
            const diff = now - new Date(n.createdAt);
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            let relativeTime;
            if (days > 0) relativeTime = `${days}d ago`;
            else if (hours > 0) relativeTime = `${hours}h ago`;
            else if (minutes > 0) relativeTime = `${minutes}m ago`;
            else relativeTime = 'Just now';

            return { ...n, relativeTime };
        });

        res.json({ status: 'success', data: { notifications: formatted } });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
    }
};

/**
 * @desc   Get unread notification count
 * @route  GET /api/notifications/unread-count
 * @access Private
 */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.json({ status: 'success', data: { count } });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch unread count' });
    }
};

/**
 * @desc   Mark a single notification as read
 * @route  PATCH /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifId = parseInt(req.params.id);

        const notif = await prisma.notification.findUnique({ where: { id: notifId } });

        if (!notif || notif.userId !== userId) {
            return res.status(404).json({ status: 'error', message: 'Notification not found' });
        }

        await prisma.notification.update({
            where: { id: notifId },
            data: { isRead: true }
        });

        res.json({ status: 'success', message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update notification' });
    }
};

/**
 * @desc   Mark all notifications as read for the authenticated user
 * @route  PATCH /api/notifications/mark-all-read
 * @access Private
 */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ status: 'success', message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ status: 'error', message: 'Failed to update notifications' });
    }
};
