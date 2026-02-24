import express from 'express';
import { getProgress, getInsights } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getProgress);

router.route('/insights')
    .get(protect, getInsights);

export default router;
