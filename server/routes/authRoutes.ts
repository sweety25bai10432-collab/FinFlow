import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, updateUserBudget, findUserById } from '../db.js';
import { generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res): Promise<void> => {
    try {
        const { name, email, password, monthlyBudget, currency } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required.' });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long.' });
            return;
        }

        const existingUser = findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ error: 'An account with this email already exists.' });
            return;
        }

        const user = await createUser(name, email, password, monthlyBudget || 3000, currency || '$');
        const token = generateToken(user);

        const { passwordHash: _, ...userSafe } = user;
        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: userSafe,
        });
    } catch (err: any) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Login existing user
router.post('/login', async (req, res): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required.' });
            return;
        }

        const user = findUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }

        const token = generateToken(user);
        const { passwordHash: _, ...userSafe } = user;

        res.json({
            message: 'Logged in successfully',
            token,
            user: userSafe,
        });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// One-click demo login
router.post('/demo-login', async (_req, res): Promise<void> => {
    try {
        const demoUser = findUserByEmail('demo@finflow.ai');
        if (!demoUser) {
            // Re-create if somehow missing
            const user = await createUser('Alex Johnson', 'demo@finflow.ai', 'password123', 3500, '$');
            const token = generateToken(user);
            const { passwordHash: _, ...userSafe } = user;
            res.json({ message: 'Demo account ready', token, user: userSafe });
            return;
        }

        const token = generateToken(demoUser);
        const { passwordHash: _, ...userSafe } = demoUser;
        res.json({
            message: 'Welcome to the demo account',
            token,
            user: userSafe,
        });
    } catch (err: any) {
        console.error('Demo login error:', err);
        res.status(500).json({ error: 'Demo login error' });
    }
});

// Get current profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const { passwordHash: _, ...userSafe } = req.user;
    res.json({ user: userSafe });
});

// Update budget & currency settings
router.put('/budget', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { monthlyBudget, currency } = req.body;
    if (typeof monthlyBudget !== 'number' || monthlyBudget <= 0) {
        res.status(400).json({ error: 'Monthly budget must be a positive number.' });
        return;
    }

    const updatedUser = updateUserBudget(req.user.id, monthlyBudget, currency);
    if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const { passwordHash: _, ...userSafe } = updatedUser;
    res.json({
        message: 'Budget settings updated',
        user: userSafe,
    });
});

export default router;
