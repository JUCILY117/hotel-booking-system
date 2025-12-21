import prisma from '../../config/prisma.js';

export async function getAllBookings(req, res) {
    try {
        const { status } = req.query;

        const bookings = await prisma.booking.findMany({
            where: status ? { status } : {},
            include: {
                user: true,
                room: {
                    include: {
                        hotel: true,
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(bookings);
    } catch (err) {
        console.error('Admin get bookings error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function confirmBooking(req, res) {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!booking || booking.status !== 'PENDING') {
            return res.status(400).json({ message: 'Booking cannot be confirmed' });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: 'CONFIRMED' },
        });

        return res.json(updated);
    } catch (err) {
        console.error('Admin confirm booking error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function adminCancelBooking(req, res) {
    try {
        const { id } = req.params;

        const booking = await prisma.booking.findUnique({
            where: { id },
        });

        if (!booking || booking.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Booking cannot be cancelled' });
        }

        await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return res.json({ message: 'Booking cancelled by admin' });
    } catch (err) {
        console.error('Admin cancel booking error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
