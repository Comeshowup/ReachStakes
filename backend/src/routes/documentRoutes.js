import express from 'express';
import {
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument,
    generateContractFromCollab,
    initiateDocumentSigning,
    markDocumentSigned,
    getDocumentsByCampaign,
    getTaxDocumentsByYear,
    downloadDocumentPdf
} from '../controllers/documentControllers.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Creator routes
router.get('/', authorize('creator'), getDocuments);
router.get('/:id', authorize('creator'), getDocumentById);
router.post('/', authorize('creator'), createDocument);
router.patch('/:id', authorize('creator'), updateDocument);
router.delete('/:id', authorize('creator'), deleteDocument);

// Contract generation
router.post('/generate-contract/:collabId', authorize('creator'), generateContractFromCollab);

// E-Signature routes
router.get('/:id/download', authorize('creator'), downloadDocumentPdf);
router.post('/:id/sign', authorize('creator'), initiateDocumentSigning);
router.post('/:id/mark-signed', markDocumentSigned); // Webhook - no role restriction

// Filtered queries
router.get('/campaign/:campaignId', authorize('creator'), getDocumentsByCampaign);
router.get('/tax/:year', authorize('creator'), getTaxDocumentsByYear);

export default router;
