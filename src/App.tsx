import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider, useTheme } from './context/ThemeContext.js';
import { Navbar, NavTab } from './components/Navbar.js';
import { DashboardSummary } from './components/DashboardSummary.js';
import { ExpenseCharts } from './components/ExpenseCharts.js';
import { ExpenseHistory } from './components/ExpenseHistory.js';
import { AiInsightsView } from './components/AiInsightsView.js';
import { ExpenseModal } from './components/ExpenseModal.js';
import { BudgetModal } from './components/BudgetModal.js';
import { AuthModal } from './components/AuthModal.js';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.js';
import { ProfileSettingsModal, SettingsTab } from './components/ProfileSettingsModal.js';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.js';
import { expenseApi } from './services/api.js';
import { Expense, SpendingSummary } from './types.js';
import { Loader2, Mic } from 'lucide-react';

function ExpenseTrackerApp() {
    const { user, loading: authLoading } = useAuth();
    const { isDark } = useTheme();

    const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<SpendingSummary | null>(null);
    const [loadingData, setLoadingData] = useState<boolean>(true);

    // Modals state
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
    const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState<boolean>(false);
    const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('profile');
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

    // Load expenses and summary data
    const loadData = async () => {
        if (!user) return;
        try {
            setLoadingData(true);
            const [expensesRes, summaryRes] = await Promise.all([
                expenseApi.getExpenses(),
                expenseApi.getSummary(),
            ]);
            setExpenses(expensesRes.expenses);
            setSummary(summaryRes.summary);
        } catch (err) {
            console.error('Failed to load expense data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    // Handle Add or Edit Expense
    const handleExpenseSubmit = async (data: {
        id?: string;
        description: string;
        amount: number;
        date: string;
        category: any;
        paymentMethod: any;
        notes?: string;
        aiCategorized?: boolean;
        tags?: string[];
        isRecurring?: boolean;
    }) => {
        if (data.id) {
            await expenseApi.updateExpense(data.id, data);
        } else {
            await expenseApi.addExpense(data as any);
        }
        await loadData();
    };

    // Handle Delete Expense
    const handleDeleteExpense = async (id: string) => {
        await expenseApi.deleteExpense(id);
        await loadData();
    };

    const handleOpenAddExpense = () => {
        setEditingExpense(null);
        setIsExpenseModalOpen(true);
    };

    const handleOpenEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };

    const handleOpenSettingsWithTab = (tab: SettingsTab = 'profile') => {
        setSettingsInitialTab(tab);
        setIsProfileSettingsOpen(true);
    };

    if (authLoading) {
        return (
            <div
                className={`min-h-screen flex flex-col items-center justify-center gap-3 ${
                    isDark ? 'bg-[#090d16] text-slate-400' : 'bg-slate-50 text-slate-500'
                }`}
            >
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <p className="text-xs font-medium">Initializing FinFlow AI...</p>
            </div>
        );
    }

    if (!user) {
        return <AuthModal />;
    }

    return (
        <div
            className={`min-h-screen flex flex-col relative overflow-hidden transition-colors selection:bg-emerald-500/30 selection:text-emerald-300 ${
                isDark ? 'bg-[#060913] text-slate-100 finflow-bg-pattern-dark' : 'bg-[#f8fafc] text-slate-900 finflow-bg-pattern-light'
            }`}
        >
            {/* Top subtle horizon glow light line */}
            <div className={`absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none z-20 ${
                isDark ? 'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent' : 'bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent'
            }`} />

            {/* Visually Attractive Multi-Layered Ambient Glow Orbs */}
            <div
                className={`absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full blur-[110px] pointer-events-none transition-all duration-700 ${
                    isDark
                        ? 'bg-gradient-to-r from-indigo-500/20 via-cyan-500/18 to-emerald-500/18 opacity-90'
                        : 'bg-gradient-to-r from-indigo-400/12 via-cyan-400/10 to-emerald-400/10 opacity-70'
                }`}
            />
            <div
                className={`absolute top-1/4 -right-28 w-[520px] h-[520px] rounded-full blur-[125px] pointer-events-none animate-float-slow transition-all duration-700 ${
                    isDark ? 'bg-gradient-to-bl from-violet-600/16 via-indigo-600/12 to-transparent opacity-85' : 'bg-gradient-to-bl from-indigo-300/14 via-violet-200/10 to-transparent opacity-60'
                }`}
            />
            <div
                className={`absolute -bottom-24 -left-20 w-[550px] h-[550px] rounded-full blur-[125px] pointer-events-none animate-float-delayed transition-all duration-700 ${
                    isDark ? 'bg-gradient-to-tr from-emerald-500/16 via-teal-500/12 to-transparent opacity-85' : 'bg-gradient-to-tr from-teal-300/14 via-emerald-200/10 to-transparent opacity-60'
                }`}
            />

            {/* Streamlined Clean Navigation Header */}
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenAddExpense={handleOpenAddExpense}
                onOpenReceiptScan={() => setIsReceiptModalOpen(true)}
                onOpenProfileSettings={() => handleOpenSettingsWithTab('profile')}
            />

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {activeTab === 'dashboard' && (
                    <DashboardSummary
                        summary={summary}
                        loading={loadingData}
                        onNavigateToCharts={() => setActiveTab('charts')}
                        onNavigateToHistory={() => setActiveTab('history')}
                        onNavigateToAI={() => setActiveTab('ai-advisor')}
                        onNavigateToAccounts={() => handleOpenSettingsWithTab('accounts')}
                        onNavigateToSubscriptions={() => handleOpenSettingsWithTab('subscriptions')}
                        onOpenAddExpense={handleOpenAddExpense}
                        onOpenBudgetModal={() => handleOpenSettingsWithTab('profile')}
                        onOpenReceiptScan={() => setIsReceiptModalOpen(true)}
                        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
                    />
                )}

                {activeTab === 'charts' && (
                    <ExpenseCharts
                        summary={summary}
                        expenses={expenses}
                        currency={user.currency || '$'}
                    />
                )}

                {activeTab === 'history' && (
                    <ExpenseHistory
                        expenses={expenses}
                        currency={user.currency || '$'}
                        onEdit={handleOpenEditExpense}
                        onDelete={handleDeleteExpense}
                        onAddNew={handleOpenAddExpense}
                    />
                )}

                {activeTab === 'ai-advisor' && (
                    <AiInsightsView
                        summary={summary}
                        expenses={expenses}
                        currency={user.currency || '$'}
                    />
                )}
            </main>

            {/* Modals */}
            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSubmit={handleExpenseSubmit}
                initialData={editingExpense}
                currency={user.currency || '$'}
            />

            <BudgetModal
                isOpen={isBudgetModalOpen}
                onClose={() => setIsBudgetModalOpen(false)}
                onBudgetUpdated={loadData}
            />

            {/* Central Profile & Settings Modal (Houses Accounts & Net Worth, Subscriptions, PDF Statement, Appearance) */}
            <ProfileSettingsModal
                isOpen={isProfileSettingsOpen}
                onClose={() => setIsProfileSettingsOpen(false)}
                onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
                summary={summary}
                expenses={expenses}
                currency={user.currency || '$'}
                onBudgetUpdated={loadData}
                initialTab={settingsInitialTab}
            />

            {/* Futuristic Voice Assistant Modal (Dual English & Hinglish) */}
            <VoiceAssistantModal
                isOpen={isVoiceModalOpen}
                onClose={() => setIsVoiceModalOpen(false)}
                onExpenseAdded={loadData}
                currency={user.currency || '$'}
            />

            {/* Smart OCR Receipt Scanner */}
            <ReceiptScannerModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                onExpenseAdded={loadData}
                currency={user.currency || '$'}
            />

            {/* Floating Glowing Voice Assistant Trigger Button */}
            <button
                onClick={() => setIsVoiceModalOpen(true)}
                title="Open AI Voice Assistant (English & Hinglish)"
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-all group border border-indigo-400/40 cursor-pointer"
            >
                <div className="relative flex items-center justify-center">
                    <span className="absolute -inset-1 rounded-full bg-cyan-400/50 animate-ping pointer-events-none" />
                    <Mic className="w-4 h-4 relative z-10 text-white" />
                </div>
                <span className="tracking-wide hidden sm:inline">Voice Assistant</span>
            </button>

            {/* Footer */}
            <footer
                className={`relative z-10 border-t py-4 text-center text-[11px] transition-colors ${
                    isDark ? 'border-slate-800/80 bg-slate-950/70 text-slate-500' : 'border-slate-200 bg-white/80 text-slate-500'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span>FinFlow AI Personal Expense Intelligence</span>
                    <span className="flex items-center gap-2">
            <span>Node.js / Express</span>
            <span>•</span>
            <span>Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>English & Hinglish Voice AI</span>
          </span>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ExpenseTrackerApp />
            </AuthProvider>
        </ThemeProvider>
    );
}
