import { tazapayService } from '../services/tazapayService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fee Constants
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

// Calculate fees for a given amount
export const calculateFees = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const amountNum = parseFloat(amount);
        const platformFee = amountNum * (PLATFORM_FEE_PERCENT / 100);
        const processingFee = amountNum * (PROCESSING_FEE_PERCENT / 100);
        const total = amountNum + platformFee + processingFee;

        res.json({
            amount: amountNum,
            platformFee: parseFloat(platformFee.toFixed(2)),
            processingFee: parseFloat(processingFee.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            platformFeePercent: PLATFORM_FEE_PERCENT,
            processingFeePercent: PROCESSING_FEE_PERCENT
        });
    } catch (error) {
        console.error('Calculate Fees Error:', error);
        res.status(500).json({ error: 'Failed to calculate fees' });
    }
};

// Get escrow details for a campaign
export const getEscrowDetails = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const userId = req.user.id;

        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) },
            select: {
                id: true,
                title: true,
                targetBudget: true,
                escrowBalance: true,
                totalFunded: true,
                totalReleased: true,
                escrowStatus: true,
                isGuaranteedPay: true,
                brandId: true
            }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Verify ownership
        if (campaign.brandId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        res.json({
            ...campaign,
            fundingProgress: campaign.targetBudget > 0
                ? Math.round((parseFloat(campaign.escrowBalance) / parseFloat(campaign.targetBudget)) * 100)
                : 0
        });
    } catch (error) {
        console.error('Get Escrow Details Error:', error);
        res.status(500).json({ error: 'Failed to fetch escrow details' });
    }
};

export const initiatePayment = async (req, res) => {
    try {
        const { campaignId, amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        // 1. Fetch Campaign and Brand details
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) },
            include: { brand: true }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Verify ownership
        if (campaign.brandId !== userId) {
            return res.status(403).json({ error: 'Not authorized to fund this campaign' });
        }

        // Calculate fees
        const amountNum = parseFloat(amount);
        const platformFee = amountNum * (PLATFORM_FEE_PERCENT / 100);
        const processingFee = amountNum * (PROCESSING_FEE_PERCENT / 100);
        const totalCharge = amountNum + platformFee + processingFee;

        // 2. Create pending transaction record
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                campaignId: campaign.id,
                amount: amountNum,
                type: 'Deposit',
                status: 'Pending',
                description: `Campaign Funding: ${campaign.title}`,
                platformFee: platformFee,
                processingFee: processingFee,
                netAmount: amountNum
            }
        });

        // 3. Create Checkout Session with Tazapay
        const checkout = await tazapayService.createCheckoutSession({
            amount: totalCharge, // Total including fees
            invoice_currency: 'USD',
            customer_details: {
                name: campaign.brand.name,
                email: campaign.brand.email,
                country: 'US',
            },
            txn_description: `Funding Campaign: ${campaign.title} (Ref: TXN-${transaction.id})`,
        });

        // 4. Update transaction with Tazapay reference
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                tazapayReferenceId: checkout.data?.txn_no || checkout.txn_no || `ref_${Date.now()}`,
                checkoutUrl: checkout.data?.url || checkout.url
            }
        });

        res.status(200).json({
            message: 'Checkout initiated',
            url: checkout.data?.url || checkout.url,
            transactionId: transaction.id
        });

    } catch (error) {
        console.error('Initiate Payment Error:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('Tazapay Webhook Event:', JSON.stringify(event, null, 2));

        // 1. Verify source (in production, implement proper signature verification)
        if (!tazapayService.verifyWebhook(req)) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // 2. Handle payment success
        if (event.type === 'payment.succeeded' || event.status === 'success') {
            const referenceId = event.txn_no || event.reference_id;

            // Find transaction by Tazapay reference
            const transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            if (transaction) {
                // Update transaction status
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Completed',
                        processedAt: new Date(),
                        gatewayStatus: event.status || 'success',
                        metadata: event
                    }
                });

                // Update campaign escrow balance
                if (transaction.campaignId) {
                    await prisma.campaign.update({
                        where: { id: transaction.campaignId },
                        data: {
                            escrowBalance: {
                                increment: transaction.netAmount
                            },
                            totalFunded: {
                                increment: transaction.netAmount
                            },
                            escrowFundedAt: new Date(),
                            isGuaranteedPay: true
                        }
                    });
                }

                console.log(`Payment completed for transaction ${transaction.id}`);
            }
        }

        // 3. Handle payment failure
        if (event.type === 'payment.failed' || event.status === 'failed') {
            const referenceId = event.txn_no || event.reference_id;

            const transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            if (transaction) {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Failed',
                        gatewayStatus: event.status || 'failed',
                        metadata: event
                    }
                });

                console.log(`Payment failed for transaction ${transaction.id}`);
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// Get transaction history for a campaign or user
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { campaignId } = req.query;

        const where = { userId };
        if (campaignId) {
            where.campaignId = parseInt(campaignId);
        }

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { transactionDate: 'desc' },
            include: {
                campaign: {
                    select: { title: true }
                }
            },
            take: 50
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get Transaction History Error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};
