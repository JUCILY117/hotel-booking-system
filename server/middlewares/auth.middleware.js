import { verifyAccessToken } from '../utils/token.util.js';

export function authenticate(req, res, next) {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = verifyAccessToken(token);

        req.user = {
            id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}