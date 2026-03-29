import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listThreads,
  getThreadMessages,
  sendMessage,
  markThreadRead,
} from '../controllers/adminMessageController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/threads', listThreads);
router.get('/threads/:threadId', getThreadMessages);
router.post('/threads/:threadId', sendMessage);
router.put('/threads/:threadId/read', markThreadRead);

export default router;
