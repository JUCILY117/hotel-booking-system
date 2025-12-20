import bcrypt from 'bcrypt';
import prisma from '../../config/prisma.js';
import { generateAccessToken } from '../../utils/token.util.js';

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        return res.status(201).json({
            message: 'User registered successfully',
        });
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

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateAccessToken(user);

        res.cookie('access_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 45 * 60 * 1000,
        });

        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function me(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ user });
    } catch (err) {
        console.error('Me error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export function logout(req, res) {
    res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
    });

    return res.json({ message: 'Logged out successfully' });
}