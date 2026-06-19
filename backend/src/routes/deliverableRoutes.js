/**
 * Deliverable Routes
 * All routes require authentication. Authorization is handled per-endpoint in the controller.
 */
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createDeliverables,
    getDeliverablesByCollaboration,
    getDeliverable,
    updateDeliverable,
    deleteDeliverable,
    updateDeliverableStatus,
    submitContent,
    reviewSubmission,
    getSubmissions,
    getTimeline,
    updateChecklist,
    validateCompliance,
    getPaymentSummary,
} from '../controllers/deliverableController.js';

const router = Router();

// All deliverable routes require authentication
router.use(protect);

// ── CRUD ─────────────────────────────────────────────────────────────────
router.post('/', createDeliverables);                                  // POST   /api/deliverables
router.get('/collaboration/:collabId', getDeliverablesByCollaboration); // GET    /api/deliverables/collaboration/:collabId
router.get('/collaboration/:collabId/payment', getPaymentSummary);     // GET    /api/deliverables/collaboration/:collabId/payment
router.get('/:id', getDeliverable);                                    // GET    /api/deliverables/:id
router.patch('/:id', updateDeliverable);                               // PATCH  /api/deliverables/:id
router.delete('/:id', deleteDeliverable);                              // DELETE /api/deliverables/:id

// ── Workflow ─────────────────────────────────────────────────────────────
router.patch('/:id/status', updateDeliverableStatus);                  // PATCH  /api/deliverables/:id/status
router.post('/:id/submit', submitContent);                             // POST   /api/deliverables/:id/submit
router.post('/:id/review', reviewSubmission);                          // POST   /api/deliverables/:id/review
router.get('/:id/submissions', getSubmissions);                        // GET    /api/deliverables/:id/submissions
router.get('/:id/timeline', getTimeline);                              // GET    /api/deliverables/:id/timeline
router.patch('/:id/checklist', updateChecklist);                       // PATCH  /api/deliverables/:id/checklist
router.post('/:id/validate', validateCompliance);                      // POST   /api/deliverables/:id/validate

export default router;
