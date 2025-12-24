import prisma from '../../config/prisma.js';
import { sendBookingCancellation, sendBookingConfirmation } from '../emails/email.service.js';

const isProduction = process.env.NODE_ENV === 'production';

export async function createBooking(req, res) {
    try {
        const userId = req.user.id;
        const { roomId, checkIn, checkOut } = req.body;

        if (!roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room || !room.isActive) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        if (start >= end) {
            return res.status(400).json({ message: 'Invalid date range' });
        }

        const overlappingBookings = await prisma.booking.count({
            where: {
                roomId,
                status: { not: 'CANCELLED' },
                checkIn: { lt: end },
                checkOut: { gt: start },
            },
        });

        if (overlappingBookings >= room.totalRooms) {
            return res.status(409).json({ message: 'Room not available for selected dates' });
        }

        const nights =
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

        const totalPrice = nights * room.pricePerNight;

        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                checkIn: start,
                checkOut: end,
                totalPrice,
            },
            include: {
                room: {
                    include: {
                        hotel: true,
                    },
                },
                user: true,
            },
        });

        if (!isProduction) {
            await sendBookingConfirmation(booking.user.email, booking);
        }

        return res.status(201).json(booking);
    } catch (err) {
        console.error('Create booking error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getMyBookings(req, res) {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            include: {
                room: {
                    include: {
                        hotel: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(bookings);
    } catch (err) {
        console.error('Get bookings error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function cancelBooking(req, res) {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!booking || booking.userId !== req.user.id) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking already cancelled' });
        }

        // if (!canCancelBooking(booking)) {
        //     return res.status(403).json({
        //         message: 'Booking cannot be cancelled as per cancellation policy',
        //     });
        // }

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: {
                room: {
                    include: {
                        hotel: true,
                    },
                },
                user: true,
            },
        });
        if (!isProduction) {
            await sendBookingCancellation(updatedBooking.user.email, updatedBooking);
        }

        return res.json({ message: 'Booking cancelled' });
    } catch (err) {
        console.error('Cancel booking error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}