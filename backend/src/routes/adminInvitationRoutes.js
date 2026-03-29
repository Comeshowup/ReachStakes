import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listInvitations,
  createInvitation,
  revokeInvitation,
  batchInviteCreators,
} from '../controllers/adminInvitationController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listInvitations);
router.post('/', createInvitation);
router.post('/batch', batchInviteCreators);
router.put('/:id/revoke', revokeInvitation);

export default router;
