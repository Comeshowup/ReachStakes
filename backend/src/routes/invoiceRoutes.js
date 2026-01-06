import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getMyInvoices,
    generateInvoice,
    getTaxSummary,
    downloadInvoice
} from "../controllers/invoiceControllers.js";

const router = express.Router();

// All invoice routes require authentication
router.use(protect);

// GET /api/invoices/my-invoices - Get all invoices for logged-in creator
router.get("/my-invoices", getMyInvoices);

// POST /api/invoices/generate/:collabId - Auto-generate invoice from collaboration
router.post("/generate/:collabId", generateInvoice);

// GET /api/invoices/tax-summary/:year - Get yearly tax summary
router.get("/tax-summary/:year", getTaxSummary);

// GET /api/invoices/download/:invoiceId - Download invoice PDF
router.get("/download/:invoiceId", downloadInvoice);

export default router;
