import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
    User,
    Expense,
    Account,
    Subscription,
    SavingsGoal,
    SmartAlert,
    EXPENSE_CATEGORIES,
} from './types.js';

interface DatabaseSchema {
    users: User[];
    expenses: Expense[];
    accounts: Account[];
    subscriptions: Subscription[];
    savingsGoals: SavingsGoal[];
    alerts: SmartAlert[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'expenses_db.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: DatabaseSchema = {
    users: [],
    expenses: [],
    accounts: [],
    subscriptions: [],
    savingsGoals: [],
    alerts: [],
};

const seedDemoData = async () => {
    const demoUserId = 'demo-user-123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser: User = {
        id: demoUserId,
        name: 'Alex Johnson',
        email: 'demo@finflow.ai',
        passwordHash,
        monthlyBudget: 3500,
        categoryBudgets: {
            'Food & Dining': 650,
            'Shopping & Retail': 400,
            'Housing & Rent': 1600,
            'Transportation': 300,
            'Utilities & Bills': 250,
            'Entertainment & Leisure': 200,
            'Personal Care & Fitness': 150,
        },
        currency: '$',
        createdAt: new Date().toISOString(),
    };

    const today = new Date();
    const getOffsetDate = (offsetDays: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() - offsetDays);
        return d.toISOString().split('T')[0];
    };

    const sampleAccounts: Account[] = [
        {
            id: 'acc-1',
            userId: demoUserId,
            name: 'Chase Total Checking',
            type: 'checking',
            balance: 4850.25,
            accountNumberLast4: '4821',
            color: '#3b82f6',
        },
        {
            id: 'acc-2',
            userId: demoUserId,
            name: 'Amex Gold Preferred Card',
            type: 'credit',
            balance: -1124.50,
            accountNumberLast4: '9012',
            color: '#f59e0b',
        },
        {
            id: 'acc-3',
            userId: demoUserId,
            name: 'High Yield Savings (Ally)',
            type: 'savings',
            balance: 14200.00,
            accountNumberLast4: '3318',
            color: '#10b981',
        },
        {
            id: 'acc-4',
            userId: demoUserId,
            name: 'Cash Physical Wallet',
            type: 'cash',
            balance: 180.00,
            color: '#8b5cf6',
        },
    ];

    const sampleSubscriptions: Subscription[] = [
        {
            id: 'sub-1',
            userId: demoUserId,
            name: 'Netflix Premium 4K',
            amount: 22.99,
            category: 'Entertainment & Leisure',
            billingCycle: 'monthly',
            nextBillingDate: getOffsetDate(-4), // 4 days from now
            status: 'active',
            autoRenewal: true,
            notes: 'Family plan stream',
        },
        {
            id: 'sub-2',
            userId: demoUserId,
            name: 'Spotify Premium Family',
            amount: 16.99,
            category: 'Entertainment & Leisure',
            billingCycle: 'monthly',
            nextBillingDate: getOffsetDate(-11),
            status: 'active',
            autoRenewal: true,
        },
        {
            id: 'sub-3',
            userId: demoUserId,
            name: 'Equinox Gym & Spa',
            amount: 145.00,
            category: 'Personal Care & Fitness',
            billingCycle: 'monthly',
            nextBillingDate: getOffsetDate(-7),
            status: 'active',
            autoRenewal: true,
        },
        {
            id: 'sub-4',
            userId: demoUserId,
            name: 'Claude Pro + AI Assistant',
            amount: 20.00,
            category: 'Education & Learning',
            billingCycle: 'monthly',
            nextBillingDate: getOffsetDate(-15),
            status: 'review',
            autoRenewal: false,
            notes: 'Consider switching or pausing',
        },
    ];

    const sampleSavingsGoals: SavingsGoal[] = [
        {
            id: 'goal-1',
            userId: demoUserId,
            title: '6-Month Emergency Safety Fund',
            targetAmount: 18000,
            currentAmount: 14200,
            deadline: '2026-12-31',
            category: 'Security',
            color: '#10b981',
        },
        {
            id: 'goal-2',
            userId: demoUserId,
            title: 'Tokyo Spring Vacation 🌸',
            targetAmount: 3500,
            currentAmount: 2150,
            deadline: '2027-04-10',
            category: 'Travel',
            color: '#f43f5e',
        },
        {
            id: 'goal-3',
            userId: demoUserId,
            title: 'M3 MacBook Pro Upgrade',
            targetAmount: 2200,
            currentAmount: 1850,
            deadline: '2026-11-25',
            category: 'Tech',
            color: '#6366f1',
        },
    ];

    const sampleAlerts: SmartAlert[] = [
        {
            id: 'alt-1',
            type: 'overbudget',
            severity: 'warning',
            title: 'Food & Dining at 88% of limit',
            message: 'You have spent $572 of your $650 dining budget with 21 days left in the month.',
            date: getOffsetDate(1),
        },
        {
            id: 'alt-2',
            type: 'upcoming_bill',
            severity: 'info',
            title: 'Netflix Renewal in 4 days',
            message: 'Upcoming automatic charge of $22.99 on your Amex Gold Card.',
            date: getOffsetDate(0),
        },
        {
            id: 'alt-3',
            type: 'anomaly',
            severity: 'warning',
            title: 'Higher Than Average Utilities',
            message: 'City Power bill was $175 vs 3-month average of $115.',
            date: getOffsetDate(3),
        },
    ];

    const sampleExpenses: Expense[] = [
        // Income Transactions
        {
            id: 'inc-1',
            userId: demoUserId,
            type: 'income',
            description: 'Bi-Weekly Tech Salary (Direct Deposit)',
            amount: 4250.00,
            category: 'Investments & Savings',
            date: getOffsetDate(5),
            paymentMethod: 'Bank Transfer',
            account: 'Chase Total Checking',
            tags: ['#salary', '#paycheck'],
            notes: 'Monthly regular employment earnings',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
            id: 'inc-2',
            userId: demoUserId,
            type: 'income',
            description: 'Freelance UX Architecture Consulting',
            amount: 950.00,
            category: 'Investments & Savings',
            date: getOffsetDate(12),
            paymentMethod: 'Bank Transfer',
            account: 'Chase Total Checking',
            tags: ['#freelance', '#sidegig'],
            notes: 'Design sprint milestone',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        },

        // Expenses with tags, accounts, and recurring details
        {
            id: 'exp-1',
            userId: demoUserId,
            type: 'expense',
            description: 'Trader Joe\'s Grocery Haul',
            amount: 114.50,
            category: 'Food & Dining',
            date: getOffsetDate(0),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#groceries', '#food'],
            notes: 'Weekly fresh fruits, veggies, and pantry items',
            receiptItems: [
                { name: 'Organic Bananas & Berries', price: 14.20 },
                { name: 'Sourdough & Greek Yogurt', price: 18.50 },
                { name: 'Salmon Filets & Veggies', price: 42.00 },
                { name: 'Pantry Goods & Snacks', price: 39.80 },
            ],
            taxAmount: 7.50,
            aiCategorized: true,
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
            id: 'exp-2',
            userId: demoUserId,
            type: 'expense',
            description: 'Philz Mint Mojito Iced Coffee',
            amount: 9.75,
            category: 'Food & Dining',
            date: getOffsetDate(0),
            paymentMethod: 'Digital Wallet',
            account: 'Cash Physical Wallet',
            tags: ['#coffee', '#discretionary'],
            notes: 'Morning coffee with pastry',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
        {
            id: 'exp-3',
            userId: demoUserId,
            type: 'expense',
            description: 'Shell Clean Gasoline Fuel',
            amount: 52.80,
            category: 'Transportation',
            date: getOffsetDate(1),
            paymentMethod: 'Debit Card',
            account: 'Chase Total Checking',
            tags: ['#fuel', '#car'],
            notes: '11.5 gallons regular fuel',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: 'exp-4',
            userId: demoUserId,
            type: 'expense',
            description: 'Sweetgreen Warm Harvest Bowl',
            amount: 18.45,
            category: 'Food & Dining',
            date: getOffsetDate(1),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#lunch', '#healthy'],
            notes: 'Quick workday lunch',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
        },
        {
            id: 'exp-5',
            userId: demoUserId,
            type: 'expense',
            description: 'Downtown Loft Monthly Rent',
            amount: 1550.00,
            category: 'Housing & Rent',
            date: getOffsetDate(2),
            paymentMethod: 'Bank Transfer',
            account: 'Chase Total Checking',
            tags: ['#rent', '#fixed'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'Apartment #402 rent',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
            id: 'exp-6',
            userId: demoUserId,
            type: 'expense',
            description: 'Equinox Gym Monthly Membership',
            amount: 145.00,
            category: 'Personal Care & Fitness',
            date: getOffsetDate(2),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#fitness', '#subscription'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'All-access fitness membership',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 2.3).toISOString(),
        },
        {
            id: 'exp-7',
            userId: demoUserId,
            type: 'expense',
            description: 'Uber Ride to SFO Airport',
            amount: 38.60,
            category: 'Transportation',
            date: getOffsetDate(3),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#travel', '#rideshare', '#reimbursable'],
            notes: 'Airport terminal ride',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
            id: 'exp-8',
            userId: demoUserId,
            type: 'expense',
            description: 'Chipotle Mexican Grill Burrito Bowl',
            amount: 14.20,
            category: 'Food & Dining',
            date: getOffsetDate(4),
            paymentMethod: 'Debit Card',
            account: 'Chase Total Checking',
            tags: ['#dinner'],
            notes: 'Chicken bowl with guacamole',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
            id: 'exp-9',
            userId: demoUserId,
            type: 'expense',
            description: 'Netflix 4K Ultra Subscription',
            amount: 22.99,
            category: 'Entertainment & Leisure',
            date: getOffsetDate(5),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#subscription', '#streaming'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'Monthly 4K streaming plan',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
            id: 'exp-10',
            userId: demoUserId,
            type: 'expense',
            description: 'Amazon Prime Order: Ergonomic Mouse',
            amount: 68.50,
            category: 'Shopping & Retail',
            date: getOffsetDate(6),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#work', '#electronics'],
            notes: 'Logitech wireless ergonomic mouse',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        },
        {
            id: 'exp-11',
            userId: demoUserId,
            type: 'expense',
            description: 'PG&E Electric & Clean Energy Bill',
            amount: 112.40,
            category: 'Utilities & Bills',
            date: getOffsetDate(7),
            paymentMethod: 'Bank Transfer',
            account: 'Chase Total Checking',
            tags: ['#utilities', '#electric'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'Residential electric bill',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
            id: 'exp-12',
            userId: demoUserId,
            type: 'expense',
            description: 'Target Home Supplies & Essentials',
            amount: 86.30,
            category: 'Shopping & Retail',
            date: getOffsetDate(9),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#home', '#shopping'],
            notes: 'Cleaning essentials & kitchen towels',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        },
        {
            id: 'exp-13',
            userId: demoUserId,
            type: 'expense',
            description: 'Sonic Gigabit Fiber Internet',
            amount: 65.00,
            category: 'Utilities & Bills',
            date: getOffsetDate(11),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#internet', '#utilities'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'High speed fiber home connection',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
        },
        {
            id: 'exp-14',
            userId: demoUserId,
            type: 'expense',
            description: 'Delta Airlines Flight Ticket',
            amount: 285.00,
            category: 'Travel & Vacation',
            date: getOffsetDate(15),
            paymentMethod: 'Credit Card',
            account: 'Amex Gold Preferred Card',
            tags: ['#flight', '#vacation'],
            notes: 'Trip to Seattle conference',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        },
        {
            id: 'exp-15',
            userId: demoUserId,
            type: 'expense',
            description: 'Vanguard Index Fund Automatic Deposit',
            amount: 300.00,
            category: 'Investments & Savings',
            date: getOffsetDate(18),
            paymentMethod: 'Bank Transfer',
            account: 'Chase Total Checking',
            tags: ['#investing', '#etf'],
            isRecurring: true,
            recurringFrequency: 'monthly',
            notes: 'Monthly automated VOO ETF allocation',
            aiCategorized: true,
            createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        },
    ];

    db = {
        users: [demoUser],
        expenses: sampleExpenses,
        accounts: sampleAccounts,
        subscriptions: sampleSubscriptions,
        savingsGoals: sampleSavingsGoals,
        alerts: sampleAlerts,
    };
    saveDatabase();
};

export const loadDatabase = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf-8');
            db = JSON.parse(data);
            if (!Array.isArray(db.users)) db.users = [];
            if (!Array.isArray(db.expenses)) db.expenses = [];
            if (!Array.isArray(db.accounts)) db.accounts = [];
            if (!Array.isArray(db.subscriptions)) db.subscriptions = [];
            if (!Array.isArray(db.savingsGoals)) db.savingsGoals = [];
            if (!Array.isArray(db.alerts)) db.alerts = [];

            if (db.users.length === 0 || db.accounts.length === 0) {
                seedDemoData();
            }
        } else {
            seedDemoData();
        }
    } catch (err) {
        console.error('Error loading database, re-seeding:', err);
        seedDemoData();
    }
};

export const saveDatabase = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error persisting database:', err);
    }
};

// User Operations
export const findUserByEmail = (email: string): User | undefined => {
    return db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
};

export const findUserById = (id: string): User | undefined => {
    return db.users.find((u) => u.id === id);
};

export const createUser = async (
    name: string,
    email: string,
    passwordPlain: string,
    monthlyBudget: number = 3000,
    currency: string = '$'
): Promise<User> => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        monthlyBudget: Number(monthlyBudget) || 3000,
        categoryBudgets: {
            'Food & Dining': 600,
            'Shopping & Retail': 350,
            'Housing & Rent': 1500,
            'Transportation': 250,
            'Utilities & Bills': 200,
        },
        currency: currency || '$',
        createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Also seed default initial accounts & savings goals for new user
    db.accounts.push(
        { id: `acc-${Date.now()}-1`, userId: newUser.id, name: 'Main Checking Account', type: 'checking', balance: 2500, color: '#3b82f6' },
        { id: `acc-${Date.now()}-2`, userId: newUser.id, name: 'Primary Credit Card', type: 'credit', balance: -450, color: '#f59e0b' },
        { id: `acc-${Date.now()}-3`, userId: newUser.id, name: 'Emergency Savings', type: 'savings', balance: 5000, color: '#10b981' },
        { id: `acc-${Date.now()}-4`, userId: newUser.id, name: 'Cash Wallet', type: 'cash', balance: 100, color: '#8b5cf6' }
    );

    db.savingsGoals.push(
        { id: `goal-${Date.now()}-1`, userId: newUser.id, title: 'Emergency Reserve', targetAmount: 10000, currentAmount: 5000, deadline: '2026-12-31', category: 'Security', color: '#10b981' }
    );

    saveDatabase();
    return newUser;
};

export const updateUserBudget = (
    userId: string,
    monthlyBudget: number,
    currency?: string,
    categoryBudgets?: Record<string, number>,
    pinCode?: string
): User | null => {
    const user = findUserById(userId);
    if (!user) return null;
    user.monthlyBudget = Number(monthlyBudget);
    if (currency) user.currency = currency;
    if (categoryBudgets) user.categoryBudgets = categoryBudgets;
    if (pinCode !== undefined) user.pinCode = pinCode;
    saveDatabase();
    return user;
};

// Expense & Income Operations
export const getExpensesByUserId = (userId: string): Expense[] => {
    return db.expenses.filter((e) => e.userId === userId);
};

export const getExpenseById = (id: string, userId: string): Expense | undefined => {
    return db.expenses.find((e) => e.id === id && e.userId === userId);
};

export const createExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>): Expense => {
    const newExpense: Expense = {
        ...expenseData,
        type: expenseData.type || 'expense',
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
    };

    db.expenses.unshift(newExpense);

    // Update corresponding account balance if account is specified
    if (newExpense.account) {
        const acc = db.accounts.find((a) => a.userId === newExpense.userId && a.name === newExpense.account);
        if (acc) {
            if (newExpense.type === 'income') {
                acc.balance += newExpense.amount;
            } else {
                acc.balance -= newExpense.amount;
            }
        }
    }

    saveDatabase();
    return newExpense;
};

export const updateExpense = (
    id: string,
    userId: string,
    updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
): Expense | null => {
    const index = db.expenses.findIndex((e) => e.id === id && e.userId === userId);
    if (index === -1) return null;

    db.expenses[index] = {
        ...db.expenses[index],
        ...updates,
    };

    saveDatabase();
    return db.expenses[index];
};

export const deleteExpense = (id: string, userId: string): boolean => {
    const initialLength = db.expenses.length;
    db.expenses = db.expenses.filter((e) => !(e.id === id && e.userId === userId));
    const deleted = db.expenses.length < initialLength;
    if (deleted) saveDatabase();
    return deleted;
};

// Accounts Operations
export const getAccountsByUserId = (userId: string): Account[] => {
    return db.accounts.filter((a) => a.userId === userId);
};

export const createAccount = (accountData: Omit<Account, 'id'>): Account => {
    const newAccount: Account = {
        ...accountData,
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    db.accounts.push(newAccount);
    saveDatabase();
    return newAccount;
};

// Subscriptions Operations
export const getSubscriptionsByUserId = (userId: string): Subscription[] => {
    return db.subscriptions.filter((s) => s.userId === userId);
};

export const createSubscription = (subData: Omit<Subscription, 'id'>): Subscription => {
    const newSub: Subscription = {
        ...subData,
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    db.subscriptions.push(newSub);
    saveDatabase();
    return newSub;
};

export const cancelSubscription = (id: string, userId: string): boolean => {
    const sub = db.subscriptions.find((s) => s.id === id && s.userId === userId);
    if (!sub) return false;
    sub.status = 'cancelled';
    saveDatabase();
    return true;
};

// Savings Goals Operations
export const getSavingsGoalsByUserId = (userId: string): SavingsGoal[] => {
    return db.savingsGoals.filter((g) => g.userId === userId);
};

export const updateSavingsGoal = (
    id: string,
    userId: string,
    addAmount: number
): SavingsGoal | null => {
    const goal = db.savingsGoals.find((g) => g.id === id && g.userId === userId);
    if (!goal) return null;
    goal.currentAmount += addAmount;
    saveDatabase();
    return goal;
};

export const createSavingsGoal = (goalData: Omit<SavingsGoal, 'id'>): SavingsGoal => {
    const newGoal: SavingsGoal = {
        ...goalData,
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    db.savingsGoals.push(newGoal);
    saveDatabase();
    return newGoal;
};

// Smart Alerts
export const getAlertsByUserId = (_userId: string): SmartAlert[] => {
    return db.alerts;
};

export const dismissAlert = (id: string): boolean => {
    const idx = db.alerts.findIndex((a) => a.id === id);
    if (idx !== -1) {
        db.alerts.splice(idx, 1);
        saveDatabase();
        return true;
    }
    return false;
};

// Initialize DB on module import
loadDatabase();
