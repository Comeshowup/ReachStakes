/**
 * Escrow Controller — API handlers for the Escrow Vault.
 * All endpoints require authentication. Brand ownership is validated.
 */
import { EscrowService } from '../services/escrow.service.js';
import { tazapayService } from '../services/tazapayService.js';
import { prisma } from '../config/db.js';

// Fee constants (match paymentController.js)
const PLATFORM_FEE_PERCENT = 5;
const PROCESSING_FEE_PERCENT = 2.9;

/**
 * @desc    Get escrow vault overview (KPIs, liquidity, trends)
 * @route   GET /api/escrow/overview
 * @access  Private/Brand
 */
export const getEscrowOverview = async (req, res) => {
    try {
        const brandId = req.user.id;
        const data = await EscrowService.getOverview(brandId);
        res.json({ status: 'success', data });
    } catch (error) {
        console.error('[EscrowController] Overview error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch escrow overview.' });
    }
};

/**
 * @desc    Get vault summary (reshaped for new Vault UI)
 * @route   GET /api/escrow/summary
 * @access  Private/Brand
 */
export const getVaultSummary = async (req, res) => {
    try {
        const brandId = req.user.id;
        const data = await EscrowService.getVaultSummary(brandId);
        res.json({ status: 'success', data });
    } catch (error) {
        console.error('[EscrowController] Vault summary error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch vault summary.' });
    }
};

/**
 * @desc    Get all campaigns with escrow funding data
 * @route   GET /api/escrow/campaigns
 * @access  Private/Brand
 */
export const getEscrowCampaigns = async (req, res) => {
    try {
        const brandId = req.user.id;
        const data = await EscrowService.getCampaigns(brandId);
        res.json({ status: 'success', data });
    } catch (error) {
        console.error('[EscrowController] Campaigns error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch escrow campaigns.' });
    }
};

/**
 * @desc    Fund a campaign escrow
 * @route   POST /api/escrow/fund
 * @access  Private/Brand
 */
export const fundCampaign = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { campaignId, amount } = req.body;

        // Server-side validation
        if (!campaignId || typeof campaignId !== 'number') {
            return res.status(400).json({ status: 'error', message: 'Valid campaignId is required.' });
        }
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Amount must be a positive number.' });
        }
        if (amount > 10000000) {
            return res.status(400).json({ status: 'error', message: 'Amount exceeds maximum allowed.' });
        }

        const result = await EscrowService.fundCampaign(brandId, campaignId, amount);
        res.json({ status: 'success', data: result });
    } catch (error) {
        console.error('[EscrowController] Fund error:', error);
        const statusCode = error.message.includes('not found') || error.message.includes('access denied') ? 404 : 400;
        res.status(statusCode).json({ status: 'error', message: error.message });
    }
};

/**
 * @desc    Deposit funds into vault via Tazapay checkout
 * @route   POST /api/escrow/deposit
 * @access  Private/Brand
 */
export const depositFunds = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { amount, method } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Amount must be a positive number.' });
        }
        if (amount > 10000000) {
            return res.status(400).json({ status: 'error', message: 'Amount exceeds maximum allowed ($10,000,000).' });
        }

        // Get user details for Tazapay checkout
        const user = await prisma.user.findUnique({ where: { id: brandId } });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found.' });
        }

        // Calculate fees
        const platformFee = amount * (PLATFORM_FEE_PERCENT / 100);
        const processingFee = amount * (PROCESSING_FEE_PERCENT / 100);
        const totalCharge = amount + platformFee + processingFee;

        // Create a Pending transaction record
        const transaction = await prisma.transaction.create({
            data: {
                userId: brandId,
                amount,
                type: 'Deposit',
                status: 'Pending',
                description: `Vault deposit: $${amount.toFixed(2)} via ${method || 'Tazapay'}`,
                platformFee,
                processingFee,
                netAmount: amount,
                transactionDate: new Date(),
            },
        });

        // Create Tazapay Checkout Session
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const checkout = await tazapayService.createCheckoutSession({
            amount: totalCharge,
            invoice_currency: 'USD',
            customer_details: {
                name: user.name || user.email,
                email: user.email,
                country: 'US',
            },
            txn_description: `Vault Deposit (Ref: TXN-${transaction.id})`,
            success_url: `${frontendUrl}/brand/escrow?payment=success&txn=${transaction.id}`,
            cancel_url: `${frontendUrl}/brand/escrow?payment=cancelled&txn=${transaction.id}`,
        });

        // Extract checkout URL
        const checkoutData = checkout?.data || checkout;
        const checkoutUrl = checkoutData?.url || checkoutData?.checkout_url || checkout?.url;
        const checkoutId = checkoutData?.id || checkoutData?.checkout_id || checkoutData?.txn_no || `ref_${Date.now()}`;

        console.log('[EscrowController] Tazapay Checkout Created:', {
            checkoutId,
            hasUrl: !!checkoutUrl,
            transactionId: transaction.id,
            amount: totalCharge,
        });

        if (!checkoutUrl) {
            // Mark transaction as failed
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'Failed', gatewayStatus: 'checkout_creation_failed' },
            });
            return res.status(502).json({
                status: 'error',
                message: 'Payment gateway did not return a checkout URL. Please try again.',
            });
        }

        // Update transaction with checkout references
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
                checkoutUrl,
                tazapayReferenceId: checkoutId,
                gatewayStatus: 'checkout_created',
            },
        });

        res.json({
            status: 'success',
            data: {
                url: checkoutUrl,
                transactionId: transaction.id,
                amount,
                totalCharge,
                platformFee,
                processingFee,
            },
        });
    } catch (error) {
        console.error('[EscrowController] Deposit error:', error);
        res.status(400).json({ status: 'error', message: error.message || 'Failed to initiate deposit.' });
    }
};

/**
 * @desc    Withdraw funds from vault
 * @route   POST /api/escrow/withdraw
 * @access  Private/Brand
 */
export const withdrawFunds = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { amount } = req.body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Amount must be a positive number.' });
        }

        const result = await EscrowService.withdrawFunds(brandId, amount);
        res.json({ status: 'success', data: result });
    } catch (error) {
        console.error('[EscrowController] Withdraw error:', error);
        const statusCode = error.message.includes('Insufficient') ? 409 : 400;
        res.status(statusCode).json({ status: 'error', message: error.message });
    }
};

/**
 * @desc    Release escrow funds for a milestone
 * @route   POST /api/escrow/release
 * @access  Private/Brand
 */
export const releaseMilestone = async (req, res) => {
    try {
        const brandId = req.user.id;
        const { campaignId, milestoneId, amount } = req.body;

        // Server-side validation
        if (!campaignId || typeof campaignId !== 'number') {
            return res.status(400).json({ status: 'error', message: 'Valid campaignId is required.' });
        }
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ status: 'error', message: 'Amount must be a positive number.' });
        }

        const result = await EscrowService.releaseMilestone(brandId, campaignId, milestoneId || null, amount);
        res.json({ status: 'success', data: result });
    } catch (error) {
        console.error('[EscrowController] Release error:', error);
        const statusCode = error.message.includes('not found') ? 404
            : error.message.includes('Insufficient') ? 409
                : error.message.includes('already been released') ? 409
                    : 400;
        res.status(statusCode).json({ status: 'error', message: error.message });
    }
};

/**
 * @desc    Get paginated escrow transaction history (with sort, search, filter)
 * @route   GET /api/escrow/transactions?page=1&limit=20&sortBy=date&sortOrder=desc&search=&type=
 * @access  Private/Brand
 */
export const getTransactions = async (req, res) => {
    try {
        const brandId = req.user.id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
        const search = req.query.search || '';
        const type = req.query.type || '';

        const data = await EscrowService.getTransactions(brandId, page, limit, { sortBy, sortOrder, search, type });
        res.json({ status: 'success', data });
    } catch (error) {
        console.error('[EscrowController] Transactions error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to fetch transactions.' });
    }
};

/**
 * @desc    Get system operational status
 * @route   GET /api/escrow/system-status
 * @access  Private/Brand
 */
export const getSystemStatus = async (req, res) => {
    try {
        res.json({
            status: 'success',
            data: {
                operational: true,
                label: 'System Operational',
                services: {
                    vault: 'operational',
                    escrow: 'operational',
                    payments: 'operational',
                },
                lastChecked: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[EscrowController] System status error:', error);
        res.status(500).json({ status: 'error', data: { operational: false, label: 'System Issue Detected' } });
    }
};
