import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    generateBundle,
    getBundle,
    getCampaignBundles,
    getCampaignResults,
    getCreatorResults,
    getMyBundles,
    generateAllBundles,
    getRevenueTimeline,
    getCreatorAttributionDetail
} from "../controllers/attributionController.js";

const router = express.Router();

// === BRAND ROUTES ===

// Generate tracking bundle for a single collaboration
router.post("/generate/:collaborationId", protect, generateBundle);

// Generate bundles for all approved collaborations in a campaign
router.post("/campaign/:campaignId/generate-all", protect, generateAllBundles);

// Get all tracking bundles for a campaign
router.get("/campaign/:campaignId/bundles", protect, getCampaignBundles);

// Get attribution results for a campaign
router.get("/results/:campaignId", protect, getCampaignResults);

// Get revenue timeline for charts
router.get("/timeline/:campaignId", protect, getRevenueTimeline);

// Get detailed attribution for a specific creator in a campaign
router.get("/detail/:campaignId/:creatorId", protect, getCreatorAttributionDetail);

// === CREATOR ROUTES ===

// Get my tracking bundles (for creators)
router.get("/my-bundles", protect, getMyBundles);

// Get creator attribution results
router.get("/results/creator/:creatorId", protect, getCreatorResults);

// === SHARED ROUTES ===

// Get specific tracking bundle by collaboration ID
router.get("/bundle/:collaborationId", protect, getBundle);

export default router;

