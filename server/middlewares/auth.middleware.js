import prisma from '../config/prisma.js';
import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '../utils/token.util.js';

export async function authenticate(req, res, next) {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
    const isProduction = process.env.NODE_ENV === 'production';

    if (!accessToken) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const payload = verifyRefreshToken(refreshToken);
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const newAccessToken = generateAccessToken(user);
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                sameSite: isProduction ? 'None' : 'Lax',
                secure: isProduction,
                maxAge: 15 * 60 * 1000,
            });

            req.user = { id: user.id, role: user.role };
            return next();
        } catch (err) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }

    try {
        const decoded = verifyAccessToken(accessToken);
        req.user = { id: decoded.userId, role: decoded.role };
        next();
    } catch (err) {
        if (!refreshToken) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        try {
            const payload = verifyRefreshToken(refreshToken);
            const user = await prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const newAccessToken = generateAccessToken(user);
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                sameSite: isProduction ? 'None' : 'Lax',
                secure: isProduction,
                maxAge: 15 * 60 * 1000,
            });

            req.user = { id: user.id, role: user.role };
            next();
        } catch {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    }
}
