import { prisma } from "../config/db.js";
import { generateInvoicePdf } from "../utils/pdfGenerator.js";
import fs from 'fs';
import path from 'path';

/**
 * Invoice Controllers - Manages Invoice records
 */

// GET /api/invoices/my-invoices
export const getMyInvoices = async (req, res) => {
    try {
        const userId = req.user.id;

        const invoices = await prisma.invoice.findMany({
            where: {
                creatorId: userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json({
            status: "success",
            data: invoices
        });

    } catch (error) {
        console.error("[Invoice] Error fetching invoices:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch invoices" });
    }
};

// POST /api/invoices/generate/:collabId
export const generateInvoice = async (req, res) => {
    try {
        const { collabId } = req.params;
        const userId = req.user.id; // Creator requesting invoice

        // 1. Fetch Collaboration
        const collab = await prisma.campaignCollaboration.findUnique({
            where: { id: parseInt(collabId) },
            include: {
                campaign: {
                    include: {
                        brand: {
                            include: { brandProfile: true }
                        }
                    }
                },
                creator: true // The user
            }
        });

        if (!collab) {
            return res.status(404).json({ status: "error", message: "Collaboration not found" });
        }

        // Verify ownership
        if (collab.creatorId !== userId) {
            return res.status(403).json({ status: "error", message: "Unauthorized" });
        }

        // Check if invoice already exists
        const existingInvoice = await prisma.invoice.findFirst({
            where: { collaborationId: collab.id }
        });

        if (existingInvoice) {
            return res.json({ status: "success", data: existingInvoice, message: "Invoice already exists" });
        }

        // 2. Create Invoice
        const invoiceNumber = `INV-${new Date().getFullYear()}-${String(collab.id).padStart(4, '0')}`;

        const invoice = await prisma.invoice.create({
            data: {
                creatorId: userId,
                collaborationId: collab.id,
                invoiceNumber: invoiceNumber,
                brandName: collab.campaign.brand.brandProfile?.companyName || "Brand",
                campaignTitle: collab.campaign.title,
                amount: collab.agreedPrice || 0,
                status: "Draft",
                taxYear: new Date().getFullYear(),
                issuedAt: new Date()
            }
        });

        res.status(201).json({
            status: "success",
            data: invoice
        });

    } catch (error) {
        console.error("[Invoice] Error generating invoice:", error);
        res.status(500).json({ status: "error", message: "Failed to generate invoice" });
    }
};

// GET /api/invoices/tax-summary/:year
export const getTaxSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.params.year) || new Date().getFullYear();

        const invoices = await prisma.invoice.findMany({
            where: {
                creatorId: userId,
                taxYear: year,
                status: "Paid"
            }
        });

        const totalEarnings = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

        // Monthly breakdown
        const monthlyBreakdown = Array(12).fill(0);
        invoices.forEach(inv => {
            const date = inv.paidAt || inv.issuedAt;
            if (date) {
                monthlyBreakdown[date.getMonth()] += parseFloat(inv.amount);
            }
        });

        res.json({
            status: "success",
            data: {
                year,
                totalEarnings,
                invoiceCount: invoices.length,
                monthlyBreakdown: monthlyBreakdown.map((amount, idx) => ({
                    month: new Date(0, idx).toLocaleString('default', { month: 'short' }),
                    amount
                })),
                requiresForm1099: totalEarnings >= 600
            }
        });

    } catch (error) {
        console.error("[Invoice] Error fetching tax summary:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch tax summary" });
    }
};

// GET /api/invoices/download/:invoiceId
export const downloadInvoice = async (req, res) => {
    try {
        const invoiceId = parseInt(req.params.invoiceId); // changed from transactionId to invoiceId
        const userId = req.user.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                creator: { include: { creatorProfile: true } }
            }
        });

        if (!invoice || invoice.creatorId !== userId) {
            return res.status(404).json({ status: "error", message: "Invoice not found" });
        }

        // Prepare data for PDF generator
        // The generator expects: invoiceNumber, creator{fullName, email}, brandName, campaignTitle, amount, status, etc.
        const invoiceData = {
            ...invoice,
            creator: {
                fullName: invoice.creator.name, // or creatorProfile.fullName
                email: invoice.creator.email
            }
        };

        // We can reuse the memory stream approach or write to a temp file.
        // The generator I wrote writes to a file. I should modify it to return a buffer or handle file.
        // For now, let's use a temp path.
        const tempPath = path.join(process.cwd(), `temp-${invoice.invoiceNumber}.pdf`);

        await generateInvoicePdf(invoiceData, tempPath);

        const fileBuffer = fs.readFileSync(tempPath);
        fs.unlinkSync(tempPath); // Cleanup

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
        res.send(fileBuffer);

    } catch (error) {
        console.error("[Invoice] Error downloading invoice:", error);
        res.status(500).json({ status: "error", message: "Failed to download invoice" });
    }
};
