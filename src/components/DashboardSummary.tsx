import React from 'react';
import { SpendingSummary } from '../types.js';
import {
    DollarSign,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    PieChart,
    ArrowRight,
    Clock,
    Sparkles,
    Layers,
    FileDown,
    Camera,
    Mic,
    CreditCard,
    CalendarClock,
} from 'lucide-react';
import { getCategoryStyle } from '../utils/categoryTheme.js';

interface DashboardSummaryProps {
    summary: SpendingSummary | null;
    loading: boolean;
    onNavigateToCharts: () => void;
    onNavigateToHistory: () => void;
    onNavigateToAI: () => void;
    onNavigateToAccounts?: () => void;
    onNavigateToSubscriptions?: () => void;
    onOpenAddExpense: () => void;
    onOpenBudgetModal: () => void;
    onOpenReceiptScan?: () => void;
    onOpenVoiceAssistant?: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
                                                                      summary,
                                                                      loading,
                                                                      onNavigateToCharts,
                                                                      onNavigateToHistory,
                                                                      onNavigateToAI,
                                                                      onNavigateToAccounts,
                                                                      onNavigateToSubscriptions,
                                                                      onOpenAddExpense,
                                                                      onOpenBudgetModal,
                                                                      onOpenReceiptScan,
                                                                      onOpenVoiceAssistant,
                                                                  }) => {
    if (loading || !summary) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="h-36 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
                    <div className="h-36 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
                    <div className="h-36 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
                    <div className="h-64 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
                </div>
            </div>
        );
    }

    const {
        totalSpending,
        monthlyBudget,
        budgetUtilizationPercentage,
        remainingBudget,
        currency,
        todaySpending,
        yesterdaySpending,
        dailyAverage,
        recentDaysReport,
        currentWeekReport,
        categoryBreakdown,
    } = summary;

    // Determine budget status
    const isOverBudget = totalSpending > monthlyBudget;
    const isBudgetWarning = budgetUtilizationPercentage >= 85 && !isOverBudget;

    return (
        <div className="space-y-6">
            {/* Top Banner & Quick AI Teaser */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/20 p-5 sm:p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Financial Engine Active
              </span>
                            <span className="text-xs text-slate-400">Current Month Cycle</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1.5">
                            Financial Control Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                            Real-time expense tracking powered by Gemini categorization, daily burn analysis, and automated predictive insights.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            onClick={onNavigateToAI}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Run AI Audit</span>
                        </button>
                        <button
                            onClick={onOpenAddExpense}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs border border-slate-700 transition-all"
                        >
                            <span>+ Add Expense</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Smart Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {onOpenReceiptScan && (
                    <button
                        onClick={onOpenReceiptScan}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">Scan Receipt</p>
                            <p className="text-[10px] text-slate-400">OCR + AI itemize</p>
                        </div>
                    </button>
                )}

                {onOpenVoiceAssistant && (
                    <button
                        onClick={onOpenVoiceAssistant}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-400/40 text-left transition-all group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-cyan-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Mic className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">Voice Assistant</p>
                            <p className="text-[10px] text-slate-400">English & Hinglish</p>
                        </div>
                    </button>
                )}

                {onNavigateToAccounts && (
                    <button
                        onClick={onNavigateToAccounts}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">Accounts & Net Worth</p>
                            <p className="text-[10px] text-slate-400">Cards, banks & rates</p>
                        </div>
                    </button>
                )}

                {onNavigateToSubscriptions && (
                    <button
                        onClick={onNavigateToSubscriptions}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-400/40 text-left transition-all group cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <CalendarClock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">Subscriptions</p>
                            <p className="text-[10px] text-slate-400">Bills, trials & renewals</p>
                        </div>
                    </button>
                )}
            </div>

            {/* 1. Core Summary Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Total Spending & Budget */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Month Spending
              </span>
                            <button
                                onClick={onOpenBudgetModal}
                                className="text-[11px] text-emerald-400 hover:underline"
                            >
                                Edit Budget
                            </button>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {currency}{totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
                            <span className="text-xs text-slate-400">
                / {currency}{monthlyBudget.toLocaleString()}
              </span>
                        </div>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400">Budget Utilized:</span>
                            <span
                                className={`font-semibold ${
                                    isOverBudget
                                        ? 'text-rose-400'
                                        : isBudgetWarning
                                            ? 'text-amber-400'
                                            : 'text-emerald-400'
                                }`}
                            >
                {budgetUtilizationPercentage}%
              </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                    isOverBudget
                                        ? 'bg-rose-500'
                                        : isBudgetWarning
                                            ? 'bg-amber-400'
                                            : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(budgetUtilizationPercentage, 100)}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Remaining:</span>
                            <span className="font-medium text-slate-200">
                {isOverBudget ? (
                    <span className="text-rose-400">
                    Over by {currency}{(totalSpending - monthlyBudget).toFixed(2)}
                  </span>
                ) : (
                    `${currency}${remainingBudget.toFixed(2)}`
                )}
              </span>
                        </div>
                    </div>
                </div>

                {/* Daily Report Card */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Daily Report
              </span>
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3" /> Today
              </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {currency}{todaySpending.toFixed(2)}
              </span>
                            <span className="text-xs text-slate-400">spent today</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Yesterday:</span>
                            <span className="text-slate-200 font-medium">
                {currency}{yesterdaySpending.toFixed(2)}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Daily Average (Month):</span>
                            <span className="text-slate-200 font-medium">
                {currency}{dailyAverage.toFixed(2)} / day
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Burn Pacing:</span>
                            <span
                                className={`font-semibold flex items-center gap-1 ${
                                    todaySpending > dailyAverage * 1.5
                                        ? 'text-amber-400'
                                        : 'text-emerald-400'
                                }`}
                            >
                {todaySpending > dailyAverage * 1.5 ? (
                    <>
                        <TrendingUp className="w-3 h-3" /> Above Average
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="w-3 h-3" /> Within Target
                    </>
                )}
              </span>
                        </div>
                    </div>
                </div>

                {/* Weekly Report Card */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Weekly Report
              </span>
                            <span className="text-[11px] text-slate-400">
                {currentWeekReport.weekStart.slice(5)} to {currentWeekReport.weekEnd.slice(5)}
              </span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {currency}{currentWeekReport.total.toFixed(2)}
              </span>
                            <span className="text-xs text-slate-400">this week</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Previous Week Total:</span>
                            <span className="text-slate-200 font-medium">
                {currency}{currentWeekReport.previousWeekTotal.toFixed(2)}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Week-over-Week Change:</span>
                            <span
                                className={`font-semibold flex items-center gap-1 ${
                                    currentWeekReport.changePercentage > 0
                                        ? 'text-rose-400'
                                        : currentWeekReport.changePercentage < 0
                                            ? 'text-emerald-400'
                                            : 'text-slate-300'
                                }`}
                            >
                {currentWeekReport.changePercentage > 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                ) : currentWeekReport.changePercentage < 0 ? (
                    <TrendingDown className="w-3.5 h-3.5" />
                ) : null}
                                {currentWeekReport.changePercentage > 0 ? '+' : ''}
                                {currentWeekReport.changePercentage}%
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Transactions Logged:</span>
                            <span className="text-slate-200 font-medium">
                {summary.expenseCount} entries
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Daily & Weekly Breakdown Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last 7 Days Daily Breakdown */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                Daily Report: Last 7 Days
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
              Avg: {currency}{dailyAverage.toFixed(2)}
            </span>
                    </div>

                    <div className="space-y-3">
                        {recentDaysReport.map((day) => {
                            const maxDayAmount = Math.max(...recentDaysReport.map((d) => d.total), 1);
                            const percentageOfMax = Math.round((day.total / maxDayAmount) * 100);
                            const isToday = day.date === new Date().toISOString().split('T')[0];

                            return (
                                <div key={day.date} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      {day.date}
                        {isToday && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold">
                          Today
                        </span>
                        )}
                    </span>
                                        <div className="flex items-center gap-3">
                                            {day.topCategory && (
                                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {day.topCategory}
                        </span>
                                            )}
                                            <span className="font-semibold text-slate-100">
                        {currency}{day.total.toFixed(2)}
                      </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${
                                                isToday ? 'bg-emerald-400' : 'bg-teal-500/70'
                                            }`}
                                            style={{ width: `${Math.max(percentageOfMax, 3)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Current Week Day-by-Day Report */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-teal-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                Weekly Report: Mon - Sun Flow
                            </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
              Total: {currency}{currentWeekReport.total.toFixed(2)}
            </span>
                    </div>

                    <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4 pb-2">
                        {currentWeekReport.dailyBreakdown.map((item) => {
                            const maxWeekDay = Math.max(
                                ...currentWeekReport.dailyBreakdown.map((d) => d.amount),
                                1
                            );
                            const heightPercent = Math.round((item.amount / maxWeekDay) * 100);
                            const isToday = item.date === new Date().toISOString().split('T')[0];

                            return (
                                <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {currency}{Math.round(item.amount)}
                  </span>
                                    <div className="w-full max-w-[32px] bg-slate-800 rounded-t-lg relative flex items-end overflow-hidden h-28">
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-300 ${
                                                isToday
                                                    ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                                                    : item.amount > 0
                                                        ? 'bg-slate-600 hover:bg-slate-500'
                                                        : 'bg-transparent'
                                            }`}
                                            style={{ height: `${Math.max(heightPercent, item.amount > 0 ? 8 : 2)}%` }}
                                        />
                                    </div>
                                    <span
                                        className={`text-[11px] mt-2 font-medium ${
                                            isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'
                                        }`}
                                    >
                    {item.day}
                  </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Weekly Target Allocation</span>
                        <span className="text-slate-200 font-medium">
              ~{currency}{Math.round(monthlyBudget / 4)}/wk
            </span>
                    </div>
                </div>
            </div>

            {/* 3. Category Breakdown Quick Cards & Chart Link */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-semibold text-sm text-slate-100">
                            Top Spending Categories
                        </h3>
                    </div>
                    <button
                        onClick={onNavigateToCharts}
                        className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                        <span>Interactive Chart.js View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryBreakdown.slice(0, 8).map((cat) => {
                        const style = getCategoryStyle(cat.category);
                        return (
                            <div
                                key={cat.category}
                                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${style.color} truncate pr-1`}>
                    {cat.category}
                  </span>
                                    <span className="text-[11px] font-semibold text-slate-300">
                    {cat.percentage}%
                  </span>
                                </div>
                                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-white">
                    {currency}{cat.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                                    <span className="text-[10px] text-slate-400">
                    {cat.count} {cat.count === 1 ? 'item' : 'items'}
                  </span>
                                </div>
                                {/* Micro bar */}
                                <div className="w-full bg-slate-700/60 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(cat.percentage, 100)}%`,
                                            backgroundColor: style.chartColor,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
