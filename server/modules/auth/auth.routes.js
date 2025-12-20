import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { login, logout, me, register } from './auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;