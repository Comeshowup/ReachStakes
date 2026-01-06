import express from 'express';
import { getPublicProfile, discoverCreators, deleteUser, getMyProfile, getMyEarnings } from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Discovery route
router.get('/creators/discover', discoverCreators);

// Public route - no auth required for Media Kit
router.get('/profile/public/:handle', getPublicProfile);

// Authenticated routes
router.get('/me/profile', protect, getMyProfile);
router.get('/me/earnings', protect, getMyEarnings);
router.delete('/me', protect, deleteUser);

export default router;
