import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token.util.js';
import { sendSignupWelcome } from '../emails/email.service.js';

const isProduction = process.env.NODE_ENV === 'production';

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, passwordHash },
        });

        await sendSignupWelcome(email, user);
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

        res.cookie('access_token', accessToken, { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction, maxAge: 15 * 60 * 1000 });
        res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function logout(req, res) {
    try {
        if (req.user) {
            await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
        }

        res.clearCookie('access_token', { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction });
        res.clearCookie('refresh_token', { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction });

        return res.json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function refresh(req, res) {
    try {
        const { refresh_token } = req.cookies;
        if (!refresh_token) return res.status(401).json({ message: 'No refresh token' });

        const payload = verifyRefreshToken(refresh_token);
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.refreshToken !== refresh_token) return res.status(403).json({ message: 'Invalid refresh token' });

        const newAccessToken = generateAccessToken(user);
        res.cookie('access_token', newAccessToken, { httpOnly: true, sameSite: isProduction ? 'None' : 'Lax', secure: isProduction, maxAge: 15 * 60 * 1000 });

        return res.json({ message: 'Access token refreshed' });
    } catch (err) {
        console.error('Refresh token error:', err);
        return res.status(403).json({ message: 'Could not refresh token' });
    }
}

export async function me(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.json({ user });
    } catch (err) {
        console.error('Me error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
