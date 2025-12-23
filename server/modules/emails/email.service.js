import transporter from '../../config/mail.js';
import { emailVerificationTemplate, passwordResetSuccessTemplate, passwordResetTemplate, signupWelcomeTemplate } from './templates/auth.templates.js';
import { bookingCancellationTemplate, bookingConfirmationTemplate, paymentFailureTemplate, paymentSuccessTemplate } from './templates/booking.templates.js';

const FROM = `"Ezy Motel" <no-reply@ezymotel.in>`;

export async function sendSignupWelcome(to, user) {
    const html = signupWelcomeTemplate(user);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Welcome to Ezy Motel 👋",
        html,
    });
}

export async function sendEmailVerification(to, user, verifyUrl) {
    const html = emailVerificationTemplate(user, verifyUrl);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Verify your email | Ezy Motel",
        html,
    });
}

export async function sendPasswordResetEmail(to, resetUrl) {
    const html = passwordResetTemplate(resetUrl);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Reset your password | Ezy Motel",
        html,
    });
}

export async function sendPasswordResetSuccessEmail(to, user) {
    const html = passwordResetSuccessTemplate(user);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: "Your password was changed | Ezy Motel",
        html,
    });
}

export async function sendBookingConfirmation(to, booking) {
    const html = bookingConfirmationTemplate(booking);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Booking Confirmation',
        html,
    });
}

export async function sendBookingCancellation(to, booking) {
    const html = bookingCancellationTemplate(booking);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Booking Cancelled',
        html,
    });
}

export async function sendPaymentSuccess(to, booking, payment) {
    const html = paymentSuccessTemplate(booking, payment);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Payment Successful - Booking Confirmed',
        html,
    });
}

export async function sendPaymentFailure(to, booking) {
    const html = paymentFailureTemplate(booking);

    await transporter.sendMail({
        from: FROM,
        to,
        subject: 'Payment Failed',
        html,
    });
}