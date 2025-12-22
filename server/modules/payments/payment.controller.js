import prisma from '../../config/prisma.js';
import {
    sendPaymentFailure,
    sendPaymentSuccess
} from '../emails/email.service.js';

export async function makePayment(req, res) {
    try {
        const userId = req.user.id;
        const { bookingId, method, cardBrand } = req.body;

        if (!bookingId || !method) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                room: {
                    include: {
                        hotel: true,
                    },
                },
            },
        });

        if (!booking || booking.userId !== userId) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'PENDING') {
            return res.status(400).json({ message: 'Booking not payable' });
        }

        const isSuccess = Math.random() > 0.2;

        const payment = await prisma.payment.create({
            data: {
                bookingId,
                amount: booking.totalPrice,
                method,
                cardBrand: method === "CARD" ? cardBrand : null,
                status: isSuccess ? 'SUCCESS' : 'FAILED',
            },
        });

        if (!isSuccess) {
            await sendPaymentFailure(booking.user.email, booking);
            return res.status(402).json({
                message: 'Payment failed',
                payment,
            });
        }

        const confirmedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
            include: {
                user: true,
                room: {
                    include: {
                        hotel: true,
                    },
                },
            },
        });

        await sendPaymentSuccess(
            confirmedBooking.user.email,
            confirmedBooking,
            payment
        );

        return res.json({
            message: 'Payment successful',
            booking: confirmedBooking,
            payment,
        });
    } catch (err) {
        console.error('Payment error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}