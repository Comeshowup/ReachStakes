import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Get token from query param (for downloads)
        token = req.query.token;
    }

    if (token) {
        try {
            console.log("Auth Middleware - Token received:", token ? `${token.substring(0, 10)}...` : "None");

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Auth Middleware - Decoded:", decoded);

            // Get user from the token
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                include: {
                    brandProfile: true,
                    creatorProfile: true,
                }
            });

            if (!req.user) {
                console.log("Auth Middleware - User not found for ID:", decoded.id);
                return res.status(401).json({ status: 'error', message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error("Auth Middleware - Error:", error.message);
            return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log("Auth Middleware - No token provided");
        return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
