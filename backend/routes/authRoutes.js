import express from 'express';
import { authUser, registerUser, getUserProfile, guestLogin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/guest', guestLogin);
router.get('/profile', protect, getUserProfile);

export default router;
