import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listPayments,
  getPaymentSummary,
  retryPayout,
  releaseEscrow,
} from '../controllers/adminPaymentController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listPayments);
router.get('/summary', getPaymentSummary);
router.post('/release', releaseEscrow);
router.post('/:id/retry', retryPayout);

export default router;
