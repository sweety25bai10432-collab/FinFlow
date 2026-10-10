import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import {
    detectCategoryWithAI,
    generateSpendingAnalysisWithAI,
    askFinancialAdvisor,
    processVoiceAssistantCommand,
    parseReceiptOrInvoiceWithAI,
    analyzeAffordabilityWithAI,
} from '../gemini.js';
import { getExpensesByUserId, createExpense, getAccountsByUserId } from '../db.js';

const router = Router();
router.use(requireAuth);

// 1. POST /api/ai/categorize - Real-time AI category detection
router.post('/categorize', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { description, amount } = req.body;
        if (!description || typeof description !== 'string' || !description.trim()) {
            res.status(400).json({ error: 'Description is required for categorization' });
            return;
        }

        const aiResult = await detectCategoryWithAI(
            description.trim(),
            amount ? Number(amount) : undefined
        );
        res.json(aiResult);
    } catch (err: any) {
        console.error('AI categorization error:', err);
        res.status(500).json({
            error: 'Failed to categorize transaction with AI',
            category: 'Other',
            confidence: 0.5,
        });
    }
});

// 2. POST /api/ai/analysis - AI Spending Analysis & Prediction
router.post('/analysis', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const expenses = getExpensesByUserId(user.id);
        const analysis = await generateSpendingAnalysisWithAI(
            expenses,
            user.monthlyBudget,
            user.currency || '$'
        );
        res.json({ analysis });
    } catch (err: any) {
        console.error('AI analysis error:', err);
        res.status(500).json({ error: 'Failed to generate AI spending analysis' });
    }
});

// 3. POST /api/ai/ask - Custom financial advisor Q&A
router.post('/ask', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const { question } = req.body;
        if (!question || typeof question !== 'string' || !question.trim()) {
            res.status(400).json({ error: 'Question is required' });
            return;
        }

        const expenses = getExpensesByUserId(user.id);
        const answer = await askFinancialAdvisor(
            question.trim(),
            expenses,
            user.monthlyBudget,
            user.currency || '$'
        );
        res.json({ answer });
    } catch (err: any) {
        console.error('AI advisor Q&A error:', err);
        res.status(500).json({ error: 'Failed to consult financial advisor' });
    }
});

// 4. POST /api/ai/voice-command - Voice Assistant command processing (English & Hinglish)
router.post('/voice-command', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const { transcript, autoSave = true, language = 'en' } = req.body;
        if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
            res.status(400).json({ error: 'Transcript is required for voice command' });
            return;
        }

        const expenses = getExpensesByUserId(user.id);
        const result = await processVoiceAssistantCommand(
            transcript.trim(),
            expenses,
            user.monthlyBudget,
            user.currency || '$',
            language === 'hinglish' ? 'hinglish' : 'en'
        );

        if (result.intent === 'add_expense' && result.expenseData && autoSave) {
            const newExpense = createExpense({
                userId: user.id,
                description: result.expenseData.description,
                amount: result.expenseData.amount,
                category: result.expenseData.category,
                date: result.expenseData.date,
                paymentMethod: result.expenseData.paymentMethod,
                tags: result.expenseData.tags,
                account: result.expenseData.account,
                notes: `Added via Voice Assistant (${language === 'hinglish' || language === 'hi' ? 'Hinglish' : 'English'})`,
                aiCategorized: true,
            });
            result.addedExpense = newExpense;
        }

        res.json(result);
    } catch (err: any) {
        console.error('Voice command error:', err);
        res.status(500).json({
            error: 'Failed to process voice command',
            spokenResponse: 'I encountered an issue processing that voice request.',
            displayResponse: 'Voice processing failure.',
        });
    }
});

// 5. POST /api/ai/scan-receipt - Smart Receipt & Invoice OCR Parser
router.post('/scan-receipt', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { inputData, isImageBase64 = false } = req.body;
        if (!inputData) {
            res.status(400).json({ error: 'Receipt text or image base64 data required' });
            return;
        }

        const scanResult = await parseReceiptOrInvoiceWithAI(inputData, Boolean(isImageBase64));
        res.json({ result: scanResult });
    } catch (err: any) {
        console.error('Receipt scanning error:', err);
        res.status(500).json({ error: 'Failed to scan receipt' });
    }
});

// 6. POST /api/ai/affordability - Can I Afford This? Co-pilot evaluator
router.post('/affordability', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;
        const { amount, description } = req.body;
        if (!amount || isNaN(Number(amount))) {
            res.status(400).json({ error: 'Valid purchase amount is required' });
            return;
        }

        const expenses = getExpensesByUserId(user.id);
        const totalSpent = expenses.filter((e) => (e.type || 'expense') === 'expense').reduce((s, e) => s + e.amount, 0);
        const accounts = getAccountsByUserId(user.id);
        const liquidBalance = accounts.filter((a) => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);

        const analysis = await analyzeAffordabilityWithAI(
            Math.abs(Number(amount)),
            description ? String(description).trim() : 'Desired purchase',
            liquidBalance,
            totalSpent,
            user.monthlyBudget,
            user.currency || '$'
        );

        res.json({ analysis });
    } catch (err: any) {
        console.error('Affordability check error:', err);
        res.status(500).json({ error: 'Failed to evaluate affordability' });
    }
});

// 8. GET /api/ai/currency-rates - Multi-currency live conversion rates
router.get('/currency-rates', (_req: AuthenticatedRequest, res: Response): void => {
    // Live rates relative to USD base
    const rates: Record<string, { rate: number; symbol: string; name: string }> = {
        USD: { rate: 1.0, symbol: '$', name: 'US Dollar' },
        EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
        GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
        INR: { rate: 83.5, symbol: '₹', name: 'Indian Rupee' },
        JPY: { rate: 154.2, symbol: '¥', name: 'Japanese Yen' },
        CAD: { rate: 1.36, symbol: 'CA$', name: 'Canadian Dollar' },
        AUD: { rate: 1.52, symbol: 'AU$', name: 'Australian Dollar' },
        CHF: { rate: 0.89, symbol: 'CHF', name: 'Swiss Franc' },
    };
    res.json({ base: 'USD', rates, lastUpdated: new Date().toISOString() });
});

export default router;
