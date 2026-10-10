import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    Wallet,
    Sparkles,
    BarChart3,
    ListOrdered,
    Bot,
    Plus,
    TrendingDown,
    Settings,
    Camera,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'charts' | 'history' | 'ai-advisor';

interface NavbarProps {
    activeTab: NavTab;
    setActiveTab: (tab: NavTab) => void;
    onOpenAddExpense: () => void;
    onOpenReceiptScan?: () => void;
    onOpenProfileSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
                                                  activeTab,
                                                  setActiveTab,
                                                  onOpenAddExpense,
                                                  onOpenReceiptScan,
                                                  onOpenProfileSettings,
                                              }) => {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const navItems = [
        { id: 'dashboard' as NavTab, label: 'Overview', icon: BarChart3 },
        { id: 'charts' as NavTab, label: 'Charts', icon: TrendingDown },
        { id: 'history' as NavTab, label: 'Transactions', icon: ListOrdered },
        { id: 'ai-advisor' as NavTab, label: 'AI Advisor', icon: Bot, isSpecial: true },
    ];

    return (
        <header
            className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
                isDark
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100'
                    : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-2">
                    {/* Brand Logo & Name */}
                    <div
                        onClick={() => setActiveTab('dashboard')}
                        className="flex items-center gap-3 cursor-pointer shrink-0"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
                            <Wallet className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  FinFlow
                </span>
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
                            </div>
                            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Smart Expense Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs (Desktop / Tablet) */}
                    <nav
                        className={`hidden md:flex items-center gap-1 p-1 rounded-xl border ${
                            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-slate-100 border-slate-200'
                        }`}
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        isActive
                                            ? item.isSpecial
                                                ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-xs'
                                                : 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                                            : item.isSpecial
                                                ? 'text-teal-400 hover:bg-teal-500/10 font-semibold'
                                                : isDark
                                                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Right Controls: Quick Add, Scan Receipt, Profile Settings */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Scan Receipt Button */}
                        {onOpenReceiptScan && (
                            <button
                                onClick={onOpenReceiptScan}
                                title="Scan Receipt (OCR + AI)"
                                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-all active:scale-95 cursor-pointer ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 hover:border-emerald-500/40 text-slate-200'
                                        : 'bg-slate-100 border-slate-200 hover:border-slate-300 text-slate-700'
                                }`}
                            >
                                <Camera className="w-3.5 h-3.5 text-teal-400" />
                                <span>Scan</span>
                            </button>
                        )}

                        {/* Quick Add Expense Button */}
                        <button
                            onClick={onOpenAddExpense}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span className="hidden sm:inline">Add</span>
                        </button>

                        {/* Profile Settings Button */}
                        {user && (
                            <button
                                onClick={onOpenProfileSettings}
                                title="Profile & Settings (Accounts & Net Worth, Subscriptions, PDF Statement, Appearance)"
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                                    isDark
                                        ? 'bg-slate-800/80 border-slate-700 hover:border-emerald-500/40 text-slate-200'
                                        : 'bg-slate-100 border-slate-200 hover:border-emerald-400 text-slate-800'
                                }`}
                            >
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                                    {getInitials(user.name)}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium">
                                    <span className="hidden sm:inline">Settings</span>
                                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Bar */}
                <div
                    className={`flex md:hidden items-center justify-around py-2 border-t gap-1 text-[11px] ${
                        isDark ? 'border-slate-800/70' : 'border-slate-200'
                    }`}
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'text-emerald-500 font-bold'
                                        : isDark
                                            ? 'text-slate-400 hover:text-slate-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px]">{item.label}</span>
                            </button>
                        );
                    })}

                    <button
                        onClick={onOpenProfileSettings}
                        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-md shrink-0 text-slate-400 hover:text-emerald-400 cursor-pointer"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="text-[10px]">Settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
