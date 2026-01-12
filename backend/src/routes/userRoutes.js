import express from 'express';
import { getPublicProfile, discoverCreators, deleteUser, getMyProfile, getMyEarnings, getMyPosts, createPost, deletePost } from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Discovery route
router.get('/creators/discover', discoverCreators);

// Public route - no auth required for Media Kit
router.get('/profile/public/:handle', getPublicProfile);

// Authenticated routes
router.get('/me/profile', protect, getMyProfile);
router.get('/me/earnings', protect, getMyEarnings);
router.get('/me/posts', protect, getMyPosts);
router.post('/me/posts', protect, createPost);
router.delete('/me/posts/:id', protect, deletePost);
router.delete('/me', protect, deleteUser);

export default router;
