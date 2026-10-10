import React, { useState, useEffect } from 'react';
import { expenseApi } from '../services/api.js';
import { Subscription, EXPENSE_CATEGORIES, ExpenseCategory } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    CalendarClock,
    Plus,
    Trash2,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Sparkles,
    Loader2,
    Layers,
    Clock,
    ShieldAlert,
    ArrowUpRight,
    X,
} from 'lucide-react';

interface SubscriptionManagerViewProps {
    currency?: string;
    onRefreshData?: () => void;
}

export const SubscriptionManagerView: React.FC<SubscriptionManagerViewProps> = ({
                                                                                    currency = '$',
                                                                                    onRefreshData,
                                                                                }) => {
    const { isDark } = useTheme();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Entertainment & Leisure');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
    const [nextBillingDate, setNextBillingDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const res = await expenseApi.getSubscriptions();
            setSubscriptions(res.subscriptions);
        } catch (err) {
            console.error('Failed to load subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const handleCancelSub = async (id: string) => {
        try {
            await expenseApi.cancelSubscription(id);
            await loadSubscriptions();
            if (onRefreshData) onRefreshData();
        } catch (err) {
            console.error('Failed to cancel sub:', err);
        }
    };

    const handleCreateSub = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        setIsSubmitting(true);
        try {
            await expenseApi.createSubscription({
                name: name.trim(),
                amount: Number(amount),
                category,
                billingCycle,
                nextBillingDate,
                notes,
            });
            setIsAddModalOpen(false);
            setName('');
            setAmount('');
            setNotes('');
            await loadSubscriptions();
            if (onRefreshData) onRefreshData();
        } catch (err) {
            console.error('Failed to create subscription:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const monthlyTotal = activeSubs.reduce((sum, s) => {
        if (s.billingCycle === 'yearly') return sum + s.amount / 12;
        if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
        return sum + s.amount;
    }, 0);
    const annualTotal = monthlyTotal * 12;

    return (
        <div className="space-y-6">
            {/* Top Banner */}
            <div
                className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isDark
                        ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/20'
                        : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-200'
                }`}
            >
                <div>
                    <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <CalendarClock className="w-4 h-4" />
            </span>
                        <span className="text-xs font-semibold text-indigo-400">Subscription Intelligence</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold mt-1.5 text-slate-100 dark:text-white">
                        Recurring Bills & Subscription Manager
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                        Track automated renewal dates, calculate monthly outflows, and detect unused services.
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Recurring Bill</span>
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                    className={`p-5 rounded-2xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <span className="text-[11px] text-slate-400 font-medium">Monthly Recurring Outflow</span>
                    <div className="text-2xl font-black text-indigo-400 mt-1">
                        {currency}{monthlyTotal.toFixed(2)}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Across {activeSubs.length} active automated services</p>
                </div>

                <div
                    className={`p-5 rounded-2xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <span className="text-[11px] text-slate-400 font-medium">Annualized Projected Cost</span>
                    <div className="text-2xl font-black text-slate-100 dark:text-white mt-1">
                        {currency}{annualTotal.toFixed(2)}
                        <span className="text-xs font-normal text-slate-400">/yr</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Total yearly subscription overhead</p>
                </div>

                <div
                    className={`p-5 rounded-2xl border ${
                        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                    <span className="text-[11px] text-slate-400 font-medium">AI Cancellation Opportunities</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                        {subscriptions.filter((s) => s.status === 'review').length} flagged
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Potential monthly savings identified</p>
                </div>
            </div>

            {/* Subscriptions List */}
            <div
                className={`rounded-3xl border overflow-hidden ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
            >
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-100 dark:text-white">Active Subscriptions & Due Dates</h3>
                    <span className="text-xs text-slate-400">{subscriptions.length} tracked</span>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                        <span>Loading subscriptions...</span>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                        No subscriptions tracked yet. Click "Add Recurring Bill" above to start!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/60">
                        {subscriptions.map((sub) => {
                            const isFlagged = sub.status === 'review';
                            const isCancelled = sub.status === 'cancelled';

                            return (
                                <div
                                    key={sub.id}
                                    className={`p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                                        isCancelled ? 'opacity-50' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                                                isFlagged
                                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                    : isCancelled
                                                        ? 'bg-slate-800 text-slate-400'
                                                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                            }`}
                                        >
                                            {sub.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-xs text-slate-100 dark:text-white">{sub.name}</span>
                                                {isFlagged && (
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> AI Review Suggested
                          </span>
                                                )}
                                                {isCancelled && (
                                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-800 text-slate-400">
                            Cancelled
                          </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">
                                                {sub.category} • Billed {sub.billingCycle} • Next Due: <strong>{sub.nextBillingDate}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-100 dark:text-white block">
                        {currency}{sub.amount.toFixed(2)}
                      </span>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        /{sub.billingCycle}
                      </span>
                                        </div>

                                        {!isCancelled && (
                                            <button
                                                onClick={() => handleCancelSub(sub.id)}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all text-xs flex items-center gap-1"
                                                title="Mark Subscription as Cancelled"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline text-[11px]">Cancel</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Subscription Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div
                        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 transition-colors ${
                            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <h3 className="font-bold text-sm">Add Recurring Subscription / Bill</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSub} className="space-y-3.5 mt-4 text-xs">
                            <div>
                                <label className="block text-slate-400 text-[10px] mb-1">Service / Bill Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Netflix, Gym, Internet, Rent"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full rounded-xl px-3 py-2 text-xs border ${
                                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="19.99"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className={`w-full rounded-xl px-3 py-2 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Billing Cycle</label>
                                    <select
                                        value={billingCycle}
                                        onChange={(e: any) => setBillingCycle(e.target.value)}
                                        className={`w-full rounded-xl px-3 py-2 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e: any) => setCategory(e.target.value)}
                                        className={`w-full rounded-xl px-3 py-2 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    >
                                        {EXPENSE_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-[10px] mb-1">Next Billing Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={nextBillingDate}
                                        onChange={(e) => setNextBillingDate(e.target.value)}
                                        className={`w-full rounded-xl px-3 py-2 text-xs border ${
                                            isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                                        }`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-2 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
                                <span>Save Recurring Subscription</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};