/**
 * CapitalService — Handles escrow locking and capital operations.
 * All methods accept a Prisma transaction client (tx) to ensure atomicity.
 */
export class CapitalService {
    /**
     * Lock escrow funds for a campaign.
     * Creates CampaignEscrow record + Transaction ledger entry.
     * 
     * @param {import('@prisma/client').Prisma.TransactionClient} tx - Prisma transaction client
     * @param {number} campaignId
     * @param {number} amount - Amount to lock
     * @param {number} userId - Brand user ID (for transaction record)
     */
    static async lockEscrow(tx, campaignId, amount, userId) {
        if (amount <= 0) {
            throw new Error('Escrow lock amount must be positive');
        }

        // 1. Create CampaignEscrow record
        const escrow = await tx.campaignEscrow.create({
            data: {
                campaignId,
                lockedAmount: amount,
                releasedAmount: 0,
                remainingAmount: amount,
            },
        });

        // 2. Update campaign escrow balance
        await tx.campaign.update({
            where: { id: campaignId },
            data: {
                escrowBalance: amount,
                totalFunded: amount,
                escrowStatus: 'Locked',
                escrowFundedAt: new Date(),
            },
        });

        // 3. Create transaction ledger entry (LOCK)
        await tx.transaction.create({
            data: {
                userId,
                campaignId,
                amount,
                type: 'Deposit',
                status: 'Completed',
                description: `Escrow locked: $${amount.toFixed(2)} for campaign #${campaignId}`,
                transactionDate: new Date(),
            },
        });

        console.log(`[CapitalService] Escrow locked: $${amount.toFixed(2)} for campaign ${campaignId}`);

        return escrow;
    }

    /**
     * Release escrow funds (for payout operations).
     * @param {import('@prisma/client').Prisma.TransactionClient} tx
     * @param {number} campaignId
     * @param {number} amount
     * @param {number} userId
     */
    static async releaseEscrow(tx, campaignId, amount, userId) {
        const escrow = await tx.campaignEscrow.findUnique({
            where: { campaignId },
        });

        if (!escrow) {
            throw new Error('No escrow found for this campaign');
        }

        const remaining = parseFloat(escrow.remainingAmount);
        if (amount > remaining) {
            throw new Error(`Insufficient escrow balance. Available: $${remaining.toFixed(2)}, Requested: $${amount.toFixed(2)}`);
        }

        await tx.campaignEscrow.update({
            where: { campaignId },
            data: {
                releasedAmount: { increment: amount },
                remainingAmount: { decrement: amount },
            },
        });

        await tx.campaign.update({
            where: { id: campaignId },
            data: {
                escrowBalance: { decrement: amount },
                totalReleased: { increment: amount },
            },
        });

        await tx.transaction.create({
            data: {
                userId,
                campaignId,
                amount,
                type: 'Payment',
                status: 'Completed',
                description: `Escrow released: $${amount.toFixed(2)} from campaign #${campaignId}`,
                transactionDate: new Date(),
            },
        });

        console.log(`[CapitalService] Escrow released: $${amount.toFixed(2)} from campaign ${campaignId}`);
    }
}
