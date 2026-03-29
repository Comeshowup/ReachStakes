import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listIssues,
  createIssue,
  getIssueDetail,
  updateIssue,
  addIssueComment,
  escalateIssue,
  resolveIssue,
} from '../controllers/adminIssueController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listIssues);
router.post('/', createIssue);
router.get('/:id', getIssueDetail);
router.put('/:id', updateIssue);
router.post('/:id/comments', addIssueComment);
router.put('/:id/escalate', escalateIssue);
router.put('/:id/resolve', resolveIssue);

export default router;
