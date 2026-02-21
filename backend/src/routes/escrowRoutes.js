import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getEscrowOverview,
    getVaultSummary,
    getEscrowCampaigns,
    fundCampaign,
    depositFunds,
    withdrawFunds,
    releaseMilestone,
    getTransactions,
    getSystemStatus,
} from '../controllers/escrowController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/escrow/overview — KPIs, liquidity, trends
router.get('/overview', getEscrowOverview);

// GET /api/escrow/summary — Vault summary (new Vault UI)
router.get('/summary', getVaultSummary);

// GET /api/escrow/campaigns — Campaign funding data
router.get('/campaigns', getEscrowCampaigns);

// POST /api/escrow/fund — Fund a campaign
router.post('/fund', fundCampaign);

// POST /api/escrow/deposit — Deposit to vault
router.post('/deposit', depositFunds);

// POST /api/escrow/withdraw — Withdraw from vault
router.post('/withdraw', withdrawFunds);

// POST /api/escrow/release — Release milestone funds
router.post('/release', releaseMilestone);

// GET /api/escrow/transactions — Ledger entries (paginated, sortable, searchable)
router.get('/transactions', getTransactions);

// GET /api/escrow/system-status — System operational status
router.get('/system-status', getSystemStatus);

export default router;

