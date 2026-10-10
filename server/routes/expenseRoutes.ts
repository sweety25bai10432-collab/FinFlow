import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import {
    getExpensesByUserId,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    getAccountsByUserId,
    createAccount,
    getSubscriptionsByUserId,
    createSubscription,
    cancelSubscription,
    getSavingsGoalsByUserId,
    updateSavingsGoal,
    createSavingsGoal,
    getAlertsByUserId,
    dismissAlert,
} from '../db.js';
import {
    ExpenseCategory,
    PaymentMethod,
    EXPENSE_CATEGORIES,
    DailyReport,
    WeeklyReport,
    SpendingSummary,
    CategoryBreakdown,
    TransactionType,
} from '../types.js';

const router = Router();
router.use(requireAuth);

function formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
}

// 1. GET /api/expenses - List user expenses with filtering, search & sort
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
    try {
        const userId = req.user!.id;
        let expenses = getExpensesByUserId(userId);

        const { search, category, startDate, endDate, sort, type, account, tag } = req.query as Record<string, string>;

        // Filter by type: 'expense' or 'income'
        if (type && type !== 'all') {
            expenses = expenses.filter((e) => (e.type || 'expense') === type);
        }

        // Filter by account
        if (account && account !== 'All') {
            expenses = expenses.filter((e) => e.account === account);
        }

        // Filter by tag
        if (tag && tag !== 'All') {
            expenses = expenses.filter((e) => Array.isArray(e.tags) && e.tags.includes(tag));
        }

        // Filter by search text
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            expenses = expenses.filter(
                (e) =>
                    e.description.toLowerCase().includes(q) ||
                    e.category.toLowerCase().includes(q) ||
                    (e.account && e.account.toLowerCase().includes(q)) ||
                    (Array.isArray(e.tags) && e.tags.some((t) => t.toLowerCase().includes(q))) ||
                    (e.notes && e.notes.toLowerCase().includes(q))
            );
        }

        // Filter by category
        if (category && category !== 'All') {
            expenses = expenses.filter((e) => e.category === category);
        }

        // Filter by date range
        if (startDate) {
            expenses = expenses.filter((e) => e.date >= startDate);
        }
        if (endDate) {
            expenses = expenses.filter((e) => e.date <= endDate);
        }

        // Sort
        if (sort === 'date_asc') {
            expenses.sort((a, b) => a.date.localeCompare(b.date));
        } else if (sort === 'amount_desc') {
            expenses.sort((a, b) => b.amount - a.amount);
        } else if (sort === 'amount_asc') {
            expenses.sort((a, b) => a.amount - b.amount);
        } else {
            expenses.sort((a, b) => b.date.localeCompare(a.date));
        }

        res.json({ expenses });
    } catch (err: any) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// 2. GET /api/expenses/summary - Dashboard Summary with Income vs Expense, Cash Flow & Alerts
router.get('/summary', (req: AuthenticatedRequest, res: Response): void => {
    try {
        const user = req.user!;
        const allTransactions = getExpensesByUserId(user.id);
        const now = new Date();
        const todayStr = formatDate(now);

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        // Split expenses vs incomes
        const expenseOnly = allTransactions.filter((e) => (e.type || 'expense') === 'expense');
        const incomeOnly = allTransactions.filter((e) => e.type === 'income');

        const totalSpending = expenseOnly.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = incomeOnly.reduce((sum, e) => sum + e.amount, 0);
        const netSavings = totalIncome - totalSpending;
        const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

        const todaySpending = expenseOnly
            .filter((e) => e.date === todayStr)
            .reduce((sum, e) => sum + e.amount, 0);

        const yesterdaySpending = expenseOnly
            .filter((e) => e.date === yesterdayStr)
            .reduce((sum, e) => sum + e.amount, 0);

        const currentDay = now.getDate();
        const dailyAverage = currentDay > 0 ? totalSpending / currentDay : 0;

        // Last 7 days report
        const recentDaysReport: DailyReport[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dStr = formatDate(d);

            const dayExpenses = expenseOnly.filter((e) => e.date === dStr);
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

            const catCounts: Record<string, number> = {};
            dayExpenses.forEach((e) => {
                catCounts[e.category] = (catCounts[e.category] || 0) + e.amount;
            });
            const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

            recentDaysReport.push({
                date: dStr,
                total: Math.round(dayTotal * 100) / 100,
                count: dayExpenses.length,
                topCategory,
            });
        }

        // Current Week Report (Mon - Sun)
        const distToMon = (now.getDay() + 6) % 7;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - distToMon);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekStartStr = formatDate(weekStart);
        const weekEndStr = formatDate(weekEnd);

        const currentWeekExpenses = expenseOnly.filter(
            (e) => e.date >= weekStartStr && e.date <= weekEndStr
        );
        const currentWeekTotal = currentWeekExpenses.reduce((sum, e) => sum + e.amount, 0);

        const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dailyBreakdown = daysName.map((day, idx) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + idx);
            const dateStr = formatDate(d);
            const dayTotal = expenseOnly
                .filter((e) => e.date === dateStr)
                .reduce((sum, e) => sum + e.amount, 0);
            return {
                day,
                date: dateStr,
                amount: Math.round(dayTotal * 100) / 100,
            };
        });

        // Category Breakdown with specific category budgets
        const categoryTotals: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};
        expenseOnly.forEach((e) => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
            categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
        });

        const categoryBudgets = user.categoryBudgets || {};
        const categoryBreakdown: CategoryBreakdown[] = EXPENSE_CATEGORIES.map((cat) => {
            const amount = categoryTotals[cat] || 0;
            const count = categoryCounts[cat] || 0;
            const percentage = totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0;
            const budgetLimit = categoryBudgets[cat] || 0;
            const budgetUtilization = budgetLimit > 0 ? Math.round((amount / budgetLimit) * 100) : 0;
            return {
                category: cat,
                amount: Math.round(amount * 100) / 100,
                percentage,
                count,
                budgetLimit,
                budgetUtilization,
            };
        })
            .filter((c) => c.amount > 0 || (c.budgetLimit && c.budgetLimit > 0))
            .sort((a, b) => b.amount - a.amount);

        // Payment methods
        const paymentTotals: Record<string, number> = {};
        expenseOnly.forEach((e) => {
            paymentTotals[e.paymentMethod] = (paymentTotals[e.paymentMethod] || 0) + e.amount;
        });

        const paymentBreakdown = Object.entries(paymentTotals).map(([method, amount]) => ({
            method: method as PaymentMethod,
            amount: Math.round(amount * 100) / 100,
            percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
        }));

        const accounts = getAccountsByUserId(user.id);
        const subscriptions = getSubscriptionsByUserId(user.id);
        const savingsGoals = getSavingsGoalsByUserId(user.id);
        const alerts = getAlertsByUserId(user.id);

        const activeSubs = subscriptions.filter((s) => s.status === 'active');
        const upcomingBillsTotal = activeSubs.reduce((sum, s) => sum + s.amount, 0);

        const summary: SpendingSummary = {
            totalSpending: Math.round(totalSpending * 100) / 100,
            totalIncome: Math.round(totalIncome * 100) / 100,
            netSavings: Math.round(netSavings * 100) / 100,
            savingsRate,
            expenseCount: expenseOnly.length,
            monthlyBudget: user.monthlyBudget,
            budgetUtilizationPercentage:
                user.monthlyBudget > 0 ? Math.round((totalSpending / user.monthlyBudget) * 100) : 0,
            remainingBudget: Math.max(0, user.monthlyBudget - totalSpending),
            currency: user.currency || '$',
            todaySpending: Math.round(todaySpending * 100) / 100,
            yesterdaySpending: Math.round(yesterdaySpending * 100) / 100,
            dailyAverage: Math.round(dailyAverage * 100) / 100,
            recentDaysReport,
            currentWeekReport: {
                weekStart: weekStartStr,
                weekEnd: weekEndStr,
                total: Math.round(currentWeekTotal * 100) / 100,
                dailyBreakdown,
                previousWeekTotal: 0,
                changePercentage: 0,
            },
            categoryBreakdown,
            paymentBreakdown,
            activeSubscriptionsCount: activeSubs.length,
            upcomingBillsTotal: Math.round(upcomingBillsTotal * 100) / 100,
            alerts,
            accounts,
            savingsGoals,
        };

        res.json({ summary });
    } catch (err: any) {
        console.error('Error calculating summary:', err);
        res.status(500).json({ error: 'Failed to generate spending summary' });
    }
});

// 3. POST /api/expenses - Add transaction (expense or income)
router.post('/', (req: AuthenticatedRequest, res: Response): void => {
    try {
        const {
            description,
            amount,
            date,
            category,
            paymentMethod,
            type = 'expense',
            account,
            tags,
            isRecurring,
            recurringFrequency,
            notes,
            receiptItems,
            taxAmount,
            aiCategorized,
        } = req.body;

        if (!description || !amount || !date) {
            res.status(400).json({ error: 'Description, amount, and date are required' });
            return;
        }

        const expense = createExpense({
            userId: req.user!.id,
            type: type === 'income' ? 'income' : 'expense',
            description: description.trim(),
            amount: Math.abs(Number(amount)),
            date: String(date),
            category: EXPENSE_CATEGORIES.includes(category) ? category : 'Other',
            paymentMethod: paymentMethod || 'Credit Card',
            account: account || 'Primary Account',
            tags: Array.isArray(tags) ? tags : [],
            isRecurring: Boolean(isRecurring),
            recurringFrequency,
            notes,
            receiptItems,
            taxAmount: taxAmount ? Number(taxAmount) : undefined,
            aiCategorized: Boolean(aiCategorized),
        });

        res.status(201).json({ message: 'Transaction created successfully', expense });
    } catch (err: any) {
        console.error('Error creating expense:', err);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// 4. PUT /api/expenses/:id - Edit expense
router.put('/:id', (req: AuthenticatedRequest, res: Response): void => {
    try {
        const { id } = req.params;
        const updated = updateExpense(id, req.user!.id, req.body);
        if (!updated) {
            res.status(404).json({ error: 'Expense not found' });
            return;
        }
        res.json({ message: 'Expense updated successfully', expense: updated });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// 5. DELETE /api/expenses/:id - Delete expense
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
    try {
        const { id } = req.params;
        const deleted = deleteExpense(id, req.user!.id);
        if (!deleted) {
            res.status(404).json({ error: 'Expense not found' });
            return;
        }
        res.json({ message: 'Expense deleted successfully', id });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// 6. Accounts Routes
router.get('/accounts', (req: AuthenticatedRequest, res: Response): void => {
    const accounts = getAccountsByUserId(req.user!.id);
    res.json({ accounts });
});

router.post('/accounts', (req: AuthenticatedRequest, res: Response): void => {
    const { name, type, balance, accountNumberLast4, color } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Account name is required' });
        return;
    }
    const account = createAccount({
        userId: req.user!.id,
        name: name.trim(),
        type: type || 'checking',
        balance: Number(balance) || 0,
        accountNumberLast4,
        color: color || '#3b82f6',
    });
    res.status(201).json({ message: 'Account created', account });
});

// 7. Subscriptions Routes
router.get('/subscriptions', (req: AuthenticatedRequest, res: Response): void => {
    const subscriptions = getSubscriptionsByUserId(req.user!.id);
    res.json({ subscriptions });
});

router.post('/subscriptions', (req: AuthenticatedRequest, res: Response): void => {
    const { name, amount, category, billingCycle, nextBillingDate, notes } = req.body;
    if (!name || !amount) {
        res.status(400).json({ error: 'Subscription name and amount are required' });
        return;
    }
    const subscription = createSubscription({
        userId: req.user!.id,
        name: name.trim(),
        amount: Number(amount),
        category: category || 'Entertainment & Leisure',
        billingCycle: billingCycle || 'monthly',
        nextBillingDate: nextBillingDate || formatDate(new Date()),
        status: 'active',
        autoRenewal: true,
        notes,
    });
    res.status(201).json({ message: 'Subscription added', subscription });
});

router.post('/subscriptions/:id/cancel', (req: AuthenticatedRequest, res: Response): void => {
    const success = cancelSubscription(req.params.id, req.user!.id);
    if (!success) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    res.json({ message: 'Subscription marked as cancelled', id: req.params.id });
});

// 8. Savings Goals Routes
router.get('/savings-goals', (req: AuthenticatedRequest, res: Response): void => {
    const goals = getSavingsGoalsByUserId(req.user!.id);
    res.json({ goals });
});

router.post('/savings-goals', (req: AuthenticatedRequest, res: Response): void => {
    const { title, targetAmount, currentAmount, deadline, category, color } = req.body;
    if (!title || !targetAmount) {
        res.status(400).json({ error: 'Goal title and target amount are required' });
        return;
    }
    const goal = createSavingsGoal({
        userId: req.user!.id,
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount) || 0,
        deadline: deadline || '2027-01-01',
        category: category || 'Savings',
        color: color || '#10b981',
    });
    res.status(201).json({ message: 'Goal created', goal });
});

router.post('/savings-goals/:id/contribute', (req: AuthenticatedRequest, res: Response): void => {
    const { amount } = req.body;
    const goal = updateSavingsGoal(req.params.id, req.user!.id, Number(amount) || 0);
    if (!goal) {
        res.status(404).json({ error: 'Goal not found' });
        return;
    }
    res.json({ message: 'Contribution added', goal });
});

// 9. Dismiss Alert
router.post('/alerts/:id/dismiss', (req: AuthenticatedRequest, res: Response): void => {
    dismissAlert(req.params.id);
    res.json({ message: 'Alert dismissed' });
});

export default router;
