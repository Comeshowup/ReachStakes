import { tazapayService, TazapayError } from '../services/tazapayService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fee Constants
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

// Amount limits
const MIN_AMOUNT = 1;      // $1 minimum
const MAX_AMOUNT = 50000;  // $50,000 maximum

/**
 * Send a structured error response
 */
const sendError = (res, statusCode, error, code = 'UNKNOWN', details = null) => {
    return res.status(statusCode).json({
        error: typeof error === 'string' ? error : error.message,
        code,
        ...(details && process.env.NODE_ENV !== 'production' ? { details } : {})
    });
};

// Calculate fees for a given amount
export const calculateFees = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return sendError(res, 400, 'Valid amount is required', 'INVALID_AMOUNT');
        }

        const amountNum = parseFloat(amount);

        if (amountNum < MIN_AMOUNT) {
            return sendError(res, 400, `Minimum amount is $${MIN_AMOUNT}`, 'AMOUNT_TOO_LOW');
        }
        if (amountNum > MAX_AMOUNT) {
            return sendError(res, 400, `Maximum amount is $${MAX_AMOUNT.toLocaleString()}`, 'AMOUNT_TOO_HIGH');
        }

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
        sendError(res, 500, 'Failed to calculate fees', 'INTERNAL');
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
                id: true, title: true, targetBudget: true,
                escrowBalance: true, totalFunded: true, totalReleased: true,
                escrowStatus: true, isGuaranteedPay: true, brandId: true
            }
        });

        if (!campaign) {
            return sendError(res, 404, 'Campaign not found', 'NOT_FOUND');
        }
        if (campaign.brandId !== userId) {
            return sendError(res, 403, 'Not authorized', 'FORBIDDEN');
        }

        res.json({
            ...campaign,
            fundingProgress: campaign.targetBudget > 0
                ? Math.round((parseFloat(campaign.escrowBalance) / parseFloat(campaign.targetBudget)) * 100)
                : 0
        });
    } catch (error) {
        console.error('Get Escrow Details Error:', error);
        sendError(res, 500, 'Failed to fetch escrow details', 'INTERNAL');
    }
};

export const initiatePayment = async (req, res) => {
    try {
        const { campaignId, amount } = req.body;
        const userId = req.user.id;

        // ── Validation ──────────────────────────
        if (!campaignId) {
            return sendError(res, 400, 'Campaign ID is required', 'MISSING_CAMPAIGN_ID');
        }

        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            return sendError(res, 400, 'Valid amount is required', 'INVALID_AMOUNT');
        }
        if (amountNum < MIN_AMOUNT) {
            return sendError(res, 400, `Minimum funding amount is $${MIN_AMOUNT}`, 'AMOUNT_TOO_LOW');
        }
        if (amountNum > MAX_AMOUNT) {
            return sendError(res, 400, `Maximum funding amount is $${MAX_AMOUNT.toLocaleString()}`, 'AMOUNT_TOO_HIGH');
        }

        // ── Fetch Campaign ──────────────────────
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) },
            include: { brand: true }
        });

        if (!campaign) {
            return sendError(res, 404, 'Campaign not found', 'NOT_FOUND');
        }
        if (campaign.brandId !== userId) {
            return sendError(res, 403, 'Not authorized to fund this campaign', 'FORBIDDEN');
        }

        // ── Idempotency: Check for existing pending transaction ──
        const existingPending = await prisma.transaction.findFirst({
            where: {
                userId,
                campaignId: campaign.id,
                status: 'Pending',
                // Only reuse if created within last 30 minutes
                transactionDate: { gte: new Date(Date.now() - 30 * 60 * 1000) }
            },
            orderBy: { transactionDate: 'desc' }
        });

        if (existingPending && existingPending.checkoutUrl) {
            // Return existing checkout URL if amount matches
            const existingAmount = parseFloat(existingPending.amount);
            if (Math.abs(existingAmount - amountNum) < 0.01) {
                console.log(`Reusing existing pending transaction ${existingPending.id} for campaign ${campaign.id}`);
                return res.status(200).json({
                    message: 'Checkout session resumed',
                    url: existingPending.checkoutUrl,
                    transactionId: existingPending.id
                });
            }
            // Different amount — mark old one as Failed before creating new
            await prisma.transaction.update({
                where: { id: existingPending.id },
                data: { status: 'Failed', gatewayStatus: 'superseded' }
            });
        }

        // ── Calculate Fees ──────────────────────
        const platformFee = amountNum * (PLATFORM_FEE_PERCENT / 100);
        const processingFee = amountNum * (PROCESSING_FEE_PERCENT / 100);
        const totalCharge = amountNum + platformFee + processingFee;

        // ── Create Pending Transaction ──────────
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                campaignId: campaign.id,
                amount: amountNum,
                type: 'Deposit',
                status: 'Pending',
                description: `Campaign Funding: ${campaign.title}`,
                platformFee,
                processingFee,
                netAmount: amountNum
            }
        });

        // ── Create Tazapay Checkout Session ─────
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const checkout = await tazapayService.createCheckoutSession({
            amount: totalCharge,
            invoice_currency: 'USD',
            customer_details: {
                name: campaign.brand.name,
                email: campaign.brand.email,
                country: 'US',
            },
            txn_description: `Funding Campaign: ${campaign.title} (Ref: TXN-${transaction.id})`,
            success_url: `${frontendUrl}/brand/payment/${transaction.id}?status=success`,
            cancel_url: `${frontendUrl}/brand/payment/${transaction.id}?status=cancelled`,
        });

        // ── Extract checkout URL and ID ─────────
        const checkoutData = checkout?.data || checkout;
        const checkoutId = checkoutData?.id || checkoutData?.checkout_id || checkoutData?.txn_no || `ref_${Date.now()}`;
        const checkoutUrl = checkoutData?.url || checkoutData?.checkout_url || checkout?.url;

        console.log('Tazapay Checkout Created:', { checkoutId, hasUrl: !!checkoutUrl, transactionId: transaction.id });

        if (!checkoutUrl) {
            console.error('Tazapay response missing checkout URL:', JSON.stringify(checkout, null, 2));
            // Mark transaction as failed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'Failed', gatewayStatus: 'no_checkout_url', metadata: checkout }
            });
            return sendError(res, 502, 'Payment service did not return a checkout page. Please try again.', 'NO_CHECKOUT_URL');
        }

        // ── Update transaction with Tazapay reference ──
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                tazapayReferenceId: checkoutId,
                checkoutUrl: checkoutUrl
            }
        });

        res.status(200).json({
            message: 'Checkout initiated',
            url: checkoutUrl,
            transactionId: transaction.id
        });

    } catch (error) {
        console.error('Initiate Payment Error:', error);

        if (error instanceof TazapayError) {
            return sendError(res, error.statusCode, error.message, error.code, error.details);
        }

        sendError(res, 500, 'Failed to initiate payment. Please try again.', 'INTERNAL');
    }
};

// Verify payment status by checking Tazapay API directly
export const verifyPayment = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;

        const transaction = await prisma.transaction.findFirst({
            where: {
                id: parseInt(transactionId),
                userId
            }
        });

        if (!transaction) {
            return sendError(res, 404, 'Transaction not found', 'NOT_FOUND');
        }

        // If already completed or failed, return current status
        if (transaction.status === 'Completed') {
            return res.json({ status: 'Completed', message: 'Payment already confirmed' });
        }
        if (transaction.status === 'Failed') {
            return res.json({ status: 'Failed', message: 'Payment was not successful' });
        }

        const referenceId = transaction.tazapayReferenceId;
        if (!referenceId) {
            return res.json({ status: 'Pending', message: 'Payment is being initialized' });
        }

        // ── Check with Tazapay API ──────────────
        let tazapayStatus;
        try {
            tazapayStatus = await tazapayService.getCheckoutStatus(referenceId);
            console.log('Tazapay Verification Response:', JSON.stringify({
                id: tazapayStatus?.data?.id,
                status: tazapayStatus?.data?.status,
                payment_status: tazapayStatus?.data?.payment_status
            }));
        } catch (err) {
            console.error('Verification API call failed:', err.message);
            return res.json({ status: 'Pending', message: 'Verification in progress, please wait...' });
        }

        // ── Determine payment status ────────────
        const checkoutData = tazapayStatus?.data || tazapayStatus;
        const paymentStatus = (checkoutData?.payment_status || '').toLowerCase();
        const checkoutStatus = (checkoutData?.status || '').toLowerCase();
        const latestAttempt = checkoutData?.payment_attempts?.[0];
        const attemptStatus = (latestAttempt?.status || '').toLowerCase();

        const isPaid = ['paid', 'success', 'completed', 'payment_completed'].includes(paymentStatus)
            || attemptStatus === 'succeeded';

        const isFailed = ['failed', 'expired', 'cancelled', 'canceled'].includes(paymentStatus)
            || ['failed', 'expired'].includes(checkoutStatus)
            || attemptStatus === 'failed';

        if (isPaid) {
            // ── Payment Confirmed ───────────────
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'Completed',
                    processedAt: new Date(),
                    gatewayStatus: paymentStatus || 'paid',
                    metadata: tazapayStatus
                }
            });

            // Update campaign escrow balance
            if (transaction.campaignId) {
                const incrementAmount = transaction.netAmount || transaction.amount || 0;
                if (Number(incrementAmount) > 0) {
                    try {
                        await prisma.campaign.update({
                            where: { id: transaction.campaignId },
                            data: {
                                escrowBalance: { increment: incrementAmount },
                                totalFunded: { increment: incrementAmount },
                                escrowFundedAt: new Date(),
                                isGuaranteedPay: true
                            }
                        });
                        console.log(`✅ Campaign ${transaction.campaignId} funded: +$${incrementAmount}`);
                    } catch (campError) {
                        console.error(`Failed to update campaign balance: ${campError.message}`);
                    }
                }
            }

            return res.json({ status: 'Completed', message: 'Payment verified and confirmed!' });

        } else if (isFailed) {
            // ── Payment Failed ──────────────────
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'Failed',
                    gatewayStatus: paymentStatus || checkoutStatus || 'failed',
                    metadata: tazapayStatus
                }
            });
            return res.json({ status: 'Failed', message: `Payment ${paymentStatus || 'was not completed'}` });
        }

        // ── Still Pending ───────────────────────
        return res.json({
            status: 'Pending',
            message: paymentStatus
                ? `Payment status: ${paymentStatus}`
                : 'Waiting for payment to be completed...'
        });

    } catch (error) {
        console.error('Verify Payment Error:', error);
        if (error instanceof TazapayError) {
            return sendError(res, error.statusCode, error.message, error.code);
        }
        sendError(res, 500, 'Failed to verify payment', 'INTERNAL');
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('Tazapay Webhook Event:', JSON.stringify(event, null, 2));

        // ── Verify Signature ────────────────────
        if (!tazapayService.verifyWebhook(req)) {
            console.error('Webhook signature verification failed');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // ── Extract event data ──────────────────
        const eventType = event.type || event.event_type || '';
        const eventData = event.data || event;

        const referenceId = eventData.reference_id
            || eventData.txn_no
            || event.reference_id
            || event.txn_no
            || eventData.checkout_id
            || event.checkout_id;

        console.log(`Webhook: type=${eventType}, reference=${referenceId}`);

        // ── Handle Payment Success ──────────────
        const successEventTypes = [
            'checkout.paid', 'payment.succeeded', 'payment_attempt.succeeded',
            'payin.success', 'transaction.success'
        ];

        const isSuccessEvent = successEventTypes.includes(eventType)
            || event.status === 'success' || event.status === 'paid'
            || eventData.status === 'success' || eventData.status === 'paid';

        if (isSuccessEvent && referenceId) {
            let transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            if (!transaction && typeof referenceId === 'string') {
                transaction = await prisma.transaction.findFirst({
                    where: {
                        tazapayReferenceId: { contains: referenceId.split('_')[1] || referenceId }
                    }
                });
            }

            if (transaction) {
                // Don't process if already completed (idempotent)
                if (transaction.status === 'Completed') {
                    console.log(`Webhook: Transaction ${transaction.id} already completed, skipping`);
                    return res.status(200).json({ received: true });
                }

                const paidAmountCents = eventData.amount_paid || eventData.paid_amount
                    || eventData.amount || event.amount_paid || event.paid_amount || event.amount;

                let receivedAmount = null;
                if (paidAmountCents !== undefined && paidAmountCents !== null) {
                    const parsedCents = parseFloat(paidAmountCents);
                    if (!isNaN(parsedCents)) {
                        receivedAmount = parsedCents / 100;
                    }
                }

                const receivedCurrency = eventData.currency || event.currency || eventData.invoice_currency || 'USD';

                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Completed',
                        processedAt: new Date(),
                        gatewayStatus: eventData.status || event.status || 'success',
                        tazapayReferenceId: referenceId,
                        receivedAmount: receivedAmount || undefined,
                        receivedCurrency,
                        metadata: event
                    }
                });

                if (transaction.campaignId) {
                    const incrementAmount = transaction.netAmount || transaction.amount || 0;
                    if (Number(incrementAmount) > 0) {
                        try {
                            await prisma.campaign.update({
                                where: { id: transaction.campaignId },
                                data: {
                                    escrowBalance: { increment: incrementAmount },
                                    totalFunded: { increment: incrementAmount },
                                    escrowFundedAt: new Date(),
                                    isGuaranteedPay: true
                                }
                            });
                            console.log(`✅ Webhook: Campaign ${transaction.campaignId} funded +$${incrementAmount}`);
                        } catch (campError) {
                            console.error(`Webhook: Failed to update campaign: ${campError.message}`);
                        }
                    }
                }

                console.log(`✅ Webhook: Transaction ${transaction.id} completed`);
            } else {
                console.warn(`⚠️ Webhook: No transaction found for reference ${referenceId}`);
            }
        }

        // ── Handle Payment Failure ──────────────
        const failureEventTypes = [
            'payment.failed', 'payment_attempt.failed', 'checkout.failed', 'payin.failed'
        ];

        const isFailureEvent = failureEventTypes.includes(eventType)
            || event.status === 'failed' || eventData.status === 'failed';

        if (isFailureEvent && referenceId) {
            const transaction = await prisma.transaction.findFirst({
                where: { tazapayReferenceId: referenceId }
            });

            if (transaction && transaction.status !== 'Completed') {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'Failed',
                        gatewayStatus: eventData.status || event.status || 'failed',
                        metadata: event
                    }
                });
                console.log(`❌ Webhook: Transaction ${transaction.id} failed`);
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        // Always return 200 for webhooks to prevent retries on processing errors
        res.status(200).json({ received: true, error: 'Processing error' });
    }
};

// Get transaction history for a campaign or user
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { campaignId } = req.query;

        const where = { userId };
        if (campaignId) where.campaignId = parseInt(campaignId);

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { transactionDate: 'desc' },
            include: { campaign: { select: { title: true } } },
            take: 50
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get Transaction History Error:', error);
        sendError(res, 500, 'Failed to fetch transactions', 'INTERNAL');
    }
};

// Get single transaction status
export const getTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;

        const transaction = await prisma.transaction.findFirst({
            where: { id: parseInt(transactionId), userId },
            include: {
                campaign: { select: { id: true, title: true, escrowBalance: true, targetBudget: true } }
            }
        });

        if (!transaction) {
            return sendError(res, 404, 'Transaction not found', 'NOT_FOUND');
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
        sendError(res, 500, 'Failed to fetch transaction status', 'INTERNAL');
    }
};
