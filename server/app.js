import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import authRoutes from './modules/auth/auth.routes.js';
import hotelRoutes from './modules/hotels/hotel.routes.js';
import roomRoutes from './modules/rooms/room.routes.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);

export default app;