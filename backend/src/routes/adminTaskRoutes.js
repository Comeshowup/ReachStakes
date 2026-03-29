import express from 'express';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/adminTaskController.js';

const router = express.Router();
router.use(requireAdmin);

router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
