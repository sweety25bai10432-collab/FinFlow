import React, { useEffect, useRef, useState } from 'react';
import ChartJS from 'chart.js/auto';
import { SpendingSummary, Expense } from '../types.js';
import { getCategoryStyle } from '../utils/categoryTheme.js';
import { BarChart3, PieChart, CreditCard, TrendingUp } from 'lucide-react';

interface ExpenseChartsProps {
    summary: SpendingSummary | null;
    expenses: Expense[];
    currency?: string;
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
                                                                summary,
                                                                expenses,
                                                                currency = '$',
                                                            }) => {
    const donutCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const paymentCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const donutChartInstance = useRef<ChartJS | null>(null);
    const trendChartInstance = useRef<ChartJS | null>(null);
    const paymentChartInstance = useRef<ChartJS | null>(null);

    const [trendMode, setTrendMode] = useState<'daily' | 'weekly'>('daily');

    // Render Category Donut Chart
    useEffect(() => {
        if (!donutCanvasRef.current || !summary || summary.categoryBreakdown.length === 0) return;

        if (donutChartInstance.current) {
            donutChartInstance.current.destroy();
        }

        const categories = summary.categoryBreakdown;
        const labels = categories.map((c) => c.category);
        const data = categories.map((c) => c.amount);
        const bgColors = categories.map((c) => getCategoryStyle(c.category).chartColor);

        const ctx = donutCanvasRef.current.getContext('2d');
        if (!ctx) return;

        donutChartInstance.current = new ChartJS(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: bgColors,
                        borderColor: '#0f172a',
                        borderWidth: 2,
                        hoverOffset: 8,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: { size: 11, family: 'Inter, system-ui, sans-serif' },
                            boxWidth: 12,
                            padding: 14,
                        },
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (item) => {
                                const val = Number(item.raw) || 0;
                                const total = data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                                return ` ${item.label}: ${currency}${val.toFixed(2)} (${pct}%)`;
                            },
                        },
                    },
                },
                cutout: '68%',
            },
        });

        return () => {
            if (donutChartInstance.current) {
                donutChartInstance.current.destroy();
            }
        };
    }, [summary, currency]);

    // Render Spending Trend Chart (Line/Area or Bar)
    useEffect(() => {
        if (!trendCanvasRef.current || !summary) return;

        if (trendChartInstance.current) {
            trendChartInstance.current.destroy();
        }

        const ctx = trendCanvasRef.current.getContext('2d');
        if (!ctx) return;

        let labels: string[] = [];
        let dataPoints: number[] = [];

        if (trendMode === 'daily') {
            labels = summary.recentDaysReport.map((d) => d.date.slice(5)); // MM-DD
            dataPoints = summary.recentDaysReport.map((d) => d.total);
        } else {
            labels = summary.currentWeekReport.dailyBreakdown.map((d) => d.day);
            dataPoints = summary.currentWeekReport.dailyBreakdown.map((d) => d.amount);
        }

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

        trendChartInstance.current = new ChartJS(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: trendMode === 'daily' ? 'Daily Spending' : 'Weekly Flow',
                        data: dataPoints,
                        borderColor: '#10b981',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#0f172a',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (item) => ` Spending: ${currency}${Number(item.raw).toFixed(2)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: (value) => `${currency}${value}`,
                        },
                        beginAtZero: true,
                    },
                },
            },
        });

        return () => {
            if (trendChartInstance.current) {
                trendChartInstance.current.destroy();
            }
        };
    }, [summary, trendMode, currency]);

    // Render Payment Methods Bar Chart
    useEffect(() => {
        if (!paymentCanvasRef.current || !summary || summary.paymentBreakdown.length === 0) return;

        if (paymentChartInstance.current) {
            paymentChartInstance.current.destroy();
        }

        const ctx = paymentCanvasRef.current.getContext('2d');
        if (!ctx) return;

        const labels = summary.paymentBreakdown.map((p) => p.method);
        const data = summary.paymentBreakdown.map((p) => p.amount);

        paymentChartInstance.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Total Amount',
                        data,
                        backgroundColor: [
                            '#3b82f6',
                            '#10b981',
                            '#f59e0b',
                            '#8b5cf6',
                            '#ec4899',
                            '#64748b',
                        ],
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: (item) => ` Outflow: ${currency}${Number(item.raw).toFixed(2)}`,
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } },
                    },
                    y: {
                        grid: { color: 'rgba(51, 65, 85, 0.3)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: (value) => `${currency}${value}`,
                        },
                        beginAtZero: true,
                    },
                },
            },
        });

        return () => {
            if (paymentChartInstance.current) {
                paymentChartInstance.current.destroy();
            }
        };
    }, [summary, currency]);

    if (!summary) {
        return <div className="p-8 text-center text-slate-400">Loading charts...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Visual Expense Analytics (Chart.js)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Interactive breakdown of category proportions, historical velocity trends, and payment channels.
                    </p>
                </div>

                {/* Toggle buttons for trend view */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setTrendMode('daily')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            trendMode === 'daily'
                                ? 'bg-emerald-500 text-slate-950 font-semibold'
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setTrendMode('weekly')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                            trendMode === 'weekly'
                                ? 'bg-emerald-500 text-slate-950 font-semibold'
                                : 'text-slate-300 hover:text-white'
                        }`}
                    >
                        Weekly Trend
                    </button>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Trend Area Chart (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                {trendMode === 'daily' ? '7-Day Velocity Curve' : 'Weekly Distribution Curve'}
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400">
              Interactive Hover Tooltips
            </span>
                    </div>

                    <div className="relative h-72 w-full">
                        <canvas ref={trendCanvasRef} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>Peak Spending Day:</span>
                        <span className="text-slate-200 font-semibold">
              {trendMode === 'daily'
                  ? `${currency}${Math.max(...summary.recentDaysReport.map((d) => d.total), 0).toFixed(2)}`
                  : `${currency}${Math.max(...summary.currentWeekReport.dailyBreakdown.map((d) => d.amount), 0).toFixed(2)}`}
            </span>
                    </div>
                </div>

                {/* Category Donut Chart (5 Cols) */}
                <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PieChart className="w-4 h-4 text-teal-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                Category Outflow Share
                            </h3>
                        </div>
                        <span className="text-xs text-slate-400">
              {summary.categoryBreakdown.length} Categories
            </span>
                    </div>

                    <div className="relative h-72 w-full flex items-center justify-center">
                        <canvas ref={donutCanvasRef} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
                        Total Tracked: <strong className="text-slate-100">{currency}{summary.totalSpending.toFixed(2)}</strong>
                    </div>
                </div>
            </div>

            {/* Payment Method Breakdown Bar Chart */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <h3 className="font-semibold text-sm text-slate-100">
                            Payment Method Breakdown
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400">
            Cash, Cards & Transfers
          </span>
                </div>

                <div className="relative h-56 w-full">
                    <canvas ref={paymentCanvasRef} />
                </div>
            </div>
        </div>
    );
};
