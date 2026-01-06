import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getBrandProfile,
    updateBrandProfile,
    getBrandPosts,
    createBrandPost,
    deleteBrandPost,
    getBrandCampaigns
} from '../controllers/brandControllers.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getBrandProfile);
router.put('/profile', updateBrandProfile);

// Posts routes
router.get('/posts', getBrandPosts);
router.post('/posts', createBrandPost);
router.delete('/posts/:id', deleteBrandPost);

// Campaigns route
router.get('/campaigns', getBrandCampaigns);

export default router;
