import prisma from '../../config/prisma.js';

export async function getDashboardStats(req, res) {
    try {
        const [
            totalBookings,
            pendingBookings,
            confirmedBookings,
            cancelledBookings,
            totalRevenue,
        ] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.booking.count({ where: { status: 'CONFIRMED' } }),
            prisma.booking.count({ where: { status: 'CANCELLED' } }),
            prisma.payment.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true },
            }),
        ]);

        return res.json({
            totalBookings,
            pendingBookings,
            confirmedBookings,
            cancelledBookings,
            totalRevenue: totalRevenue._sum.amount || 0,
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getRevenueByDate(req, res) {
    try {
        const payments = await prisma.payment.findMany({
            where: { status: 'SUCCESS' },
            select: {
                amount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        const revenueMap = {};

        payments.forEach((p) => {
            const date = p.createdAt.toISOString().split('T')[0];
            revenueMap[date] = (revenueMap[date] || 0) + p.amount;
        });

        return res.json(revenueMap);
    } catch (err) {
        console.error('Revenue by date error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getTopHotels(req, res) {
    try {
        const bookings = await prisma.booking.findMany({
            where: { status: 'CONFIRMED' },
            include: {
                room: {
                    include: {
                        hotel: true,
                    },
                },
            },
        });

        const hotelMap = {};

        bookings.forEach((b) => {
            const hotel = b.room.hotel;
            if (!hotelMap[hotel.id]) {
                hotelMap[hotel.id] = {
                    hotelId: hotel.id,
                    name: hotel.name,
                    bookings: 0,
                };
            }
            hotelMap[hotel.id].bookings += 1;
        });

        const result = Object.values(hotelMap).sort(
            (a, b) => b.bookings - a.bookings
        );

        return res.json(result);
    } catch (err) {
        console.error('Top hotels error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}