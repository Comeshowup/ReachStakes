import express from 'express';
import {
    getPublicProfile,
    discoverCreators,
    deleteUser,
    getMyProfile,
    updateMyProfile,
    getMyEarnings,
    getMyPosts,
    createPost,
    deletePost,
    getMyDashboardStats,
    updateOnboardingProgress,
    uploadCreatorAvatar
} from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../config/upload.js';

const router = express.Router();

// Discovery route
router.get('/creators/discover', discoverCreators);

// Public route - no auth required for Media Kit
router.get('/profile/public/:handle', getPublicProfile);

// Authenticated routes
router.get('/me/profile', protect, getMyProfile);
router.put('/me/profile', protect, updateMyProfile);
router.post('/me/avatar', protect, uploadAvatar.single('file'), uploadCreatorAvatar);
router.get('/me/earnings', protect, getMyEarnings);
router.get('/me/dashboard-stats', protect, getMyDashboardStats);
router.put('/me/onboarding', protect, updateOnboardingProgress);
router.get('/me/posts', protect, getMyPosts);
router.post('/me/posts', protect, createPost);
router.delete('/me/posts/:id', protect, deletePost);
router.delete('/me', protect, deleteUser);

export default router;

