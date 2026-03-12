import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getSupportStatus,
    getSupportMetrics,
    createTicket,
    getTickets,
    getTicketById,
    replyToTicket,
    startLiveChat,
    endLiveChat,
    bookStrategyCall,
    getStrategyCalls,
} from '../controllers/supportController.js';

const router = express.Router();

// All support routes require authentication
router.use(protect);

// Status & Metrics
router.get('/status', getSupportStatus);
router.get('/metrics', getSupportMetrics);

// Tickets
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketById);
router.post('/tickets/:id/messages', replyToTicket);

// Live Chat
router.post('/live-chat/start', startLiveChat);
router.post('/live-chat/end', endLiveChat);

// Strategy Calls
router.post('/calls/book', bookStrategyCall);
router.get('/calls', getStrategyCalls);

export default router;
