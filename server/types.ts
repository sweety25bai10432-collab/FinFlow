export type ExpenseCategory =
    | 'Food & Dining'
    | 'Shopping & Retail'
    | 'Housing & Rent'
    | 'Transportation'
    | 'Utilities & Bills'
    | 'Healthcare & Medical'
    | 'Entertainment & Leisure'
    | 'Travel & Vacation'
    | 'Education & Learning'
    | 'Personal Care & Fitness'
    | 'Investments & Savings'
    | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    'Food & Dining',
    'Shopping & Retail',
    'Housing & Rent',
    'Transportation',
    'Utilities & Bills',
    'Healthcare & Medical',
    'Entertainment & Leisure',
    'Travel & Vacation',
    'Education & Learning',
    'Personal Care & Fitness',
    'Investments & Savings',
    'Other',
];

export type PaymentMethod =
    | 'Credit Card'
    | 'Debit Card'
    | 'Cash'
    | 'Bank Transfer'
    | 'Digital Wallet'
    | 'Other';

export type TransactionType = 'expense' | 'income';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    monthlyBudget: number;
    categoryBudgets?: Record<string, number>;
    currency: string;
    pinCode?: string;
    createdAt: string;
}

export interface Expense {
    id: string;
    userId: string;
    type?: TransactionType; // 'expense' or 'income'
    description: string;
    amount: number;
    category: ExpenseCategory;
    date: string; // YYYY-MM-DD
    paymentMethod: PaymentMethod;
    account?: string; // e.g. 'Checking Account', 'Chase Credit Card'
    tags?: string[]; // e.g. ['#vacation', '#business', '#reimbursable']
    isRecurring?: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
    nextDueDate?: string;
    notes?: string;
    receiptItems?: { name: string; price: number }[];
    taxAmount?: number;
    aiCategorized?: boolean;
    createdAt: string;
}

export interface Account {
    id: string;
    userId: string;
    name: string;
    type: 'checking' | 'savings' | 'credit' | 'cash' | 'digital_wallet';
    balance: number;
    accountNumberLast4?: string;
    color: string;
}

export interface Subscription {
    id: string;
    userId: string;
    name: string;
    amount: number;
    category: ExpenseCategory;
    billingCycle: 'monthly' | 'yearly' | 'weekly';
    nextBillingDate: string;
    status: 'active' | 'review' | 'cancelled';
    autoRenewal: boolean;
    notes?: string;
}

export interface SavingsGoal {
    id: string;
    userId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: string;
    color: string;
}

export interface SmartAlert {
    id: string;
    type: 'overbudget' | 'upcoming_bill' | 'anomaly' | 'tip';
    severity: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    date: string;
    isRead?: boolean;
}

export interface DailyReport {
    date: string;
    total: number;
    count: number;
    topCategory?: string;
}

export interface WeeklyReport {
    weekStart: string; // YYYY-MM-DD
    weekEnd: string;
    total: number;
    dailyBreakdown: { day: string; date: string; amount: number }[];
    previousWeekTotal: number;
    changePercentage: number;
}

export interface CategoryBreakdown {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
    count: number;
    budgetLimit?: number;
    budgetUtilization?: number;
}

export interface SpendingSummary {
    totalSpending: number;
    totalIncome: number;
    netSavings: number;
    savingsRate: number;
    expenseCount: number;
    monthlyBudget: number;
    budgetUtilizationPercentage: number;
    remainingBudget: number;
    currency: string;

    // Daily & Weekly reports
    todaySpending: number;
    yesterdaySpending: number;
    dailyAverage: number;
    recentDaysReport: DailyReport[];
    currentWeekReport: WeeklyReport;

    // Breakdown
    categoryBreakdown: CategoryBreakdown[];
    paymentBreakdown: { method: PaymentMethod; amount: number; percentage: number }[];

    // Smart elements
    activeSubscriptionsCount: number;
    upcomingBillsTotal: number;
    alerts: SmartAlert[];
    accounts: Account[];
    savingsGoals: SavingsGoal[];
}

export interface ReceiptScanResult {
    merchant: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    paymentMethod: PaymentMethod;
    tax?: number;
    tip?: number;
    items?: { name: string; price: number }[];
    confidence: number;
    rawText?: string;
}

export interface BankNotificationScanResult {
    merchant: string;
    amount: number;
    account: string;
    date: string;
    category: ExpenseCategory;
    type: TransactionType;
    confidence: number;
    detectedAlert: string;
}

export interface AICategoryResponse {
    category: ExpenseCategory;
    confidence: number;
    reasoning: string;
    suggestedTags?: string[];
}

export interface AISpendingAnalysis {
    executiveSummary: string;
    predictedMonthEndSpending: number;
    predictionConfidence: 'High' | 'Medium' | 'Low';
    budgetRiskLevel: 'Safe' | 'Moderate' | 'High' | 'Critical';
    keyObservations: string[];
    actionableSavingsTips: {
        tip: string;
        category: string;
        estimatedMonthlySavings: number;
    }[];
    anomalyAlerts: {
        title: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
    }[];
    subscriptionCancellations?: {
        name: string;
        estimatedMonthlyCost: number;
        reason: string;
    }[];
    analysisTimestamp: string;
}

export interface VoiceCommandResult {
    intent: 'add_expense' | 'query_spending' | 'financial_advice' | 'general';
    spokenResponse: string;
    displayResponse: string;
    expenseData?: {
        description: string;
        amount: number;
        category: ExpenseCategory;
        date: string;
        paymentMethod: PaymentMethod;
        tags?: string[];
        account?: string;
    };
    addedExpense?: Expense;
}

export interface AffordabilityAnalysis {
    canAfford: boolean;
    verdict: 'Comfortable' | 'Caution' | 'Not Recommended';
    reasoning: string;
    impactOnBudget: string;
    recommendedAlternative: string;
}
