import { Router } from 'express';
import {
    createHotel,
    deactivateHotel,
    getHotelById,
    getHotels,
    updateHotel,
} from './hotel.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const router = Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);

router.post(
    '/',
    authenticate,
    requireRole('ADMIN'),
    createHotel
);

router.put(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    updateHotel
);

router.delete(
    '/:id',
    authenticate,
    requireRole('ADMIN'),
    deactivateHotel
);

export default router;