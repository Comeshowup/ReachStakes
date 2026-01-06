import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyMetrics, releasePayout } from "../controllers/conciergeControllers.js";

const router = express.Router();

// --- CONCIERGE SAAS ROUTES (v1.1) ---

// 1. Verify Verification
// GET /api/concierge/verify-metrics/:collaborationId
// Protected: Brand Owners or Admins only
router.get("/verify-metrics/:collaborationId", protect, verifyMetrics);

// 2. Release Escrow
// POST /api/concierge/release-payout/:collaborationId
// Protected: Brand Owners or Admins only
// In a real strict system, might limit to Admin or specific 'Financial' role.
router.post("/release-payout/:collaborationId", protect, releasePayout);

export default router;
