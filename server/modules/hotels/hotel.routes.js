import { Router } from 'express';
import {
    activateHotel,
    createHotel,
    deactivateHotel,
    getAllHotelsAdmin,
    getHotelById,
    getHotels,
    updateHotel,
} from './hotel.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

import { uploadHotelImages as upload } from '../../config/upload.js';
import { uploadHotelImages } from './hotel.controller.js';

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

router.post(
    '/:id/images',
    authenticate,
    requireRole('ADMIN'),
    upload,
    uploadHotelImages
);

router.get(
    '/admin/all',
    authenticate,
    requireRole('ADMIN'),
    getAllHotelsAdmin
);

router.patch(
    '/:id/activate',
    authenticate,
    requireRole('ADMIN'),
    activateHotel
);

export default router;