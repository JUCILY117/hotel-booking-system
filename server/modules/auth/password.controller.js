import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../config/prisma.js';
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../emails/email.service.js';

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.json({
                message: 'If the email exists, a password reset link has been sent',
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetTokenHash,
                passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
            },
        });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        return res.json({
            message: 'If the email exists, a password reset link has been sent',
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        if (password.length < 8) {
            return res
                .status(400)
                .json({ message: 'Password must be at least 8 characters long' });
        }

        const tokenHash = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: tokenHash,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        const ipAddress =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress;

        const userAgent = req.headers['user-agent'] || 'Unknown device';

        await sendPasswordResetSuccessEmail(user.email, {
            ...user,
            ipAddress,
            userAgent,
        });

        return res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function verifyResetToken(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ valid: false });
    }

    try {
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: tokenHash,
                passwordResetExpires: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ valid: false });
        }

        return res.json({ valid: true });
    } catch (error) {
        console.error("Error verifying reset token:", error);
        return res.status(500).json({ error: "An error occurred while verifying the reset token." });
    }
}
