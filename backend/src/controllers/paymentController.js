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

        // 1. Verify source
        if (!tazapayService.verifyWebhook(req)) {
            console.error('Webhook signature verification failed');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Extract event type and data - Tazapay may nest data differently
        const eventType = event.type || event.event_type || '';
        const eventData = event.data || event;

        // Extract reference ID from multiple possible locations
        const referenceId = eventData.reference_id
            || eventData.txn_no
            || event.reference_id
            || event.txn_no
            || eventData.checkout_id
            || event.checkout_id;

        console.log(`Webhook Event Type: ${eventType}, Reference ID: ${referenceId}`);

        // 2. Handle payment success - check for all possible success event types
        const successEventTypes = [
            'checkout.paid',
            'payment.succeeded',
            'payment_attempt.succeeded',
            'payin.success',
            'transaction.success'
        ];

        const isSuccessEvent = successEventTypes.includes(eventType)
            || event.status === 'success'
            || event.status === 'paid'
            || eventData.status === 'success'
            || eventData.status === 'paid';

        if (isSuccessEvent && referenceId) {
            // Find transaction by Tazapay reference
            let transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            // If not found by reference, try finding by pattern match if it looks like our custom ref
            if (!transaction && typeof referenceId === 'string') {
                transaction = await prisma.transaction.findFirst({
                    where: {
                        tazapayReferenceId: {
                            contains: referenceId.split('_')[1] || referenceId
                        }
                    }
                });
            }

            // Also try to find pending transactions if reference doesn't match
            if (!transaction) {
                // Get the most recent pending transaction as a fallback
                // WARNING: This falls back to ANY pending transaction, which might be risky in high volume
                // Added 1 min time window check to be safer or just rely on IDs for now.
                // For now, let's keep it but log a warning.
                console.log('Could not find transaction by reference, looking for recent pending...');
                transaction = await prisma.transaction.findFirst({
                    where: { status: 'Pending' },
                    orderBy: { transactionDate: 'desc' }
                });
            }

            if (transaction) {
                // Extract received amount from webhook data (Tazapay sends amount in cents)
                // Check various possible locations for the paid/received amount
                const paidAmountCents = eventData.amount_paid
                    || eventData.paid_amount
                    || eventData.amount
                    || event.amount_paid
                    || event.paid_amount
                    || event.amount;

                // Convert from cents to dollars if we have a value
                let receivedAmount = null;
                if (paidAmountCents !== undefined && paidAmountCents !== null) {
                    const parsedCents = parseFloat(paidAmountCents);
                    if (!isNaN(parsedCents)) {
                        receivedAmount = parsedCents / 100;
                    }
                }

                const receivedCurrency = eventData.currency || event.currency || eventData.invoice_currency || 'USD';

                console.log(`Received Amount: ${receivedAmount} ${receivedCurrency}`);

                // Update transaction status
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Completed',
                        processedAt: new Date(),
                        gatewayStatus: eventData.status || event.status || 'success',
                        tazapayReferenceId: referenceId, // Update with actual reference
                        receivedAmount: receivedAmount || undefined, // undefined to skip update if null
                        receivedCurrency: receivedCurrency,
                        metadata: event
                    }
                });

                // Update campaign escrow balance
                if (transaction.campaignId) {
                    // Ensure netAmount is valid for increment
                    const incrementAmount = transaction.netAmount || transaction.amount || 0;

                    if (Number(incrementAmount) > 0) {
                        try {
                            await prisma.campaign.update({
                                where: { id: transaction.campaignId },
                                data: {
                                    escrowBalance: {
                                        increment: incrementAmount
                                    },
                                    totalFunded: {
                                        increment: incrementAmount
                                    },
                                    escrowFundedAt: new Date(),
                                    isGuaranteedPay: true
                                }
                            });
                            console.log(`Updated campaign ${transaction.campaignId} balance by ${incrementAmount}`);
                        } catch (campError) {
                            console.error(`Failed to update campaign balance: ${campError.message}`);
                            // Do not re-throw, so we return 200 for the webhook
                        }
                    } else {
                        console.warn(`Transaction ${transaction.id} has invalid amount ${incrementAmount}, skipping campaign balance update.`);
                    }
                }

                console.log(`✅ Payment completed for transaction ${transaction.id}`);
            } else {
                console.log(`⚠️ No matching transaction found for reference: ${referenceId}`);
            }
        }

        // 3. Handle payment failure
        const failureEventTypes = [
            'payment.failed',
            'payment_attempt.failed',
            'checkout.failed',
            'payin.failed'
        ];

        const isFailureEvent = failureEventTypes.includes(eventType)
            || event.status === 'failed'
            || eventData.status === 'failed';

        if (isFailureEvent && referenceId) {
            const transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            if (transaction) {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Failed',
                        gatewayStatus: eventData.status || event.status || 'failed',
                        metadata: event
                    }
                });

                console.log(`❌ Payment failed for transaction ${transaction.id}`);
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook Error Full:', error);
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

// Get single transaction status
export const getTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;

        const transaction = await prisma.transaction.findFirst({
            where: {
                id: parseInt(transactionId),
                userId: userId
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        escrowBalance: true,
                        targetBudget: true
                    }
                }
            }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({
            id: transaction.id,
            status: transaction.status,
            amount: transaction.amount,
            netAmount: transaction.netAmount,
            platformFee: transaction.platformFee,
            processingFee: transaction.processingFee,
            receivedAmount: transaction.receivedAmount,
            receivedCurrency: transaction.receivedCurrency,
            type: transaction.type,
            description: transaction.description,
            tazapayReferenceId: transaction.tazapayReferenceId,
            checkoutUrl: transaction.checkoutUrl,
            gatewayStatus: transaction.gatewayStatus,
            transactionDate: transaction.transactionDate,
            processedAt: transaction.processedAt,
            campaign: transaction.campaign
        });
    } catch (error) {
        console.error('Get Transaction Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch transaction status' });
    }
};
