import React, { useState, useEffect } from 'react';
import { expenseApi, aiApi } from '../services/api.js';
import { Account, SavingsGoal, SpendingSummary } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    ArrowRight,
    Plus,
    CreditCard,
    Building,
    RefreshCw,
    Sparkles,
    Target,
    DollarSign,
    Loader2,
    CheckCircle2,
    Globe,
} from 'lucide-react';

interface AccountsCashFlowViewProps {
    summary: SpendingSummary | null;
    currency?: string;
    onRefreshData?: () => void;
}

export const AccountsCashFlowView: React.FC<AccountsCashFlowViewProps> = ({
                                                                              summary,
                                                                              currency = '$',
                                                                              onRefreshData,
                                                                          }) => {
    const { isDark } = useTheme();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);

    // Multi-Currency Converter state
    const [currencyRates, setCurrencyRates] = useState<Record<string, { rate: number; symbol: string; name: string }>>({});
    const [fromAmount, setFromAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');

    // Add Account & Add Goal Modals
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState<'checking' | 'savings' | 'credit' | 'cash' | 'digital_wallet'>('checking');
    const [accountBalance, setAccountBalance] = useState('');

    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalCurrent, setGoalCurrent] = useState('0');

    const loadData = async () => {
        try {
            setLoading(true);
            const [accRes, goalRes, ratesRes] = await Promise.all([
                expenseApi.getAccounts(),
                expenseApi.getSavingsGoals(),
                aiApi.getCurrencyRates(),
            ]);
            setAccounts(accRes.accounts);
            setGoals(goalRes.goals);
            setCurrencyRates(ratesRes.rates);
        } catch (err) {
            console.error('Failed to load accounts/goals:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountName) return;
        try {
            await expenseApi.createAccount({
                name: accountName.trim(),
                type: accountType,
                balance: Number(accountBalance) || 0,
                color: accountType === 'credit' ? '#f59e0b' : '#3b82f6',
            });
            setIsAddAccountOpen(false);
            setAccountName('');
            setAccountBalance('');
            await loadData();
            if (onRefreshData) onRefreshData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalTitle || !goalTarget) return;
        try {
            await expenseApi.createSavingsGoal({
                title: goalTitle.trim(),
                targetAmount: Number(goalTarget),
                currentAmount: Number(goalCurrent) || 0,
                deadline: '2027-01-01',
                category: 'Savings',
                color: '#10b981',
            });
            setIsAddGoalOpen(false);
            setGoalTitle('');
            setGoalTarget('');
            await loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleContributeGoal = async (goalId: string) => {
        const amountStr = prompt('Enter contribution amount:');
        if (!amountStr || isNaN(Number(amountStr))) return;
        try {
            await expenseApi.contributeToGoal(goalId, Number(amountStr));
            await loadData();
        } catch (err) {
            console.error(err);
        }
    };

    // Compute Net Worth
    const assetsTotal = accounts
        .filter((a) => a.balance > 0)
        .reduce((sum, a) => sum + a.balance, 0);
    const liabilitiesTotal = Math.abs(
        accounts
            .filter((a) => a.balance < 0)
            .reduce((sum, a) => sum + a.balance, 0)
    );
    const netWorth = assetsTotal - liabilitiesTotal;

    // Currency conversion calculation
    const convertAmount = () => {
        const val = parseFloat(fromAmount) || 0;
        const fromRate = currencyRates[fromCurrency]?.rate || 1.0;
        const toRate = currencyRates[toCurrency]?.rate || 1.0;
        const inUSD = val / fromRate;
        return (inUSD * toRate).toFixed(2);
    };

    return (
        <div className="space-y-6">
            {/* 1. Net Worth & Cash Flow Overview Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Net Worth Card */}
                <div
                    className={`p-5 rounded-3xl border ${
                        isDark
                            ? 'bg-gradient-to-tr from-slate-900 to-emerald-950/30 border-emerald-500/20'
                            : 'bg-gradient-to-tr from-white to-emerald-50 border-emerald-200 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Total Liquid Net Worth</span>
                        <span className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-100 dark:text-white mt-2">
                        {currency}{netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>Assets: <strong className="text-emerald-400">{currency}{assetsTotal.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>Liabilities: <strong className="text-amber-400">-{currency}{liabilitiesTotal.toLocaleString()}</strong></span>
                    </div>
                </div>

                {/* Cash Flow: Income vs Expense */}
                <div
                    className={`p-5 rounded-3xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Monthly Cash Flow</span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{summary?.savingsRate || 0}% Saved</span>
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                        +{currency}{(summary?.netSavings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>In: <strong className="text-emerald-400">{currency}{(summary?.totalIncome || 0).toLocaleString()}</strong></span>
                        <span>Out: <strong className="text-slate-300">{currency}{(summary?.totalSpending || 0).toLocaleString()}</strong></span>
                    </div>
                </div>

                {/* Savings Rate Progress */}
                <div
                    className={`p-5 rounded-3xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Monthly Savings Efficiency</span>
                        <span className="p-1.5 rounded-xl bg-teal-500/15 text-teal-400">
              <PiggyBank className="w-4 h-4" />
            </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-teal-400 mt-2">
                        {summary?.savingsRate || 0}%
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                        <div
                            className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, summary?.savingsRate || 0))}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Connected Accounts Management */}
            <div
                className={`p-6 rounded-3xl border ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-sm text-slate-100 dark:text-white">
                            Multi-Account Management ({accounts.length})
                        </h3>
                        <p className="text-[11px] text-slate-400">
                            Manage bank accounts, credit cards, digital wallets, and cash
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddAccountOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Account</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {accounts.map((acc) => {
                        const isNegative = acc.balance < 0;
                        return (
                            <div
                                key={acc.id}
                                className={`p-4 rounded-2xl border transition-all ${
                                    isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {acc.type}
                  </span>
                                    {acc.accountNumberLast4 && (
                                        <span className="text-[10px] text-slate-400 font-mono">*{acc.accountNumberLast4}</span>
                                    )}
                                </div>
                                <div className="font-bold text-xs text-slate-200 dark:text-white mt-2 truncate">
                                    {acc.name}
                                </div>
                                <div
                                    className={`text-lg font-black mt-1 ${
                                        isNegative ? 'text-amber-400' : 'text-slate-100 dark:text-white'
                                    }`}
                                >
                                    {isNegative ? '-' : ''}{currency}{Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Savings Goals & Multi-Currency Converter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Savings Goals Column */}
                <div
                    className={`lg:col-span-7 p-6 rounded-3xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-sm text-slate-100 dark:text-white flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <span>Savings Goals & Milestones</span>
                            </h3>
                            <p className="text-[11px] text-slate-400">Track progress toward financial targets</p>
                        </div>
                        <button
                            onClick={() => setIsAddGoalOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 active:scale-95 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Goal</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {goals.map((goal) => {
                            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                            return (
                                <div
                                    key={goal.id}
                                    className={`p-4 rounded-2xl border space-y-2 ${
                                        isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-slate-100 dark:text-white">{goal.title}</span>
                                        <span className="font-extrabold text-emerald-400">{progress}%</span>
                                    </div>

                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      {currency}{goal.currentAmount.toLocaleString()} of {currency}{goal.targetAmount.toLocaleString()}
                    </span>
                                        <button
                                            onClick={() => handleContributeGoal(goal.id)}
                                            className="text-[11px] font-semibold text-emerald-400 hover:underline"
                                        >
                                            + Contribute
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Real-time Multi-Currency Converter */}
                <div
                    className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-teal-400" />
                            <h3 className="font-bold text-sm text-slate-100 dark:text-white">
                                Multi-Currency Live Converter
                            </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-4">
                            Real-time exchange rates across USD, EUR, GBP, INR, JPY, CAD & AUD
                        </p>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 text-[10px] mb-1">Amount</label>
                                <input
                                    type="number"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    className={`w-full rounded-xl p-2.5 text-xs border ${
                                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">From Currency</label>
                                    <select
                                        value={fromCurrency}
                                        onChange={(e) => setFromCurrency(e.target.value)}
                                        className={`w-full rounded-xl p-2.5 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    >
                                        {Object.keys(currencyRates).map((curr) => (
                                            <option key={curr} value={curr}>
                                                {curr} ({currencyRates[curr].symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">To Currency</label>
                                    <select
                                        value={toCurrency}
                                        onChange={(e) => setToCurrency(e.target.value)}
                                        className={`w-full rounded-xl p-2.5 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    >
                                        {Object.keys(currencyRates).map((curr) => (
                                            <option key={curr} value={curr}>
                                                {curr} ({currencyRates[curr].symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Conversion Result Box */}
                            <div
                                className={`p-4 rounded-2xl border text-center mt-3 ${
                                    isDark ? 'bg-slate-800/80 border-teal-500/30' : 'bg-teal-50 border-teal-200'
                                }`}
                            >
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Converted Result
                </span>
                                <div className="text-2xl font-black text-teal-400 mt-1">
                                    {currencyRates[toCurrency]?.symbol || ''} {convertAmount()} {toCurrency}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                  1 {fromCurrency} = {(
                                    (currencyRates[toCurrency]?.rate || 1) / (currencyRates[fromCurrency]?.rate || 1)
                                ).toFixed(4)} {toCurrency}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Account Modal */}
            {isAddAccountOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div
                        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    >
                        <h3 className="font-bold text-sm mb-3">Add Financial Account</h3>
                        <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 text-[10px] mb-1">Account Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Chase Sapphire, Cash, Apple Card"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Account Type</label>
                                    <select
                                        value={accountType}
                                        onChange={(e: any) => setAccountType(e.target.value)}
                                        className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                    >
                                        <option value="checking">Checking</option>
                                        <option value="credit">Credit Card</option>
                                        <option value="savings">Savings</option>
                                        <option value="cash">Cash Wallet</option>
                                        <option value="digital_wallet">Digital Wallet</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Starting Balance</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={accountBalance}
                                        onChange={(e) => setAccountBalance(e.target.value)}
                                        className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddAccountOpen(false)}
                                    className="flex-1 py-2 bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Goal Modal */}
            {isAddGoalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div
                        className={`w-full max-w-sm rounded-3xl border shadow-2xl p-6 ${
                            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    >
                        <h3 className="font-bold text-sm mb-3">Create Savings Goal</h3>
                        <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-400 text-[10px] mb-1">Goal Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. New Laptop, Japan Vacation"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Target Amount</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="2000"
                                        value={goalTarget}
                                        onChange={(e) => setGoalTarget(e.target.value)}
                                        className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Starting Saved</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={goalCurrent}
                                        onChange={(e) => setGoalCurrent(e.target.value)}
                                        className="w-full rounded-xl p-2.5 bg-slate-800 border border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddGoalOpen(false)}
                                    className="flex-1 py-2 bg-slate-800 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl">
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
