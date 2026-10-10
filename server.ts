import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes.js';
import expenseRoutes from './server/routes/expenseRoutes.js';
import aiRoutes from './server/routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000;

    // JSON Body parsing
    app.use(express.json());

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/expenses', expenseRoutes);
    app.use('/api/ai', aiRoutes);

    // Health check route
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok', time: new Date().toISOString() });
    });

    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.resolve(__dirname, 'dist');
        app.use(express.static(distPath));
        app.get('*', (_req, res) => {
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 FinFlow AI Expense Tracker running on port ${PORT}`);
    });
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
