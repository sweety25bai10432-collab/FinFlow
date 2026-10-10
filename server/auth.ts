import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from './db.js';
import { User } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'finflow-secure-expense-jwt-secret-key-2025';

export interface AuthenticatedRequest extends Request {
    user?: User;
}

export function generateToken(user: User): string {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            name: user.name,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = findUserById(decoded.userId);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized: User not found.' });
            return;
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token.' });
    }
}
