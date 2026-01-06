import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getMediaKit,
    refreshMediaKitStats
} from "../controllers/mediaKitControllers.js";

const router = express.Router();

// Public: View Media Kit
router.get("/:handle", getMediaKit);

// Protected: Refresh Stats
router.get("/config/refresh", protect, refreshMediaKitStats);

export default router;
