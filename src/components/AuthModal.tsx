import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
    Wallet,
    Sparkles,
    Lock,
    Mail,
    User as UserIcon,
    DollarSign,
    ArrowRight,
    Loader2,
    CheckCircle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
    const { login, signup, demoLogin } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [budget, setBudget] = useState('3000');
    const [currency, setCurrency] = useState('$');

    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(name, email, password, Number(budget) || 3000, currency);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please verify your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async () => {
        setError(null);
        setDemoLoading(true);
        try {
            await demoLogin();
        } catch (err: any) {
            setError('Failed to start demo session. Please try regular login.');
        } finally {
            setDemoLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                        <Wallet className="w-6 h-6 text-slate-950 font-bold" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        <h1 className="text-2xl font-black text-white tracking-tight">FinFlow</h1>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> AI
            </span>
                    </div>
                    <p className="text-xs text-slate-400">
                        Intelligent personal expense tracking with real-time Gemini categorization
                    </p>
                </div>

                {/* 1-Click Demo Account Quick Access */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Instant Demo Account</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                        Pre-loaded with sample expenses, daily/weekly reports, and Chart.js analytics.
                    </p>
                    <button
                        type="button"
                        onClick={handleDemo}
                        disabled={demoLoading || loading}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {demoLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span>Enter Demo as Alex Johnson</span>
                                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </>
                        )}
                    </button>
                </div>

                <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-800 w-full" />
                    <span className="bg-slate-900 px-3 text-[11px] text-slate-400 uppercase tracking-wider absolute">
            Or sign in with email
          </span>
                </div>

                {/* Toggle Login / Register */}
                <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(true);
                            setError(null);
                        }}
                        className={`py-2 rounded-lg transition-all ${
                            isLogin ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(false);
                            setError(null);
                        }}
                        className={`py-2 rounded-lg transition-all ${
                            !isLogin ? 'bg-emerald-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Sarah Miller"
                                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Monthly Budget
                                </label>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Currency Symbol
                                </label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="$">$ (USD / CAD / AUD)</option>
                                    <option value="€">€ (EUR)</option>
                                    <option value="£">£ (GBP)</option>
                                    <option value="₹">₹ (INR)</option>
                                    <option value="¥">¥ (JPY / CNY)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || demoLoading}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <span>{isLogin ? 'Sign In' : 'Create Free Account'}</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
