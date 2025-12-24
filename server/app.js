import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import path from 'path';

import { errorHandler } from './middlewares/error.middleware.js';
import adminAnalyticsRoutes from './modules/admin/admin.analytics.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import hotelRoutes from './modules/hotels/hotel.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import roomRoutes from './modules/rooms/room.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

app.use(errorHandler);

export default app;