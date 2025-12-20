import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { makePayment } from './payment.controller.js';

const router = Router();

router.post('/', authenticate, makePayment);

export default router;