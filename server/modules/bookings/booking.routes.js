import { Router } from 'express';
import {
    cancelBooking,
    createBooking,
    getMyBookings,
} from './booking.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/me', authenticate, getMyBookings);
router.delete('/:id', authenticate, cancelBooking);

export default router;