import { Router } from 'express';
import {
    getDashboardStats,
    getRevenueByDate,
    getTopHotels,
} from './admin.analytics.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.get(
    '/dashboard',
    authenticate,
    requireRole('ADMIN'),
    getDashboardStats
);

router.get(
    '/revenue-by-date',
    authenticate,
    requireRole('ADMIN'),
    getRevenueByDate
);

router.get(
    '/top-hotels',
    authenticate,
    requireRole('ADMIN'),
    getTopHotels
);

export default router;