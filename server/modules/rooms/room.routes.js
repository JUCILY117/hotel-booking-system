import { Router } from 'express';
import {
    createRoom,
    deactivateRoom,
    getRoomsByHotel,
    updateRoom,
} from './room.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/hotel/:hotelId', getRoomsByHotel);

router.post(
    '/',
    authenticate,
    requireRole('ADMIN'),
    createRoom
);

router.put(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    updateRoom
);

router.delete(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    deactivateRoom
);

export default router;