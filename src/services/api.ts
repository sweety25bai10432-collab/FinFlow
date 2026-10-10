import {
    User,
    Expense,
    SpendingSummary,
    AICategoryResponse,
    AISpendingAnalysis,
    VoiceCommandResult,
    ExpenseCategory,
    PaymentMethod,
    Account,
    Subscription,
    SavingsGoal,
    ReceiptScanResult,
    BankNotificationScanResult,
    AffordabilityAnalysis,
} from '../types.js';

const TOKEN_KEY = 'finflow_auth_token';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getStoredToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
        ...options,
        headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
}

// Auth API
export const authApi = {
    async register(payload: {
        name: string;
        email: string;
        password: string;
        monthlyBudget?: number;
        currency?: string;
    }): Promise<{ message: string; token: string; user: User }> {
        const data = await request<{ message: string; token: string; user: User }>(
            '/api/auth/register',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );
        setStoredToken(data.token);
        return data;
    },

    async login(payload: {
        email: string;
        password: string;
    }): Promise<{ message: string; token: string; user: User }> {
        const data = await request<{ message: string; token: string; user: User }>(
            '/api/auth/login',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );
        setStoredToken(data.token);
        return data;
    },

    async demoLogin(): Promise<{ message: string; token: string; user: User }> {
        const data = await request<{ message: string; token: string; user: User }>(
            '/api/auth/demo-login',
            {
                method: 'POST',
            }
        );
        setStoredToken(data.token);
        return data;
    },

    async getMe(): Promise<{ user: User }> {
        return request<{ user: User }>('/api/auth/me');
    },

    async updateBudget(payload: {
        monthlyBudget: number;
        currency?: string;
        categoryBudgets?: Record<string, number>;
        pinCode?: string;
    }): Promise<{ message: string; user: User }> {
        return request<{ message: string; user: User }>('/api/auth/budget', {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    logout(): void {
        removeStoredToken();
    },
};

// Expense API
export const expenseApi = {
    async getExpenses(params?: {
        search?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        sort?: string;
        type?: string;
        account?: string;
        tag?: string;
    }): Promise<{ expenses: Expense[] }> {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.category) query.append('category', params.category);
        if (params?.startDate) query.append('startDate', params.startDate);
        if (params?.endDate) query.append('endDate', params.endDate);
        if (params?.sort) query.append('sort', params.sort);
        if (params?.type) query.append('type', params.type);
        if (params?.account) query.append('account', params.account);
        if (params?.tag) query.append('tag', params.tag);

        const queryString = query.toString() ? `?${query.toString()}` : '';
        return request<{ expenses: Expense[] }>(`/api/expenses${queryString}`);
    },

    async getSummary(): Promise<{ summary: SpendingSummary }> {
        return request<{ summary: SpendingSummary }>('/api/expenses/summary');
    },

    async addExpense(payload: Partial<Expense>): Promise<{ message: string; expense: Expense }> {
        return request<{ message: string; expense: Expense }>('/api/expenses', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async updateExpense(
        id: string,
        payload: Partial<Expense>
    ): Promise<{ message: string; expense: Expense }> {
        return request<{ message: string; expense: Expense }>(`/api/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },

    async deleteExpense(id: string): Promise<{ message: string; id: string }> {
        return request<{ message: string; id: string }>(`/api/expenses/${id}`, {
            method: 'DELETE',
        });
    },

    // Accounts
    async getAccounts(): Promise<{ accounts: Account[] }> {
        return request<{ accounts: Account[] }>('/api/expenses/accounts');
    },

    async createAccount(payload: Omit<Account, 'id' | 'userId'>): Promise<{ message: string; account: Account }> {
        return request<{ message: string; account: Account }>('/api/expenses/accounts', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    // Subscriptions
    async getSubscriptions(): Promise<{ subscriptions: Subscription[] }> {
        return request<{ subscriptions: Subscription[] }>('/api/expenses/subscriptions');
    },

    async createSubscription(payload: Partial<Subscription>): Promise<{ message: string; subscription: Subscription }> {
        return request<{ message: string; subscription: Subscription }>('/api/expenses/subscriptions', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async cancelSubscription(id: string): Promise<{ message: string; id: string }> {
        return request<{ message: string; id: string }>(`/api/expenses/subscriptions/${id}/cancel`, {
            method: 'POST',
        });
    },

    // Savings Goals
    async getSavingsGoals(): Promise<{ goals: SavingsGoal[] }> {
        return request<{ goals: SavingsGoal[] }>('/api/expenses/savings-goals');
    },

    async createSavingsGoal(payload: Partial<SavingsGoal>): Promise<{ message: string; goal: SavingsGoal }> {
        return request<{ message: string; goal: SavingsGoal }>('/api/expenses/savings-goals', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    async contributeToGoal(id: string, amount: number): Promise<{ message: string; goal: SavingsGoal }> {
        return request<{ message: string; goal: SavingsGoal }>(`/api/expenses/savings-goals/${id}/contribute`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },

    async dismissAlert(id: string): Promise<{ message: string }> {
        return request<{ message: string }>(`/api/expenses/alerts/${id}/dismiss`, {
            method: 'POST',
        });
    },
};

// AI API
export const aiApi = {
    async categorize(description: string, amount?: number): Promise<AICategoryResponse> {
        return request<AICategoryResponse>('/api/ai/categorize', {
            method: 'POST',
            body: JSON.stringify({ description, amount }),
        });
    },

    async getAnalysis(): Promise<{ analysis: AISpendingAnalysis }> {
        return request<{ analysis: AISpendingAnalysis }>('/api/ai/analysis', {
            method: 'POST',
        });
    },

    async askCoach(question: string): Promise<{ answer: string }> {
        return request<{ answer: string }>('/api/ai/ask', {
            method: 'POST',
            body: JSON.stringify({ question }),
        });
    },

    async sendVoiceCommand(
        transcript: string,
        autoSave: boolean = true,
        language: 'en' | 'hinglish' = 'en'
    ): Promise<VoiceCommandResult> {
        return request<VoiceCommandResult>('/api/ai/voice-command', {
            method: 'POST',
            body: JSON.stringify({ transcript, autoSave, language }),
        });
    },

    async scanReceipt(inputData: string, isImageBase64: boolean = false): Promise<{ result: ReceiptScanResult }> {
        return request<{ result: ReceiptScanResult }>('/api/ai/scan-receipt', {
            method: 'POST',
            body: JSON.stringify({ inputData, isImageBase64 }),
        });
    },

    async checkAffordability(amount: number, description?: string): Promise<{ analysis: AffordabilityAnalysis }> {
        return request<{ analysis: AffordabilityAnalysis }>('/api/ai/affordability', {
            method: 'POST',
            body: JSON.stringify({ amount, description }),
        });
    },

    async getCurrencyRates(): Promise<{
        base: string;
        rates: Record<string, { rate: number; symbol: string; name: string }>;
        lastUpdated: string;
    }> {
        return request<{
            base: string;
            rates: Record<string, { rate: number; symbol: string; name: string }>;
            lastUpdated: string;
        }>('/api/ai/currency-rates');
    },
};
