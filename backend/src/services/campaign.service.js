import { prisma } from '../config/db.js';
import { CapitalService } from './capital.service.js';
import { RiskService } from './risk.service.js';

/**
 * CampaignService — Handles campaign creation with financial safety guarantees.
 * All write operations are wrapped in Prisma transactions.
 */
export class CampaignService {
    /**
     * Creates a campaign atomically:
     * 1. Compute risk score
     * 2. Create Campaign record
     * 3. Create CampaignEscrow
     * 4. Create Transaction (LOCK ledger entry)
     * 5. Create CampaignEvent (audit log)
     * 
     * If ANY step fails, the entire operation rolls back.
     */
    static async createCampaign(userId, campaignData) {
        // Pre-compute risk score (stateless, safe before transaction)
        const riskScore = await RiskService.computeRisk(campaignData);
        const budgetAmount = parseFloat(campaignData.totalBudget);
        const escrowPct = parseFloat(campaignData.escrowPercentage);
        const amountToLock = budgetAmount * (escrowPct / 100);

        return await prisma.$transaction(async (tx) => {
            // 1. Create Campaign record
            const campaign = await tx.campaign.create({
                data: {
                    brandId: userId,
                    title: campaignData.title.trim(),
                    objective: campaignData.objective.toLowerCase(),
                    targetRoas: campaignData.targetRoas,
                    targetBudget: budgetAmount,
                    escrowPercentage: escrowPct,
                    paymentModel: campaignData.paymentModel || 'cpa',
                    creatorFilters: campaignData.creatorFilters || {},
                    startDate: new Date(campaignData.startDate),
                    endDate: new Date(campaignData.endDate),
                    autoPauseThreshold: campaignData.autoPauseThreshold || 0,
                    riskScoreCached: riskScore,
                    status: 'Active',
                },
            });

            // 2. Lock escrow funds (creates CampaignEscrow + Transaction + updates Campaign)
            if (amountToLock > 0) {
                await CapitalService.lockEscrow(tx, campaign.id, amountToLock, userId);
            }

            // 3. Audit event
            await tx.campaignEvent.create({
                data: {
                    campaignId: campaign.id,
                    type: 'CREATED',
                    description: `Campaign "${campaign.title}" created with ${escrowPct}% escrow locked ($${amountToLock.toFixed(2)})`,
                    createdBy: userId,
                    metadata: {
                        riskScore,
                        initialLock: amountToLock,
                        objective: campaign.objective,
                        budget: budgetAmount,
                    },
                },
            });

            return {
                campaignId: campaign.id,
                escrowLocked: amountToLock,
                status: campaign.status,
            };
        });
    }
}
