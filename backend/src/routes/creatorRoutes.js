import express from 'express';
import {
    updateCreatorProfile,
    getCreatorProfile
} from '../controllers/userControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
// router.get('/:handle', getPublicProfile); // Moved from userRoutes if we want

// Protected routes
router.get('/profile', protect, getCreatorProfile);
router.put('/profile', protect, updateCreatorProfile);

export default router;
