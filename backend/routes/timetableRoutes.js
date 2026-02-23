import express from 'express';
import { createTimetable, getTimetables, deleteTimetable } from '../controllers/timetableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createTimetable)
    .get(protect, getTimetables);

router.route('/:id')
    .delete(protect, deleteTimetable);

export default router;
