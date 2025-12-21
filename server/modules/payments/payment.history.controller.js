import prisma from '../../config/prisma.js';

export async function getMyPayments(req, res) {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                booking: {
                    userId: req.user.id,
                },
            },
            include: {
                booking: {
                    include: {
                        room: {
                            include: {
                                hotel: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(payments);
    } catch (err) {
        console.error('Get user payments error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllPayments(req, res) {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                booking: {
                    include: {
                        user: true,
                        room: {
                            include: {
                                hotel: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return res.json(payments);
    } catch (err) {
        console.error('Admin get payments error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}