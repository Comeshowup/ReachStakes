import { prisma } from "../config/db.js";

// @desc    Get all documents for the logged-in creator
// @route   GET /api/documents
// @access  Private/Creator
export const getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const documents = await prisma.document.findMany({
            where: { creatorId: userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            status: 'success',
            data: documents
        });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch documents'
        });
    }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private/Creator
export const getDocumentById = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const userId = req.user.id;

        const document = await prisma.document.findFirst({
            where: {
                id: docId,
                creatorId: userId
            }
        });

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        res.json({
            status: 'success',
            data: document
        });
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch document'
        });
    }
};

// @desc    Create a new document
// @route   POST /api/documents
// @access  Private/Creator
export const createDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            type,
            title,
            description,
            collaborationId,
            campaignId,
            fileUrl,
            taxYear,
            expiresAt
        } = req.body;

        if (!type || !title) {
            return res.status(400).json({
                status: 'error',
                message: 'Type and title are required'
            });
        }

        const document = await prisma.document.create({
            data: {
                creatorId: userId,
                type,
                title,
                description,
                collaborationId: collaborationId ? parseInt(collaborationId) : null,
                campaignId: campaignId ? parseInt(campaignId) : null,
                fileUrl,
                taxYear: taxYear ? parseInt(taxYear) : new Date().getFullYear(),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                status: 'Draft'
            }
        });

        res.status(201).json({
            status: 'success',
            data: document
        });
    } catch (error) {
        console.error("Error creating document:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create document'
        });
    }
};

// @desc    Update document status/details
// @route   PATCH /api/documents/:id
// @access  Private/Creator
export const updateDocument = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const userId = req.user.id;
        const updateData = req.body;

        // Verify ownership
        const existing = await prisma.document.findFirst({
            where: { id: docId, creatorId: userId }
        });

        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        const document = await prisma.document.update({
            where: { id: docId },
            data: updateData
        });

        res.json({
            status: 'success',
            data: document
        });
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update document'
        });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private/Creator
export const deleteDocument = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const userId = req.user.id;

        // Verify ownership
        const existing = await prisma.document.findFirst({
            where: { id: docId, creatorId: userId }
        });

        if (!existing) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        await prisma.document.delete({
            where: { id: docId }
        });

        res.json({
            status: 'success',
            message: 'Document deleted'
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete document'
        });
    }
};

// @desc    Generate contract document from collaboration
// @route   POST /api/documents/generate-contract/:collabId
// @access  Private/Creator
export const generateContractFromCollab = async (req, res) => {
    try {
        const collabId = parseInt(req.params.collabId);
        const userId = req.user.id;

        // Get collaboration with campaign details
        const collaboration = await prisma.campaignCollaboration.findFirst({
            where: {
                id: collabId,
                creatorId: userId
            },
            include: {
                campaign: {
                    include: {
                        brand: {
                            include: {
                                brandProfile: true
                            }
                        }
                    }
                }
            }
        });

        if (!collaboration) {
            return res.status(404).json({
                status: 'error',
                message: 'Collaboration not found'
            });
        }

        const campaign = collaboration.campaign;
        const brand = campaign.brand.brandProfile;

        // Check if contract already exists
        const existingContract = await prisma.document.findFirst({
            where: {
                creatorId: userId,
                collaborationId: collabId,
                type: 'Contract'
            }
        });

        if (existingContract) {
            return res.json({
                status: 'success',
                data: existingContract,
                message: 'Contract already exists for this collaboration'
            });
        }

        // Create contract document
        const document = await prisma.document.create({
            data: {
                creatorId: userId,
                collaborationId: collabId,
                campaignId: campaign.id,
                type: 'Contract',
                title: `Campaign Contract - ${campaign.title}`,
                description: `Contract for ${campaign.title} campaign with ${brand?.companyName || 'Brand'}`,
                status: 'Pending_Signature',
                expiresAt: campaign.deadline
            }
        });

        res.status(201).json({
            status: 'success',
            data: document
        });
    } catch (error) {
        console.error("Error generating contract:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate contract'
        });
    }
};

// @desc    Initiate document signing (DocuSeal placeholder)
// @route   POST /api/documents/:id/sign
// @access  Private/Creator
export const initiateDocumentSigning = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const userId = req.user.id;

        const document = await prisma.document.findFirst({
            where: { id: docId, creatorId: userId }
        });

        if (!document) {
            return res.status(404).json({
                status: 'error',
                message: 'Document not found'
            });
        }

        if (document.status === 'Signed') {
            return res.status(400).json({
                status: 'error',
                message: 'Document is already signed'
            });
        }

        // TODO: Integrate with DocuSeal API
        // 1. Create submission from template
        // 2. Return embed URL for signing

        // For now, return placeholder response
        const signingUrl = `https://docuseal.example.com/sign/${document.id}`;

        // Update status to pending signature
        await prisma.document.update({
            where: { id: docId },
            data: { status: 'Pending_Signature' }
        });

        res.json({
            status: 'success',
            data: {
                documentId: docId,
                signingUrl,
                message: 'DocuSeal integration pending - this is a placeholder URL'
            }
        });
    } catch (error) {
        console.error("Error initiating signing:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to initiate signing'
        });
    }
};

// @desc    Mark document as signed (webhook handler or manual)
// @route   POST /api/documents/:id/mark-signed
// @access  Private
export const markDocumentSigned = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const { signedByName, signedFileUrl, signatureId } = req.body;

        const document = await prisma.document.update({
            where: { id: docId },
            data: {
                status: 'Signed',
                signedAt: new Date(),
                signedByName,
                signedFileUrl,
                signatureId
            }
        });

        res.json({
            status: 'success',
            data: document
        });
    } catch (error) {
        console.error("Error marking document signed:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to mark document as signed'
        });
    }
};

// @desc    Get documents by campaign
// @route   GET /api/documents/campaign/:campaignId
// @access  Private
export const getDocumentsByCampaign = async (req, res) => {
    try {
        const campaignId = parseInt(req.params.campaignId);
        const userId = req.user.id;

        const documents = await prisma.document.findMany({
            where: {
                campaignId,
                creatorId: userId
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            status: 'success',
            data: documents
        });
    } catch (error) {
        console.error("Error fetching campaign documents:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch documents'
        });
    }
};

// @desc    Get tax documents by year
// @route   GET /api/documents/tax/:year
// @access  Private/Creator
export const getTaxDocumentsByYear = async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const userId = req.user.id;

        const documents = await prisma.document.findMany({
            where: {
                creatorId: userId,
                taxYear: year,
                type: {
                    in: ['W9', 'NEC_1099', 'TaxForm']
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            status: 'success',
            data: documents
        });
    } catch (error) {
        console.error("Error fetching tax documents:", error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tax documents'
        });
    }
};

// @desc    Download document PDF (Generate on fly for Draft Contracts)
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocumentPdf = async (req, res) => {
    try {
        const docId = parseInt(req.params.id);
        const userId = req.user.id;
        const PDFDocument = (await import('pdfkit')).default;

        const document = await prisma.document.findFirst({
            where: { id: docId },
            include: {
                creator: { include: { creatorProfile: true } }
            }
        });

        // Check access (Creator or Admin/Brand associated logic - simplifed for Creator now)
        if (!document || document.creatorId !== userId) {
            return res.status(404).json({ status: 'error', message: 'Document not found' });
        }

        // If file already exists (e.g. signed URL or uploaded), redirect
        if (document.signedFileUrl) return res.redirect(document.signedFileUrl);
        if (document.fileUrl) return res.redirect(document.fileUrl);

        // If Contract and Draft, generate text PDF
        if (document.type === 'Contract') {
            const doc = new PDFDocument();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=contract-${docId}.pdf`);

            doc.pipe(res);

            // Header
            doc.fontSize(20).text('INFLUENCER AGREEMENT', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
            doc.moveDown();

            // Body
            doc.fontSize(12).text(document.title, { align: 'center', bold: true });
            doc.moveDown();

            doc.fontSize(10).text(`This Agreement is entered into by and between:`);
            doc.text(`CREATOR: ${document.creator.name} (${document.creator.email})`);
            doc.text(`AND`);
            doc.text(`BRAND: [Brand Name Associated with Campaign]`);
            doc.moveDown();

            doc.fontSize(12).text('1. DESCRIPTION OF SERVICES', { underline: true });
            doc.fontSize(10).text(document.description || 'As per campaign details.');
            doc.moveDown();

            doc.fontSize(12).text('2. STATUS', { underline: true });
            doc.fontSize(10).text(`Current Status: ${document.status}`);
            doc.moveDown();

            doc.fontSize(12).text('3. SIGNATURES', { underline: true });
            doc.moveDown(2);
            doc.text('__________________________          __________________________');
            doc.text('Creator Signature                   Brand Representative');

            doc.end();
            return;
        }

        return res.status(404).json({ status: 'error', message: 'PDF not available' });

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ status: 'error', message: 'Failed to generate PDF' });
    }
};
