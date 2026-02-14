/**
 * Decision Engine
 * Proactive intelligence layer for the Brand Dashboard
 * 
 * Responsibilities:
 * - Pacing detection (underspend/overspend alerts)
 * - Budget risk analysis
 * - Anomaly detection
 * - Insight generation
 * - Alert prioritization
 */

// Alert severity levels
export const AlertSeverity = {
    CRITICAL: 'critical',   // Immediate action required
    WARNING: 'warning',     // Needs attention soon
    INFO: 'info',           // Informational only
    SUCCESS: 'success'      // Positive update
};

// Alert types
export const AlertType = {
    PACING_UNDERSPEND: 'pacing_underspend',
    PACING_OVERSPEND: 'pacing_overspend',
    BUDGET_LOW: 'budget_low',
    BUDGET_DEPLETED: 'budget_depleted',
    APPROVAL_PENDING: 'approval_pending',
    CAMPAIGN_AT_RISK: 'campaign_at_risk',
    ROI_DECLINING: 'roi_declining',
    ROI_IMPROVING: 'roi_improving',
    CREATOR_INACTIVE: 'creator_inactive',
    MILESTONE_REACHED: 'milestone_reached'
};

/**
 * Calculate campaign pacing status
 * @param {Object} campaign - Campaign with dates and budget
 * @returns {Object} Pacing analysis
 */
export const analyzeCampaignPacing = (campaign) => {
    if (!campaign.startDate || !campaign.endDate || !campaign.budget) {
        return { status: 'Unknown', percentage: 0, alert: null };
    }

    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);

    // Calculate time elapsed percentage
    const totalDuration = end - start;
    const elapsed = now - start;
    const timePercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

    // Get budget spent percentage
    const budgetPercent = campaign.budget?.percentUsed || 0;

    // Calculate pacing difference
    const pacingDiff = budgetPercent - timePercent;

    // Determine status and create alert
    if (Math.abs(pacingDiff) <= 10) {
        return {
            status: 'On Track',
            percentage: budgetPercent,
            timePercent,
            pacingDiff,
            alert: null
        };
    }

    if (pacingDiff > 10) {
        // Overspending
        const severity = pacingDiff > 25 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;
        return {
            status: 'Overspending',
            percentage: budgetPercent,
            timePercent,
            pacingDiff,
            alert: createAlert({
                type: AlertType.PACING_OVERSPEND,
                severity,
                title: `${campaign.title} overspending`,
                message: `${pacingDiff.toFixed(0)}% ahead of schedule`,
                campaignId: campaign.id,
                metric: pacingDiff
            })
        };
    }

    // Underspending
    const severity = pacingDiff < -25 ? AlertSeverity.WARNING : AlertSeverity.INFO;
    return {
        status: 'Underspending',
        percentage: budgetPercent,
        timePercent,
        pacingDiff,
        alert: createAlert({
            type: AlertType.PACING_UNDERSPEND,
            severity,
            title: `${campaign.title} underspending`,
            message: `${Math.abs(pacingDiff).toFixed(0)}% behind schedule`,
            campaignId: campaign.id,
            metric: pacingDiff
        })
    };
};

/**
 * Analyze budget health across all campaigns
 * @param {Object} escrow - Escrow balance data
 * @param {Array} campaigns - Active campaigns
 * @returns {Object} Budget health analysis
 */
export const analyzeBudgetHealth = (escrow, campaigns) => {
    const alerts = [];

    // Check available balance
    const available = escrow?.available || 0;
    const locked = escrow?.locked || 0;
    const totalCommitted = campaigns?.reduce((sum, c) => sum + (c.budget?.total || 0), 0) || 0;

    // Low balance warning (less than 20% of committed available)
    if (available < totalCommitted * 0.2 && totalCommitted > 0) {
        alerts.push(createAlert({
            type: AlertType.BUDGET_LOW,
            severity: available < totalCommitted * 0.1 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
            title: 'Low available balance',
            message: `Only $${available.toLocaleString()} available for $${totalCommitted.toLocaleString()} committed`,
            metric: (available / totalCommitted) * 100
        }));
    }

    // Check for depleted campaign budgets
    campaigns?.forEach(campaign => {
        const percentUsed = campaign.budget?.percentUsed || 0;
        if (percentUsed >= 100) {
            alerts.push(createAlert({
                type: AlertType.BUDGET_DEPLETED,
                severity: AlertSeverity.CRITICAL,
                title: `${campaign.title} budget depleted`,
                message: 'Campaign has used 100% of allocated budget',
                campaignId: campaign.id,
                metric: percentUsed
            }));
        } else if (percentUsed >= 90) {
            alerts.push(createAlert({
                type: AlertType.BUDGET_LOW,
                severity: AlertSeverity.WARNING,
                title: `${campaign.title} budget low`,
                message: `${(100 - percentUsed).toFixed(0)}% budget remaining`,
                campaignId: campaign.id,
                metric: percentUsed
            }));
        }
    });

    return {
        available,
        locked,
        totalCommitted,
        healthScore: available > 0 ? Math.min(100, (available / totalCommitted) * 100) : 0,
        alerts
    };
};

/**
 * Analyze ROI trends
 * @param {Object} metrics - Performance metrics
 * @param {Object} previousMetrics - Previous period metrics (optional)
 * @returns {Object} ROI analysis
 */
export const analyzeROITrends = (metrics, previousMetrics = null) => {
    const currentROI = metrics?.overallROI?.value || 0;
    const previousROI = previousMetrics?.overallROI?.value || currentROI;

    const change = currentROI - previousROI;
    const changePercent = previousROI !== 0 ? (change / previousROI) * 100 : 0;

    let alert = null;

    if (changePercent <= -20) {
        alert = createAlert({
            type: AlertType.ROI_DECLINING,
            severity: AlertSeverity.WARNING,
            title: 'ROI declining significantly',
            message: `Down ${Math.abs(changePercent).toFixed(0)}% from previous period`,
            metric: changePercent
        });
    } else if (changePercent >= 20) {
        alert = createAlert({
            type: AlertType.ROI_IMPROVING,
            severity: AlertSeverity.SUCCESS,
            title: 'ROI improving',
            message: `Up ${changePercent.toFixed(0)}% from previous period`,
            metric: changePercent
        });
    }

    return {
        current: currentROI,
        previous: previousROI,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        alert
    };
};

/**
 * Detect anomalies across campaigns
 * @param {Array} campaigns - All campaigns
 * @returns {Array} Detected anomalies
 */
export const detectAnomalies = (campaigns) => {
    if (!campaigns || campaigns.length === 0) return [];

    const anomalies = [];

    campaigns.forEach(campaign => {
        // Check for pacing issues
        const pacing = analyzeCampaignPacing(campaign);
        if (pacing.alert) {
            anomalies.push(pacing.alert);
        }

        // Check for inactive creators
        if (campaign.status === 'Active' && (campaign.creatorCount || 0) === 0) {
            anomalies.push(createAlert({
                type: AlertType.CREATOR_INACTIVE,
                severity: AlertSeverity.WARNING,
                title: `${campaign.title} has no creators`,
                message: 'Active campaign without assigned creators',
                campaignId: campaign.id
            }));
        }

        // Check for at-risk status
        if (campaign.isAtRisk) {
            anomalies.push(createAlert({
                type: AlertType.CAMPAIGN_AT_RISK,
                severity: AlertSeverity.CRITICAL,
                title: `${campaign.title} at risk`,
                message: campaign.riskReason || 'Campaign requires attention',
                campaignId: campaign.id
            }));
        }
    });

    return anomalies;
};

/**
 * Generate proactive insights
 * @param {Object} data - Dashboard data
 * @returns {Array} Insights
 */
export const generateInsights = (data) => {
    const insights = [];
    const { metrics, campaigns, escrow, approvals } = data;

    // Pending approvals insight
    const pendingCount = approvals?.totalPending || 0;
    if (pendingCount > 0) {
        insights.push({
            type: 'action',
            priority: 1,
            title: `${pendingCount} content awaiting review`,
            message: pendingCount > 5
                ? 'Consider batch reviewing to unblock creators'
                : 'Review to maintain campaign momentum',
            action: { label: 'Review Now', route: '/brand/approvals' }
        });
    }

    // High ROI insight
    const roi = metrics?.overallROI?.value || 0;
    if (roi > 3) {
        insights.push({
            type: 'success',
            priority: 2,
            title: `Exceptional ${roi.toFixed(1)}x ROAS`,
            message: 'Consider scaling top-performing campaigns',
            action: { label: 'View Performance', route: '/brand/analytics' }
        });
    }

    // Budget optimization insight
    const activeCampaigns = campaigns?.filter(c => c.status === 'Active') || [];
    const underspending = activeCampaigns.filter(c =>
        analyzeCampaignPacing(c).status === 'Underspending'
    );

    if (underspending.length > 0) {
        insights.push({
            type: 'optimization',
            priority: 3,
            title: `${underspending.length} campaign${underspending.length > 1 ? 's' : ''} underspending`,
            message: 'Reallocate budget to maximize reach',
            campaignIds: underspending.map(c => c.id)
        });
    }

    // Escrow balance insight
    const available = escrow?.available || 0;
    if (available > 10000) {
        insights.push({
            type: 'opportunity',
            priority: 4,
            title: `$${available.toLocaleString()} available`,
            message: 'Launch new campaigns to grow your creator network',
            action: { label: 'Create Campaign', route: '/brand/campaigns/new' }
        });
    }

    return insights.sort((a, b) => a.priority - b.priority);
};

/**
 * Create a standardized alert object
 */
const createAlert = ({ type, severity, title, message, campaignId = null, metric = null }) => ({
    id: `${type}-${campaignId || 'global'}-${Date.now()}`,
    type,
    severity,
    title,
    message,
    campaignId,
    metric,
    timestamp: new Date().toISOString(),
    dismissed: false
});

/**
 * Get all decision engine data
 * Hook-friendly aggregation function
 */
export const getDecisionEngineData = (data) => {
    const { metrics, campaigns, escrow, approvals } = data;

    // Analyze all aspects
    const budgetHealth = analyzeBudgetHealth(escrow, campaigns);
    const roiTrends = analyzeROITrends(metrics);
    const anomalies = detectAnomalies(campaigns);
    const insights = generateInsights(data);

    // Aggregate all alerts
    const allAlerts = [
        ...budgetHealth.alerts,
        roiTrends.alert,
        ...anomalies
    ].filter(Boolean);

    // Sort by severity
    const severityOrder = {
        [AlertSeverity.CRITICAL]: 0,
        [AlertSeverity.WARNING]: 1,
        [AlertSeverity.INFO]: 2,
        [AlertSeverity.SUCCESS]: 3
    };

    const sortedAlerts = allAlerts.sort((a, b) =>
        severityOrder[a.severity] - severityOrder[b.severity]
    );

    return {
        alerts: sortedAlerts,
        criticalCount: sortedAlerts.filter(a => a.severity === AlertSeverity.CRITICAL).length,
        warningCount: sortedAlerts.filter(a => a.severity === AlertSeverity.WARNING).length,
        budgetHealth,
        roiTrends,
        insights,
        hasUrgentItems: sortedAlerts.some(a => a.severity === AlertSeverity.CRITICAL)
    };
};

export default {
    AlertSeverity,
    AlertType,
    analyzeCampaignPacing,
    analyzeBudgetHealth,
    analyzeROITrends,
    detectAnomalies,
    generateInsights,
    getDecisionEngineData
};
