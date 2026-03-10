import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadLogo, uploadCover, uploadDoc } from '../config/upload.js';
import {
    getBrandProfile,
    updateBrandProfile,
    getBrandPosts,
    createBrandPost,
    deleteBrandPost,
    getBrandCampaigns,
    uploadBrandLogo,
    uploadBrandCover,
    uploadBrandDocument
} from '../controllers/brandControllers.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile routes
router.get('/profile', getBrandProfile);
router.put('/profile', updateBrandProfile);

// File upload routes
router.post('/profile/logo', uploadLogo.single('file'), uploadBrandLogo);
router.post('/profile/cover', uploadCover.single('file'), uploadBrandCover);
router.post('/profile/documents', uploadDoc.single('file'), uploadBrandDocument);

// Posts routes
router.get('/posts', getBrandPosts);
router.post('/posts', createBrandPost);
router.delete('/posts/:id', deleteBrandPost);

// Campaigns route
router.get('/campaigns', getBrandCampaigns);

export default router;
