import express from 'express';
import { getTasks, updateTaskStatus } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getTasks);

router.route('/:id/status')
    .put(protect, updateTaskStatus);

export default router;
