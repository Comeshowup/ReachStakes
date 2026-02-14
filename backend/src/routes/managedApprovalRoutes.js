import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    toggleCampaignManagedApproval,
    getCMQueue,
    cmApproveContent,
    cmRejectContent,
    getDashboardStats,
    getBrandManagedItems,
    requestEscalation,
    cmPickupItem
} from "../controllers/managedApprovalController.js";

const router = express.Router();

// ============================================================
// MANAGED APPROVAL ROUTES
// ============================================================

// --- Brand Routes ---

// Toggle managed approval for a campaign
// PATCH /api/managed-approvals/campaigns/:campaignId/toggle
router.patch("/campaigns/:campaignId/toggle", protect, toggleCampaignManagedApproval);

// Get managed items for a brand's campaigns
// GET /api/managed-approvals/brand/:brandId
router.get("/brand/:brandId", protect, getBrandManagedItems);

// Brand requests escalation to CM
// POST /api/managed-approvals/:collabId/escalate
router.post("/:collabId/escalate", protect, requestEscalation);

// --- Admin/CM Routes ---

// Get CM pending queue
// GET /api/managed-approvals/cm-queue
router.get("/cm-queue", protect, getCMQueue);

// Get dashboard stats
// GET /api/managed-approvals/stats
router.get("/stats", protect, getDashboardStats);

// CM picks up item for review
// POST /api/managed-approvals/:collabId/cm-pickup
router.post("/:collabId/cm-pickup", protect, cmPickupItem);

// CM approves content
// POST /api/managed-approvals/:collabId/cm-approve
router.post("/:collabId/cm-approve", protect, cmApproveContent);

// CM rejects content
// POST /api/managed-approvals/:collabId/cm-reject
router.post("/:collabId/cm-reject", protect, cmRejectContent);

export default router;
