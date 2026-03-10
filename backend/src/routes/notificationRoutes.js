import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications?limit=20
router.get('/', getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

export default router;
