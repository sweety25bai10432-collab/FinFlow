import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, Sliders, DollarSign, Loader2, Check } from 'lucide-react';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBudgetUpdated: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            onBudgetUpdated,
                                                        }) => {
    const { user, updateBudget } = useAuth();
    const [budget, setBudget] = useState(user?.monthlyBudget ? user.monthlyBudget.toString() : '3000');
    const [currency, setCurrency] = useState(user?.currency || '$');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = Number(budget);
        if (isNaN(val) || val <= 0) {
            setError('Budget must be a positive number');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await updateBudget(val, currency);
            onBudgetUpdated();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update budget settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-bold text-sm text-white">Monthly Budget Target</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {error && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="block text-slate-300 font-medium mb-1">
                            Monthly Budget Ceiling
                        </label>
                        <input
                            type="number"
                            required
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 font-medium mb-1">
                            Currency Symbol
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <option value="$">$ - US Dollar / CAD / AUD</option>
                            <option value="€">€ - Euro</option>
                            <option value="£">£ - British Pound</option>
                            <option value="₹">₹ - Indian Rupee</option>
                            <option value="¥">¥ - Japanese Yen / Yuan</option>
                        </select>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold flex items-center gap-1.5 transition-all"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
