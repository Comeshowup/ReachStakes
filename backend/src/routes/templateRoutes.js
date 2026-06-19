/**
 * Template Routes — CRUD for reusable deliverable templates.
 * All routes require auth + brand role (or admin).
 */
import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
    createTemplate,
    getTemplates,
    getTemplate,
    updateTemplate,
    deleteTemplate,
} from '../controllers/templateController.js';

const router = Router();

router.use(protect);
router.use(authorize('brand', 'admin'));

router.post('/', createTemplate);       // POST   /api/templates
router.get('/', getTemplates);           // GET    /api/templates
router.get('/:id', getTemplate);         // GET    /api/templates/:id
router.patch('/:id', updateTemplate);    // PATCH  /api/templates/:id
router.delete('/:id', deleteTemplate);   // DELETE /api/templates/:id

export default router;
