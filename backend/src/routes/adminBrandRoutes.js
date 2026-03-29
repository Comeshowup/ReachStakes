import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listBrands,
  getBrandDetail,
  getBrandCampaigns,
} from '../controllers/adminBrandController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listBrands);
router.get('/:id', getBrandDetail);
router.get('/:id/campaigns', getBrandCampaigns);

export default router;
