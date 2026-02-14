import { prisma } from "../config/db.js";
import {
    setApprovalDeadline,
    escalateToManager,
    getCMPendingQueue,
    approveByCM,
    rejectByCM,
    approveByBrand,
    toggleManagedApproval,
    getCMDashboardStats
} from "../services/managedApprovalService.js";

// ============================================================
// MANAGED APPROVAL CONTROLLER
// API endpoints for brands (toggle) and admins (CM queue)
// ============================================================

/**
 * @desc    Toggle managed approval mode for a campaign
 * @route   PATCH /api/managed-approvals/campaigns/:campaignId/toggle
 * @access  Private/Brand
 */
export const toggleCampaignManagedApproval = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { enabled, mode } = req.body; // mode: 'Manual' | 'AutoManaged'
        const userId = req.user.id;

        // Verify ownership
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ status: "error", message: "Campaign not found" });
        }

        if (campaign.brandId !== userId && req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Not authorized" });
        }

        const updated = await toggleManagedApproval(
            parseInt(campaignId),
            enabled,
            mode || "Manual"
        );

        res.status(200).json({
            status: "success",
            message: `Managed approval ${enabled ? "enabled" : "disabled"}`,
            data: {
                campaignId: updated.id,
                isManagedApproval: updated.isManagedApproval,
                managedApprovalMode: updated.managedApprovalMode
            }
        });
    } catch (error) {
        console.error("[ManagedApproval] Toggle error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    Get CM pending queue (all escalated items)
 * @route   GET /api/managed-approvals/cm-queue
 * @access  Private/Admin
 */
export const getCMQueue = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Admin access required" });
        }

        const queue = await getCMPendingQueue();

        res.status(200).json({
            status: "success",
            count: queue.length,
            data: queue
        });
    } catch (error) {
        console.error("[ManagedApproval] Get CM queue error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    CM approves content on brand's behalf
 * @route   POST /api/managed-approvals/:collabId/cm-approve
 * @access  Private/Admin
 */
export const cmApproveContent = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Admin access required" });
        }

        const { collabId } = req.params;
        const { notes } = req.body;
        const cmUserId = req.user.id;

        const updated = await approveByCM(parseInt(collabId), cmUserId, notes);

        res.status(200).json({
            status: "success",
            message: "Content approved by Campaign Manager",
            data: {
                collaborationId: updated.id,
                approvalStatus: updated.approvalStatus,
                approvedBy: updated.approvedBy,
                approvedByRole: updated.approvedByRole
            }
        });
    } catch (error) {
        console.error("[ManagedApproval] CM approve error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    CM rejects content on brand's behalf
 * @route   POST /api/managed-approvals/:collabId/cm-reject
 * @access  Private/Admin
 */
export const cmRejectContent = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Admin access required" });
        }

        const { collabId } = req.params;
        const { feedback, notes } = req.body;
        const cmUserId = req.user.id;

        if (!feedback) {
            return res.status(400).json({
                status: "error",
                message: "Feedback is required when rejecting content"
            });
        }

        const updated = await rejectByCM(parseInt(collabId), cmUserId, feedback, notes);

        res.status(200).json({
            status: "success",
            message: "Content rejected by Campaign Manager",
            data: {
                collaborationId: updated.id,
                approvalStatus: updated.approvalStatus,
                feedbackNotes: updated.feedbackNotes
            }
        });
    } catch (error) {
        console.error("[ManagedApproval] CM reject error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    Get dashboard stats for CMs
 * @route   GET /api/managed-approvals/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Admin access required" });
        }

        const stats = await getCMDashboardStats();

        res.status(200).json({
            status: "success",
            data: stats
        });
    } catch (error) {
        console.error("[ManagedApproval] Stats error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    Get managed items for a specific brand
 * @route   GET /api/managed-approvals/brand/:brandId
 * @access  Private/Brand
 */
export const getBrandManagedItems = async (req, res) => {
    try {
        const { brandId } = req.params;
        const userId = req.user.id;

        // Verify access
        if (parseInt(brandId) !== userId && req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Not authorized" });
        }

        const items = await prisma.campaignCollaboration.findMany({
            where: {
                campaign: { brandId: parseInt(brandId) },
                approvalStatus: {
                    in: ["CMEscalated", "CMReview", "ApprovedByCM", "RejectedByCM"]
                }
            },
            include: {
                campaign: true,
                creator: { include: { creatorProfile: true } }
            },
            orderBy: { updatedAt: "desc" }
        });

        res.status(200).json({
            status: "success",
            count: items.length,
            data: items.map(item => ({
                id: item.id,
                campaignTitle: item.campaign.title,
                creatorName: item.creator?.name,
                creatorHandle: item.creator?.creatorProfile?.handle,
                submissionUrl: item.submissionUrl,
                approvalStatus: item.approvalStatus,
                escalatedAt: item.escalatedAt,
                escalatedReason: item.escalatedReason,
                managedNote: item.managedNote,
                updatedAt: item.updatedAt
            }))
        });
    } catch (error) {
        console.error("[ManagedApproval] Brand items error:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    Manually escalate an item to CM (brand requests help)
 * @route   POST /api/managed-approvals/:collabId/escalate
 * @access  Private/Brand
 */
export const requestEscalation = async (req, res) => {
    try {
        const { collabId } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: parseInt(collabId) },
            include: { campaign: true }
        });

        if (!collab) {
            return res.status(404).json({ status: "error", message: "Collaboration not found" });
        }

        if (collab.campaign.brandId !== userId && req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Not authorized" });
        }

        const result = await escalateToManager(parseInt(collabId), "brand_request");

        res.status(200).json({
            status: "success",
            message: "Content escalated to Campaign Manager",
            data: result
        });
    } catch (error) {
        console.error("[ManagedApproval] Escalation error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * @desc    CM picks up an item for review
 * @route   POST /api/managed-approvals/:collabId/cm-pickup
 * @access  Private/Admin
 */
export const cmPickupItem = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ status: "error", message: "Admin access required" });
        }

        const { collabId } = req.params;
        const cmUserId = req.user.id;

        const updated = await prisma.campaignCollaboration.update({
            where: { id: parseInt(collabId) },
            data: {
                approvalStatus: "CMReview"
            }
        });

        res.status(200).json({
            status: "success",
            message: "Item picked up for review",
            data: {
                collaborationId: updated.id,
                approvalStatus: updated.approvalStatus
            }
        });
    } catch (error) {
        console.error("[ManagedApproval] CM pickup error:", error);
        res.status(400).json({ status: "error", message: error.message });
    }
};

export default {
    toggleCampaignManagedApproval,
    getCMQueue,
    cmApproveContent,
    cmRejectContent,
    getDashboardStats,
    getBrandManagedItems,
    requestEscalation,
    cmPickupItem
};
