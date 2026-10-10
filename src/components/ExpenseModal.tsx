import React, { useState, useEffect } from 'react';
import {
    Expense,
    ExpenseCategory,
    PaymentMethod,
    EXPENSE_CATEGORIES,
    PAYMENT_METHODS,
    AICategoryResponse,
} from '../types.js';
import { aiApi } from '../services/api.js';
import {
    X,
    Sparkles,
    Loader2,
    Calendar,
    CreditCard,
    FileText,
    DollarSign,
    Tag,
    CheckCircle2,
} from 'lucide-react';
import { getCategoryStyle } from '../utils/categoryTheme.js';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        id?: string;
        description: string;
        amount: number;
        date: string;
        category: ExpenseCategory;
        paymentMethod: PaymentMethod;
        notes?: string;
        aiCategorized?: boolean;
    }) => Promise<void>;
    initialData?: Expense | null;
    currency?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              onSubmit,
                                                              initialData,
                                                              currency = '$',
                                                          }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
    const [notes, setNotes] = useState('');

    // AI Categorization states
    const [isDetectingCategory, setIsDetectingCategory] = useState(false);
    const [aiResult, setAiResult] = useState<AICategoryResponse | null>(null);
    const [isAiApplied, setIsAiApplied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize or reset state when modal opens
    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description);
            setAmount(initialData.amount.toString());
            setDate(initialData.date);
            setCategory(initialData.category);
            setPaymentMethod(initialData.paymentMethod);
            setNotes(initialData.notes || '');
            setIsAiApplied(Boolean(initialData.aiCategorized));
            setAiResult(null);
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory('Food & Dining');
            setPaymentMethod('Credit Card');
            setNotes('');
            setIsAiApplied(false);
            setAiResult(null);
        }
        setError(null);
    }, [initialData, isOpen]);

    // Trigger Gemini AI auto-detection
    const handleDetectAI = async (textToDetect?: string) => {
        const text = (textToDetect || description).trim();
        if (!text || text.length < 3) return;

        setIsDetectingCategory(true);
        setError(null);
        try {
            const result = await aiApi.categorize(text, amount ? Number(amount) : undefined);
            setAiResult(result);
            setCategory(result.category);
            setIsAiApplied(true);
        } catch (err: any) {
            console.warn('AI Category Detection notice:', err);
        } finally {
            setIsDetectingCategory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Description is required.');
            return;
        }
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Amount must be a valid positive number.');
            return;
        }
        if (!date) {
            setError('Please select a date.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onSubmit({
                id: initialData ? initialData.id : undefined,
                description: description.trim(),
                amount: numAmount,
                date,
                category,
                paymentMethod,
                notes: notes.trim() || undefined,
                aiCategorized: isAiApplied,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save expense');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const currentCategoryStyle = getCategoryStyle(category);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Tag className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-white">
                                {initialData ? 'Edit Expense Record' : 'Record New Expense'}
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                {initialData ? 'Update transaction details' : 'Gemini AI will automatically suggest the category'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    {/* Description Input & AI Auto-detection trigger */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Description / Merchant Name <span className="text-emerald-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => {
                                    if (!initialData && description.length >= 3 && !isAiApplied) {
                                        handleDetectAI();
                                    }
                                }}
                                placeholder="e.g., Trader Joe's, Uber to Airport, Netflix, Rent..."
                                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 pr-24"
                            />
                            <button
                                type="button"
                                onClick={() => handleDetectAI()}
                                disabled={isDetectingCategory || description.trim().length < 2}
                                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {isDetectingCategory ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                                <span>AI Auto-Detect</span>
                            </button>
                        </div>
                    </div>

                    {/* AI Detection Result pill if triggered */}
                    {aiResult && (
                        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Category Matched: {aiResult.category}
                </span>
                                <span className="text-[10px] text-emerald-300/80">
                  {Math.round(aiResult.confidence * 100)}% Confidence
                </span>
                            </div>
                            <p className="text-[11px] text-slate-300">
                                {aiResult.reasoning}
                            </p>
                        </div>
                    )}

                    {/* Amount & Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Amount ({currency}) <span className="text-emerald-400">*</span>
                            </label>
                            <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                  {currency}
                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1.5">
                                Date <span className="text-emerald-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Selector */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-slate-300">
                                Expense Category
                            </label>
                            {isAiApplied && (
                                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-selected by Gemini
                </span>
                            )}
                        </div>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value as ExpenseCategory);
                                setIsAiApplied(false);
                            }}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        >
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        >
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm} value={pm}>
                                    {pm}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Notes Optional */}
                    <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                            Notes / Receipt Details (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Shared with roommates, tax deductible, lunch meeting..."
                            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                        />
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{initialData ? 'Update Expense' : 'Save Expense'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
