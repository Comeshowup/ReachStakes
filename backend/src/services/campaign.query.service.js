import { prisma } from '../config/db.js';
import { RiskService } from './risk.service.js';

/**
 * CampaignQueryService — Read-optimized queries for campaign detail page.
 * Strict separation: no writes, no mutations.
 * Aggregates performance, capital, creators, activity, and risk data.
 */
export class CampaignQueryService {
    /**
     * Fetches full campaign detail with all aggregated panels.
     * Enforces brand scoping (returns 404 if mismatch, not 403).
     * @param {number|string} campaignId
     * @param {number} brandId - For security validation
     */
    static async getCampaignDetail(campaignId, brandId) {
        const campaignIdInt = parseInt(campaignId);

        // Single query with includes — avoids N+1
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignIdInt },
            include: {
                campaignEscrow: true,
                events: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                collaborations: {
                    include: {
                        creator: {
                            include: {
                                creatorProfile: true,
                            },
                        },
                    },
                },
                transactions: {
                    orderBy: { transactionDate: 'desc' },
                    take: 10,
                },
            },
        });

        // Brand scoping: 404 if not found or unauthorized (prevents probing)
        if (!campaign || campaign.brandId !== brandId) {
            throw new Error('Campaign not found or unauthorized');
        }

        // Aggregated analytics query (single query for performance)
        const analytics = await prisma.analyticsDaily.aggregate({
            where: { campaignId: campaignIdInt },
            _sum: {
                revenueGenerated: true,
                spendAmount: true,
                impressions: true,
                clicks: true,
            },
        });

        // Trend data for chart (daily analytics)
        const trendData = await prisma.analyticsDaily.findMany({
            where: { campaignId: campaignIdInt },
            orderBy: { recordDate: 'asc' },
            take: 30,
            select: {
                recordDate: true,
                revenueGenerated: true,
                spendAmount: true,
            },
        });

        // Compute Performance Snapshot
        const totalSpend = parseFloat(analytics._sum.spendAmount) || 0;
        const totalRevenue = parseFloat(analytics._sum.revenueGenerated) || 0;
        const totalImpressions = analytics._sum.impressions || 0;
        const totalClicks = analytics._sum.clicks || 0;
        const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';
        const conversions = totalClicks;
        const cpa = conversions > 0 ? (totalSpend / conversions).toFixed(2) : '0.00';

        // Pacing calculation
        const now = new Date();
        const start = new Date(campaign.startDate || campaign.createdAt);
        const end = new Date(campaign.endDate || now);
        const totalDuration = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
        const elapsed = Math.max(0, Math.min(totalDuration, (now - start) / (1000 * 60 * 60 * 24)));
        const expectedPacing = (elapsed / totalDuration) * 100;
        const targetBudget = parseFloat(campaign.targetBudget) || 1;
        const actualPacing = (totalSpend / targetBudget) * 100;

        const escrowRemaining = campaign.campaignEscrow
            ? parseFloat(campaign.campaignEscrow.remainingAmount) || 0
            : 0;

        const performanceSnapshot = {
            spend: totalSpend,
            revenue: totalRevenue,
            roas,
            cpa,
            conversions,
            impressions: totalImpressions,
            pacing: Math.round(actualPacing),
            escrowRemaining,
            trend: trendData.map((d) => ({
                date: d.recordDate,
                revenue: parseFloat(d.revenueGenerated) || 0,
                spend: parseFloat(d.spendAmount) || 0,
            })),
        };

        // Capital Intelligence
        const escrowLocked = campaign.campaignEscrow
            ? parseFloat(campaign.campaignEscrow.lockedAmount) || 0
            : 0;
        const budgetSpent = totalSpend;
        const dailyBurnRate = elapsed > 0 ? budgetSpent / elapsed : 0;
        const runway = dailyBurnRate > 0 ? Math.round((targetBudget - budgetSpent) / dailyBurnRate) : 999;
        const forecastedSpend = dailyBurnRate * totalDuration;

        // Reallocation suggestion
        let reallocationSuggestion = null;
        if (actualPacing > expectedPacing * 1.2) {
            reallocationSuggestion = {
                type: 'warning',
                message: 'Spending is ahead of schedule. Consider pausing underperformers.',
                amount: Math.round((actualPacing - expectedPacing) / 100 * targetBudget),
            };
        } else if (actualPacing < expectedPacing * 0.5 && elapsed > 3) {
            reallocationSuggestion = {
                type: 'opportunity',
                message: 'Budget is under-utilized. Consider scaling top creators.',
                amount: Math.round((expectedPacing - actualPacing) / 100 * targetBudget),
            };
        }

        const capitalIntelligence = {
            budgetAllocated: targetBudget,
            budgetSpent,
            escrowLocked,
            escrowRemaining,
            runway: Math.min(runway, 999),
            forecastedSpend: Math.round(forecastedSpend),
            reallocationSuggestion,
            escrowEfficiency: escrowLocked > 0
                ? Math.round((escrowRemaining / escrowLocked) * 100)
                : 100,
        };

        // Creators with performance data
        const creators = campaign.collaborations.map((collab) => ({
            id: collab.id,
            name: collab.creator?.creatorProfile?.fullName || collab.creator?.name || 'Unknown',
            handle: collab.creator?.creatorProfile?.handle || '',
            content: collab.deliverableVersion || 0,
            spend: parseFloat(collab.agreedPrice) || 0,
            revenue: parseFloat(collab.estimatedEmv) || 0,
            roas: (parseFloat(collab.agreedPrice) || 0) > 0
                ? ((parseFloat(collab.estimatedEmv) || 0) / (parseFloat(collab.agreedPrice) || 1)).toFixed(1)
                : '0.0',
            cpa: 0,
            status: collab.status || 'Applied',
        }));

        // Activity Feed
        const activityFeed = campaign.events.map((event) => ({
            id: event.id,
            type: event.type,
            description: event.description || event.type,
            timestamp: event.createdAt,
            metadata: event.metadata,
            createdBy: event.createdBy,
        }));

        // Risk flags
        const riskScore = campaign.riskScoreCached || 0;
        const riskFlags = [];
        if (actualPacing > expectedPacing * 1.5) {
            riskFlags.push({ type: 'PACING', message: 'Campaign spending is significantly ahead of schedule', severity: 'high' });
        }
        if (escrowRemaining < escrowLocked * 0.2 && escrowLocked > 0) {
            riskFlags.push({ type: 'ESCROW', message: 'Escrow reserves are running low', severity: 'high' });
        }
        if (parseFloat(roas) < parseFloat(campaign.targetRoas) * 0.5 && totalSpend > 0) {
            riskFlags.push({ type: 'ROAS', message: 'ROAS is significantly below target', severity: 'medium' });
        }

        return {
            campaign: {
                id: campaign.id,
                title: campaign.title,
                objective: campaign.objective,
                status: campaign.status,
                targetBudget: campaign.targetBudget,
                targetRoas: campaign.targetRoas,
                startDate: campaign.startDate,
                endDate: campaign.endDate,
                paymentModel: campaign.paymentModel,
                escrowPercentage: campaign.escrowPercentage,
                riskScoreCached: campaign.riskScoreCached,
                createdAt: campaign.createdAt,
            },
            performance_snapshot: performanceSnapshot,
            capital_intelligence: capitalIntelligence,
            creators,
            activity_feed: activityFeed,
            risk_flags: riskFlags,
            risk_level: RiskService.getRiskLevel(riskScore),
        };
    }
}
