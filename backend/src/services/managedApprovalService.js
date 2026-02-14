import { prisma } from "../config/db.js";
import Queue from "bull";
import {
    sendDeadlineWarning,
    sendEscalationNotice,
    sendCMApprovalNotice,
    sendCMRejectionNotice
} from "./notificationService.js";

// ============================================================
// MANAGED APPROVAL SERVICE
// Handles automatic escalation, CM queue management, and approval workflow
// Uses Bull Queue for reliable 24-hour timeout processing
// ============================================================

// Queue Configuration - uses Redis for persistence
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Escalation Queue - processes items after 24h timeout
export const escalationQueue = new Queue("managed-approval-escalation", REDIS_URL, {
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for debugging
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 60000 // 1 minute initial delay
        }
    }
});

// Warning Queue - sends notifications 6h before deadline
export const warningQueue = new Queue("managed-approval-warning", REDIS_URL, {
    defaultJobOptions: {
        removeOnComplete: true,
        attempts: 2
    }
});

// ============================================================
// QUEUE PROCESSORS
// ============================================================

/**
 * Process escalation jobs - triggered 24h after content submission
 */
escalationQueue.process(async (job) => {
    const { collaborationId } = job.data;
    console.log(`[ManagedApproval] Processing escalation for collaboration ${collaborationId}`);

    try {
        // Fetch current state - might have been approved already
        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: collaborationId },
            include: {
                campaign: { include: { brand: true } },
                creator: { include: { creatorProfile: true } }
            }
        });

        if (!collab) {
            console.log(`[ManagedApproval] Collaboration ${collaborationId} not found, skipping`);
            return { status: "skipped", reason: "not_found" };
        }

        // Only escalate if still pending brand review
        if (collab.approvalStatus !== "BrandPending") {
            console.log(`[ManagedApproval] Collaboration ${collaborationId} no longer pending (${collab.approvalStatus})`);
            return { status: "skipped", reason: "already_processed" };
        }

        // Perform escalation
        const result = await escalateToManager(collaborationId, "24h_timeout");
        return result;

    } catch (error) {
        console.error(`[ManagedApproval] Escalation error for ${collaborationId}:`, error);
        throw error; // Bull will retry
    }
});

/**
 * Process warning jobs - triggered 6h before deadline
 */
warningQueue.process(async (job) => {
    const { collaborationId } = job.data;
    console.log(`[ManagedApproval] Sending deadline warning for collaboration ${collaborationId}`);

    try {
        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: collaborationId },
            include: {
                campaign: { include: { brand: true } },
                creator: { include: { creatorProfile: true } }
            }
        });

        if (!collab || collab.approvalStatus !== "BrandPending") {
            return { status: "skipped", reason: "no_longer_pending" };
        }

        // Send warning notification
        await sendDeadlineWarningNotification(collab);
        return { status: "success", message: "Warning sent" };

    } catch (error) {
        console.error(`[ManagedApproval] Warning error for ${collaborationId}:`, error);
        throw error;
    }
});

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Set the 24-hour approval deadline when content is submitted
 * Called from collaboration submission flow
 * @param {number} collaborationId 
 * @returns {Object} Updated collaboration
 */
export const setApprovalDeadline = async (collaborationId) => {
    const collab = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: { campaign: true }
    });

    if (!collab) {
        throw new Error("Collaboration not found");
    }

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const warningTime = new Date(now.getTime() + 18 * 60 * 60 * 1000); // 18 hours (6h before deadline)

    // Determine initial approval status based on campaign settings
    let initialStatus = "BrandPending";
    if (collab.campaign.isManagedApproval && collab.campaign.managedApprovalMode === "AutoManaged") {
        initialStatus = "CMReview";
    }

    // Update collaboration with deadline
    const updated = await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: {
            approvalStatus: initialStatus,
            approvalDeadline: deadline,
            status: "Under_Review"
        }
    });

    // Schedule jobs only for manual mode (brand reviews first)
    if (initialStatus === "BrandPending") {
        // Schedule warning notification (18h after submission = 6h before deadline)
        const warningDelay = warningTime.getTime() - now.getTime();
        await warningQueue.add(
            { collaborationId },
            {
                delay: warningDelay,
                jobId: `warning-${collaborationId}`
            }
        );

        // Schedule escalation (24h after submission)
        const escalationDelay = deadline.getTime() - now.getTime();
        await escalationQueue.add(
            { collaborationId },
            {
                delay: escalationDelay,
                jobId: `escalation-${collaborationId}`
            }
        );

        console.log(`[ManagedApproval] Scheduled deadline for collab ${collaborationId}:`);
        console.log(`  - Warning at: ${warningTime.toISOString()}`);
        console.log(`  - Escalation at: ${deadline.toISOString()}`);
    } else {
        console.log(`[ManagedApproval] AutoManaged mode - collab ${collaborationId} sent directly to CM queue`);
    }

    return updated;
};

/**
 * Escalate a collaboration to Campaign Manager review
 * @param {number} collaborationId 
 * @param {string} reason - 'auto_managed' | '24h_timeout' | 'brand_request'
 * @returns {Object} Updated collaboration
 */
export const escalateToManager = async (collaborationId, reason = "24h_timeout") => {
    const collab = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: {
            campaign: { include: { brand: true } },
            creator: { include: { creatorProfile: true } }
        }
    });

    if (!collab) {
        throw new Error("Collaboration not found");
    }

    // Update status to escalated
    const updated = await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: {
            approvalStatus: "CMEscalated",
            escalatedAt: new Date(),
            escalatedReason: reason
        }
    });

    // Send notification to brand
    await sendEscalationNotification(collab, reason);

    console.log(`[ManagedApproval] Escalated collab ${collaborationId} to CM (reason: ${reason})`);

    return {
        status: "escalated",
        collaborationId,
        reason,
        escalatedAt: updated.escalatedAt
    };
};

/**
 * Get all items pending CM review (for admin dashboard)
 * @returns {Array} Escalated collaborations
 */
export const getCMPendingQueue = async () => {
    const queue = await prisma.campaignCollaboration.findMany({
        where: {
            approvalStatus: {
                in: ["CMEscalated", "CMReview"]
            }
        },
        include: {
            campaign: {
                include: {
                    brand: {
                        include: { brandProfile: true }
                    }
                }
            },
            creator: {
                include: { creatorProfile: true }
            }
        },
        orderBy: [
            { escalatedAt: "asc" } // Oldest first
        ]
    });

    return queue.map(item => ({
        id: item.id,
        campaignId: item.campaignId,
        campaignTitle: item.campaign.title,
        brandName: item.campaign.brand?.brandProfile?.companyName || item.campaign.brand?.name,
        brandId: item.campaign.brandId,
        creatorName: item.creator?.name,
        creatorHandle: item.creator?.creatorProfile?.handle,
        creatorAvatar: item.creator?.creatorProfile?.avatarUrl,
        submissionUrl: item.submissionUrl,
        submissionTitle: item.submissionTitle,
        platform: item.submissionPlatform,
        agreedPrice: item.agreedPrice,
        status: item.approvalStatus,
        escalatedAt: item.escalatedAt,
        escalatedReason: item.escalatedReason,
        approvalDeadline: item.approvalDeadline,
        submittedAt: item.updatedAt
    }));
};

/**
 * CM approves content on brand's behalf
 * @param {number} collaborationId 
 * @param {number} cmUserId - The admin user performing the action
 * @param {string} notes - Optional notes about the decision
 */
export const approveByCM = async (collaborationId, cmUserId, notes = "") => {
    const collab = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: { campaign: true }
    });

    if (!collab) {
        throw new Error("Collaboration not found");
    }

    if (!["CMEscalated", "CMReview"].includes(collab.approvalStatus)) {
        throw new Error(`Cannot approve: status is ${collab.approvalStatus}`);
    }

    // Update to approved status
    const updated = await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: {
            approvalStatus: "ApprovedByCM",
            status: "Approved", // Also update main ColabStatus
            approvedBy: cmUserId,
            approvedByRole: "admin",
            managedNote: notes
        }
    });

    // Cancel any pending queue jobs
    await cancelPendingJobs(collaborationId);

    // Send notification to brand
    await sendCMApprovalNotification(collab, cmUserId, "approved");

    console.log(`[ManagedApproval] CM ${cmUserId} approved collab ${collaborationId}`);

    return updated;
};

/**
 * CM rejects content on brand's behalf
 * @param {number} collaborationId 
 * @param {number} cmUserId 
 * @param {string} feedback - Feedback for the creator
 * @param {string} notes - Internal CM notes
 */
export const rejectByCM = async (collaborationId, cmUserId, feedback = "", notes = "") => {
    const collab = await prisma.campaignCollaboration.findUnique({
        where: { id: collaborationId },
        include: { campaign: true, creator: true }
    });

    if (!collab) {
        throw new Error("Collaboration not found");
    }

    if (!["CMEscalated", "CMReview"].includes(collab.approvalStatus)) {
        throw new Error(`Cannot reject: status is ${collab.approvalStatus}`);
    }

    // Update status
    const updated = await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: {
            approvalStatus: "RejectedByCM",
            status: "Revision",
            approvedBy: cmUserId,
            approvedByRole: "admin",
            managedNote: notes,
            feedbackNotes: feedback
        }
    });

    // Cancel pending jobs
    await cancelPendingJobs(collaborationId);

    // Send notifications
    await sendCMApprovalNotification(collab, cmUserId, "rejected", feedback);

    console.log(`[ManagedApproval] CM ${cmUserId} rejected collab ${collaborationId}`);

    return updated;
};

/**
 * Brand approves directly (cancels escalation timers)
 * @param {number} collaborationId 
 * @param {number} brandUserId 
 */
export const approveByBrand = async (collaborationId, brandUserId) => {
    const updated = await prisma.campaignCollaboration.update({
        where: { id: collaborationId },
        data: {
            approvalStatus: "ApprovedByBrand",
            status: "Approved",
            approvedBy: brandUserId,
            approvedByRole: "brand"
        }
    });

    // Cancel pending escalation jobs
    await cancelPendingJobs(collaborationId);

    console.log(`[ManagedApproval] Brand ${brandUserId} approved collab ${collaborationId}`);

    return updated;
};

/**
 * Toggle managed approval mode for a campaign
 * @param {number} campaignId 
 * @param {boolean} enabled 
 * @param {string} mode - 'Manual' | 'AutoManaged'
 */
export const toggleManagedApproval = async (campaignId, enabled, mode = "Manual") => {
    const updated = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
            isManagedApproval: enabled,
            managedApprovalMode: mode
        }
    });

    console.log(`[ManagedApproval] Campaign ${campaignId} managed approval: ${enabled} (${mode})`);

    return updated;
};

/**
 * Get dashboard stats for CM view
 */
export const getCMDashboardStats = async () => {
    const [escalatedCount, reviewingCount, approvedTodayCount, avgResponseTime] = await Promise.all([
        prisma.campaignCollaboration.count({
            where: { approvalStatus: "CMEscalated" }
        }),
        prisma.campaignCollaboration.count({
            where: { approvalStatus: "CMReview" }
        }),
        prisma.campaignCollaboration.count({
            where: {
                approvalStatus: "ApprovedByCM",
                updatedAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        }),
        // Calculate average response time (mock for now)
        Promise.resolve(4.2) // hours
    ]);

    return {
        pendingEscalated: escalatedCount,
        inReview: reviewingCount,
        approvedToday: approvedTodayCount,
        avgResponseTimeHours: avgResponseTime,
        totalPending: escalatedCount + reviewingCount
    };
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Cancel pending warning and escalation jobs for a collaboration
 */
const cancelPendingJobs = async (collaborationId) => {
    try {
        const warningJob = await warningQueue.getJob(`warning-${collaborationId}`);
        if (warningJob) await warningJob.remove();

        const escalationJob = await escalationQueue.getJob(`escalation-${collaborationId}`);
        if (escalationJob) await escalationJob.remove();

        console.log(`[ManagedApproval] Cancelled pending jobs for collab ${collaborationId}`);
    } catch (error) {
        console.warn(`[ManagedApproval] Error cancelling jobs:`, error.message);
    }
};

/**
 * Send deadline warning notification to brand
 * Uses real notification service
 */
const sendDeadlineWarningNotification = async (collab) => {
    console.log(`[Notification] Sending deadline warning for brand ${collab.campaign.brandId}`);
    await sendDeadlineWarning(collab);
};

/**
 * Send escalation notification to brand
 * Uses real notification service
 */
const sendEscalationNotification = async (collab, reason) => {
    console.log(`[Notification] Sending escalation notice for brand ${collab.campaign.brandId}`);
    await sendEscalationNotice(collab, reason);
};

/**
 * Send CM approval/rejection notification
 * Uses real notification service
 */
const sendCMApprovalNotification = async (collab, cmUserId, action, feedback = "") => {
    console.log(`[Notification] CM ${action} notification for brand ${collab.campaign.brandId}`);

    // Need to refetch full collaboration with relations
    const fullCollab = await prisma.campaignCollaboration.findUnique({
        where: { id: collab.id },
        include: {
            campaign: { include: { brand: true } },
            creator: { include: { creatorProfile: true } }
        }
    });

    if (action === "approved") {
        await sendCMApprovalNotice(fullCollab, collab.managedNote);
    } else {
        await sendCMRejectionNotice(fullCollab, feedback, collab.managedNote);
    }
};

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the managed approval scheduler
 * Call this from server.js on startup
 */
export const initManagedApprovalScheduler = () => {
    console.log("[ManagedApproval] Initializing Bull queues...");
    console.log(`[ManagedApproval] Redis URL: ${REDIS_URL.replace(/\/\/.*:.*@/, "//***:***@")}`);

    // Queue event listeners
    escalationQueue.on("completed", (job, result) => {
        console.log(`[ManagedApproval] Escalation job ${job.id} completed:`, result);
    });

    escalationQueue.on("failed", (job, err) => {
        console.error(`[ManagedApproval] Escalation job ${job.id} failed:`, err.message);
    });

    warningQueue.on("completed", (job, result) => {
        console.log(`[ManagedApproval] Warning job ${job.id} completed:`, result);
    });

    console.log("[ManagedApproval] Scheduler initialized successfully");
};

export default {
    setApprovalDeadline,
    escalateToManager,
    getCMPendingQueue,
    approveByCM,
    rejectByCM,
    approveByBrand,
    toggleManagedApproval,
    getCMDashboardStats,
    initManagedApprovalScheduler,
    escalationQueue,
    warningQueue
};
