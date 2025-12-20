import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '45m';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}