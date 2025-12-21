import { Router } from 'express';
import {
    cancelBooking,
    createBooking,
    getMyBookings,
} from './booking.controller.js';

import {
    adminCancelBooking,
    confirmBooking,
    getAllBookings,
} from './admin.booking.controller.js';

import { requireRole } from '../../middlewares/role.middleware.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkAvailability } from './availability.controller.js';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/me', authenticate, getMyBookings);
router.delete('/:id', authenticate, cancelBooking);
router.get('/availability/:roomId', checkAvailability);

router.get('/admin/all', authenticate, requireRole('ADMIN'), getAllBookings);
router.post('/admin/confirm/:id', authenticate, requireRole('ADMIN'), confirmBooking);
router.delete('/admin/cancel/:id', authenticate, requireRole('ADMIN'), adminCancelBooking);

export default router;