import transporter from '../../config/mail.js';
import { bookingCancellationTemplate, bookingConfirmationTemplate, paymentFailureTemplate, paymentSuccessTemplate, } from './templates/booking.templates.js';

export async function sendBookingConfirmation(to, booking) {
    const html = bookingConfirmationTemplate(booking);

    await transporter.sendMail({
        from: '"Hotel Booking" <no-reply@hotel.local>',
        to,
        subject: 'Booking Confirmation',
        html,
    });
}

export async function sendBookingCancellation(to, booking) {
    const html = bookingCancellationTemplate(booking);

    await transporter.sendMail({
        from: '"Hotel Booking" <no-reply@hotel.local>',
        to,
        subject: 'Booking Cancelled',
        html,
    });
}

export async function sendPaymentSuccess(to, booking, payment) {
    const html = paymentSuccessTemplate(booking, payment);

    await transporter.sendMail({
        from: '"Hotel Booking" <no-reply@hotel.local>',
        to,
        subject: 'Payment Successful - Booking Confirmed',
        html,
    });
}

export async function sendPaymentFailure(to, booking) {
    const html = paymentFailureTemplate(booking);

    await transporter.sendMail({
        from: '"Hotel Booking" <no-reply@hotel.local>',
        to,
        subject: 'Payment Failed',
        html,
    });
}