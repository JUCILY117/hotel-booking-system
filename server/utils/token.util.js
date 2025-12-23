import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

export function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
}

export function generateRefreshToken(user) {
    return jwt.sign(
        {
            userId: user.id,
        },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}
