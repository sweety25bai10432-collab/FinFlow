import React, { useState, useEffect } from 'react';
import { AISpendingAnalysis, SpendingSummary, Expense } from '../types.js';
import { aiApi } from '../services/api.js';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ShieldCheck,
    CheckCircle,
    Lightbulb,
    Send,
    Loader2,
    RefreshCw,
    HelpCircle,
    Target,
    Zap,
} from 'lucide-react';

interface AiInsightsViewProps {
    summary: SpendingSummary | null;
    expenses: Expense[];
    currency?: string;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
                                                                  summary,
                                                                  expenses,
                                                                  currency = '$',
                                                              }) => {
    const [analysis, setAnalysis] = useState<AISpendingAnalysis | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Financial Advisor Q&A
    const [question, setQuestion] = useState('');
    const [asking, setAsking] = useState(false);
    const [advisorAnswers, setAdvisorAnswers] = useState<{ q: string; a: string }[]>([]);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await aiApi.getAnalysis();
            setAnalysis(res.analysis);
        } catch (err: any) {
            setError(err.message || 'Failed to generate AI analysis');
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial analysis when user opens this tab
    useEffect(() => {
        if (!analysis && expenses.length > 0) {
            fetchAnalysis();
        }
    }, [expenses.length]);

    const handleAskCoach = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;

        const q = question.trim();
        setAsking(true);
        try {
            const res = await aiApi.askCoach(q);
            setAdvisorAnswers((prev) => [{ q, a: res.answer }, ...prev]);
            setQuestion('');
        } catch (err: any) {
            console.error('Advisor error:', err);
        } finally {
            setAsking(false);
        }
    };

    // Quick preset questions
    const presetQuestions = [
        'How can I save $200 on food & dining this month?',
        'Am I on track with my monthly budget?',
        'What is my biggest discretionary spending risk?',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            AI Spending Analysis & Prediction
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Gemini 3.8 Flash
            </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Machine-learned financial forecasting, anomaly detection, behavioral velocity audits, and cost reduction strategies.
                    </p>
                </div>

                <button
                    onClick={fetchAnalysis}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{analysis ? 'Re-run AI Audit' : 'Generate AI Forecast'}</span>
                </button>
            </div>

            {loading && !analysis && (
                <div className="bg-slate-900/80 rounded-2xl p-12 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-base text-white">
                        Gemini is analyzing your financial records...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Synthesizing category velocities, projecting month-end run rates, and crafting personalized savings recommendations.
                    </p>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                </div>
            )}

            {analysis && (
                <>
                    {/* Top Prediction & Health Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Forecast Card */}
                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                            <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Month-End Spending Forecast
                </span>
                                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {currency}{analysis.predictedMonthEndSpending.toLocaleString()}
                  </span>
                                    <span className="text-xs text-slate-400">projected</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Monthly Budget:</span>
                                    <span className="text-slate-200 font-semibold">
                    {currency}{summary?.monthlyBudget.toLocaleString()}
                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Forecast Variance:</span>
                                    <span
                                        className={`font-semibold ${
                                            summary && analysis.predictedMonthEndSpending > summary.monthlyBudget
                                                ? 'text-rose-400'
                                                : 'text-emerald-400'
                                        }`}
                                    >
                    {summary && analysis.predictedMonthEndSpending > summary.monthlyBudget
                        ? `+${currency}${(analysis.predictedMonthEndSpending - summary.monthlyBudget).toFixed(0)} Over`
                        : `${currency}${((summary?.monthlyBudget || 0) - analysis.predictedMonthEndSpending).toFixed(0)} Surplus`}
                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400">Confidence Score:</span>
                                    <span className="text-teal-400 font-semibold">
                    {analysis.predictionConfidence}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Risk Level Assessment */}
                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                            <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Budget Risk Assessment
                </span>
                                <div className="mt-3 flex items-center gap-2.5">
                                    <div
                                        className={`w-3.5 h-3.5 rounded-full animate-pulse ${
                                            analysis.budgetRiskLevel === 'Safe'
                                                ? 'bg-emerald-400'
                                                : analysis.budgetRiskLevel === 'Moderate'
                                                    ? 'bg-amber-400'
                                                    : 'bg-rose-500'
                                        }`}
                                    />
                                    <span
                                        className={`text-2xl font-bold ${
                                            analysis.budgetRiskLevel === 'Safe'
                                                ? 'text-emerald-400'
                                                : analysis.budgetRiskLevel === 'Moderate'
                                                    ? 'text-amber-400'
                                                    : 'text-rose-400'
                                        }`}
                                    >
                    {analysis.budgetRiskLevel} Risk
                  </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                                {analysis.budgetRiskLevel === 'Safe'
                                    ? 'Your current spending rate is well balanced within budget limits.'
                                    : analysis.budgetRiskLevel === 'Moderate'
                                        ? 'You are approaching your threshold. Keep discretionary purchases in check.'
                                        : 'Spending trajectory exceeds targeted budget. Implement recommended adjustments.'}
                            </div>
                        </div>

                        {/* Total Potential Savings */}
                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between">
                            <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Identified Savings Potential
                </span>
                                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    {currency}
                      {analysis.actionableSavingsTips
                          .reduce((sum, t) => sum + t.estimatedMonthlySavings, 0)
                          .toLocaleString()}
                  </span>
                                    <span className="text-xs text-slate-400">/ month</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                                <span>Based on </span>
                                <strong className="text-slate-200">
                                    {analysis.actionableSavingsTips.length} tailored opportunities
                                </strong>{' '}
                                detected in your spending habits.
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary Narrative */}
                    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                AI Executive Financial Brief
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {analysis.executiveSummary}
                        </p>
                    </div>

                    {/* Key Observations & Anomaly Alerts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Key Observations */}
                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-teal-400" />
                                <h3 className="font-semibold text-sm text-slate-100">
                                    Key Spending Observations
                                </h3>
                            </div>

                            <div className="space-y-2.5">
                                {analysis.keyObservations.map((obs, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                                        <span>{obs}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Anomaly Alerts */}
                        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <h3 className="font-semibold text-sm text-slate-100">
                                    Anomalies & Velocity Alerts
                                </h3>
                            </div>

                            <div className="space-y-2.5">
                                {analysis.anomalyAlerts.length === 0 ? (
                                    <p className="text-xs text-slate-400">No anomalies detected.</p>
                                ) : (
                                    analysis.anomalyAlerts.map((alert, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                                                alert.severity === 'high'
                                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                                    : alert.severity === 'medium'
                                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                                        : 'bg-slate-800/50 border-slate-700 text-slate-300'
                                            }`}
                                        >
                                            <div className="font-semibold flex items-center justify-between">
                                                <span>{alert.title}</span>
                                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/30">
                          {alert.severity} priority
                        </span>
                                            </div>
                                            <p className="text-[11px] opacity-90 leading-relaxed">
                                                {alert.description}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actionable Savings Recommendations */}
                    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-semibold text-sm text-slate-100">
                                Actionable Savings Strategies
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {analysis.actionableSavingsTips.map((tip, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between"
                                >
                                    <div className="space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {tip.category}
                    </span>
                                        <p className="text-xs text-slate-200 leading-snug font-medium">
                                            {tip.tip}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Estimated Savings:</span>
                                        <span className="font-bold text-emerald-400">
                      +{currency}{tip.estimatedMonthlySavings}/mo
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Interactive AI Financial Coach Prompt Section */}
            <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-400" />
                    <h3 className="font-semibold text-sm text-slate-100">
                        Ask Your AI Financial Coach
                    </h3>
                </div>
                <p className="text-xs text-slate-400">
                    Have a question about your spending habits, upcoming purchase decisions, or budget cuts? Ask directly:
                </p>

                {/* Preset pill questions */}
                <div className="flex flex-wrap gap-2">
                    {presetQuestions.map((pq, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setQuestion(pq)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        >
                            "{pq}"
                        </button>
                    ))}
                </div>

                {/* Question Form */}
                <form onSubmit={handleAskCoach} className="flex gap-2">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. How can I reduce my grocery spending or build an emergency fund?"
                        className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button
                        type="submit"
                        disabled={asking || !question.trim()}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-40"
                    >
                        {asking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Ask</span>
                    </button>
                </form>

                {/* Answers List */}
                {advisorAnswers.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                        {advisorAnswers.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-1.5 text-xs"
                            >
                                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Q: {item.q}</span>
                                </div>
                                <p className="text-slate-200 leading-relaxed whitespace-pre-line pl-5">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
