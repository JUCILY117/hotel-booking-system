import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { login, logout, me, register } from './auth.controller.js';
import { forgotPassword, resetPassword, verifyResetToken } from './password.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get("/verify-reset-token", verifyResetToken);

export default router;