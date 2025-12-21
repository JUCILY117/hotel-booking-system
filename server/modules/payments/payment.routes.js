import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { makePayment } from './payment.controller.js';
import {
    getAllPayments,
    getMyPayments,
} from './payment.history.controller.js';

import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.post('/', authenticate, makePayment);

router.get('/me', authenticate, getMyPayments);

router.get('/admin/all', authenticate, requireRole('ADMIN'), getAllPayments);

export default router;