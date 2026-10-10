import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { downloadExpenseReportPDF, downloadTransactionDetailsPDF } from '../utils/pdfExport.js';
import { SpendingSummary, Expense } from '../types.js';
import { AccountsCashFlowView } from './AccountsCashFlowView.js';
import { SubscriptionManagerView } from './SubscriptionManagerView.js';
import {
    X,
    User,
    Mail,
    Sliders,
    Sun,
    Moon,
    FileDown,
    Mic,
    LogOut,
    Sparkles,
    ShieldCheck,
    Calendar,
    DollarSign,
    Save,
    Loader2,
    Check,
    CreditCard,
    CalendarClock,
    Layers,
} from 'lucide-react';

export type SettingsTab = 'profile' | 'accounts' | 'subscriptions' | 'pdf';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenVoiceAssistant: () => void;
    summary: SpendingSummary | null;
    expenses: Expense[];
    currency?: string;
    onBudgetUpdated?: () => void;
    initialTab?: SettingsTab;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
                                                                              isOpen,
                                                                              onClose,
                                                                              onOpenVoiceAssistant,
                                                                              summary,
                                                                              expenses,
                                                                              currency = '$',
                                                                              onBudgetUpdated,
                                                                              initialTab = 'profile',
                                                                          }) => {
    const { user, logout, updateBudget } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
    const [budgetVal, setBudgetVal] = useState(user?.monthlyBudget ? user.monthlyBudget.toString() : '3500');
    const [currSymbol, setCurrSymbol] = useState(user?.currency || '$');
    const [isSavingBudget, setIsSavingBudget] = useState(false);
    const [budgetSavedSuccess, setBudgetSavedSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab || 'profile');
            if (user) {
                setBudgetVal(user.monthlyBudget.toString());
                setCurrSymbol(user.currency || '$');
            }
        }
    }, [isOpen, initialTab, user]);

    if (!isOpen || !user) return null;

    const handleSaveBudget = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = Number(budgetVal);
        if (isNaN(val) || val <= 0) return;

        setIsSavingBudget(true);
        try {
            await updateBudget(val, currSymbol);
            if (onBudgetUpdated) onBudgetUpdated();
            setBudgetSavedSuccess(true);
            setTimeout(() => setBudgetSavedSuccess(false), 2500);
        } catch (err) {
            console.error('Failed to update budget in settings:', err);
        } finally {
            setIsSavingBudget(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <div
                className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden my-4 sm:my-6 transition-colors flex flex-col max-h-[92vh] ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
                {/* Modal Top Header */}
                <div
                    className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b shrink-0 ${
                        isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-sm sm:text-base tracking-tight">{user.name}</h3>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-Navigation Tabs inside Settings */}
                <div
                    className={`flex items-center px-4 sm:px-6 border-b overflow-x-auto gap-1 sm:gap-2 shrink-0 py-2 ${
                        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-100/70'
                    }`}
                >
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'profile'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                    >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile & Preferences</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'accounts'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                    >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Accounts & Net Worth</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'subscriptions'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                    >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Subscriptions & Bills</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('pdf')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'pdf'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : isDark
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                    >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Export Statement (PDF)</span>
                    </button>
                </div>

                {/* Modal Scrollable Content */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-xs">
                    {/* TAB 1: Profile & Preferences */}
                    {activeTab === 'profile' && (
                        <div className="space-y-5 max-w-2xl mx-auto">
                            {/* Appearance Mode */}
                            <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Theme Appearance
                </span>
                                <div
                                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                                        isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-200 dark:text-white">
                                                {isDark ? 'Dark Mode' : 'Light Mode'}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {isDark ? 'High-contrast dark slate styling with emerald glowing accents' : 'Clean, crisp light appearance'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xs active:scale-95 cursor-pointer"
                                    >
                                        Switch to {isDark ? 'Light' : 'Dark'}
                                    </button>
                                </div>
                            </div>

                            {/* AI Voice Assistant Option */}
                            <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  AI Voice Assistant (English & Hinglish)
                </span>
                                <div
                                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                                        isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-200 dark:text-white flex items-center gap-1.5">
                                                <span>Dual Voice Agent</span>
                                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-indigo-500/20 text-indigo-300">
                          English & Hinglish
                        </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                Natural conversational expense logging in English or Hinglish (Hindi + English)
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onOpenVoiceAssistant();
                                        }}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white transition-all shadow-xs active:scale-95 flex items-center gap-1 cursor-pointer"
                                    >
                                        <Mic className="w-3.5 h-3.5" />
                                        <span>Open Voice</span>
                                    </button>
                                </div>
                            </div>

                            {/* Monthly Budget & Currency Preferences */}
                            <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Budget Ceiling & Currency
                </span>
                                <form
                                    onSubmit={handleSaveBudget}
                                    className={`p-4 rounded-2xl border space-y-3.5 ${
                                        isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-slate-400 text-[10px] mb-1">
                                                Monthly Spending Budget
                                            </label>
                                            <input
                                                type="number"
                                                value={budgetVal}
                                                onChange={(e) => setBudgetVal(e.target.value)}
                                                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 border ${
                                                    isDark
                                                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                                                        : 'bg-white border-slate-200 text-slate-800'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-[10px] mb-1">
                                                Default Currency Symbol
                                            </label>
                                            <select
                                                value={currSymbol}
                                                onChange={(e) => setCurrSymbol(e.target.value)}
                                                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 border ${
                                                    isDark
                                                        ? 'bg-slate-900 border-slate-700 text-slate-100'
                                                        : 'bg-white border-slate-200 text-slate-800'
                                                }`}
                                            >
                                                <option value="$">$ (USD / CAD / AUD)</option>
                                                <option value="₹">₹ (INR - Indian Rupee)</option>
                                                <option value="€">€ (EUR - Euro)</option>
                                                <option value="£">£ (GBP - British Pound)</option>
                                                <option value="¥">¥ (JPY - Japanese Yen)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        {budgetSavedSuccess ? (
                                            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Budget preferences updated successfully!
                      </span>
                                        ) : (
                                            <span className="text-slate-400 text-[10px]">
                        Current: {currency}{user.monthlyBudget.toLocaleString()} limit
                      </span>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSavingBudget}
                                            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                        >
                                            {isSavingBudget ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                            <span>Save Changes</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Account Sign Out */}
                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-200">Session Security</p>
                                    <p className="text-[10px] text-slate-400">Signed in as {user.email}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        onClose();
                                        logout();
                                    }}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: Accounts & Net Worth (Renamed from Cash Flow) */}
                    {activeTab === 'accounts' && (
                        <div>
                            <div className="mb-4 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                        <span>Accounts, Balances & Liquid Net Worth</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Multi-account liquidity, real-time currency conversions, and savings milestones
                                    </p>
                                </div>
                            </div>
                            <AccountsCashFlowView
                                summary={summary}
                                currency={currency}
                                onRefreshData={onBudgetUpdated}
                            />
                        </div>
                    )}

                    {/* TAB 3: Subscriptions & Recurring Bills */}
                    {activeTab === 'subscriptions' && (
                        <div>
                            <div className="mb-4 pb-2 border-b border-slate-800/80 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                                        <CalendarClock className="w-4 h-4 text-amber-400" />
                                        <span>Subscription Management & Bill Reminders</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Track recurring subscriptions, renewal cycle due dates, and unused trial cancellations
                                    </p>
                                </div>
                            </div>
                            <SubscriptionManagerView
                                currency={currency}
                                onRefreshData={onBudgetUpdated}
                            />
                        </div>
                    )}

                    {/* TAB 4: PDF Statement Export */}
                    {activeTab === 'pdf' && (
                        <div className="space-y-4 max-w-2xl mx-auto py-2">
                            <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                                        <FileDown className="w-4 h-4" />
                                        <span>Transaction Details Statement (PDF)</span>
                                    </div>
                                    <p className="text-xs text-slate-300">
                                        Download an itemized, multi-page PDF document containing all recorded transactions, categories, payment methods, and net totals.
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Includes {expenses.length} transaction records • PDF format
                                    </p>
                                </div>
                                <button
                                    onClick={() => downloadTransactionDetailsPDF(expenses, currency)}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer"
                                >
                                    <FileDown className="w-4 h-4" />
                                    <span>Download PDF Statement</span>
                                </button>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-200 font-bold text-sm mb-1">
                                        <Layers className="w-4 h-4 text-teal-400" />
                                        <span>Monthly Financial Audit Report (PDF)</span>
                                    </div>
                                    <p className="text-xs text-slate-300">
                                        High-level financial review with KPI metric cards, category breakdown analysis, and monthly budget pacing.
                                    </p>
                                </div>
                                <button
                                    onClick={() => downloadExpenseReportPDF(summary, expenses, currency)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all flex items-center gap-2 active:scale-95 shrink-0 cursor-pointer"
                                >
                                    <FileDown className="w-4 h-4 text-teal-400" />
                                    <span>Download Audit PDF</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
