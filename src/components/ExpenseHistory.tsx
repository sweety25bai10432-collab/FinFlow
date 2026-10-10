import React, { useState } from 'react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types.js';
import { getCategoryStyle } from '../utils/categoryTheme.js';
import { downloadTransactionDetailsPDF } from '../utils/pdfGenerator.js';
import {
    Search,
    Filter,
    ArrowUpDown,
    Edit2,
    Trash2,
    Download,
    Plus,
    Sparkles,
    Calendar,
    CreditCard,
    FileDown,
    AlertCircle,
} from 'lucide-react';

interface ExpenseHistoryProps {
    expenses: Expense[];
    currency?: string;
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => Promise<void>;
    onAddNew: () => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
                                                                  expenses,
                                                                  currency = '$',
                                                                  onEdit,
                                                                  onDelete,
                                                                  onAddNew,
                                                              }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Compute filtered expenses
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const filtered = expenses.filter((e) => {
        // Search
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            const match =
                e.description.toLowerCase().includes(q) ||
                e.category.toLowerCase().includes(q) ||
                (e.notes && e.notes.toLowerCase().includes(q));
            if (!match) return false;
        }

        // Category
        if (selectedCategory !== 'All' && e.category !== selectedCategory) {
            return false;
        }

        // Date
        if (dateFilter === 'today' && e.date !== todayStr) return false;
        if (dateFilter === 'week' && e.date < weekStartStr) return false;
        if (dateFilter === 'month' && e.date < monthStartStr) return false;

        return true;
    });

    // Sort
    filtered.sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
    });

    // Export to PDF Statement
    const handleExportPDF = () => {
        if (filtered.length === 0) return;
        const filterDescription = search ? `Search query: "${search}"` : selectedCategory !== 'All' ? `Category: ${selectedCategory}` : undefined;
        downloadTransactionDetailsPDF(filtered, currency, filterDescription);
    };

    const totalFilteredAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Expense History & Management
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Itemized transactions with full search, category filtering, and PDF statement export.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExportPDF}
                        disabled={filtered.length === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-xs font-semibold border border-emerald-500/30 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                        title="Download formatted Transaction Detail PDF"
                    >
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export Transactions (PDF)</span>
                    </button>
                    <button
                        onClick={onAddNew}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="sm:col-span-5 relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search description, merchant, notes..."
                            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className="sm:col-span-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <option value="All">All Categories</option>
                            {EXPENSE_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Quick Filter */}
                    <div className="sm:col-span-2">
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="sm:col-span-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="amount_desc">Highest Amount</option>
                            <option value="amount_asc">Lowest Amount</option>
                        </select>
                    </div>
                </div>

                {/* Results summary bar */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/70">
          <span>
            Showing <strong className="text-slate-200">{filtered.length}</strong> of{' '}
              <strong className="text-slate-200">{expenses.length}</strong> transactions
          </span>
                    <span>
            Filtered Total: <strong className="text-emerald-400">{currency}{totalFilteredAmount.toFixed(2)}</strong>
          </span>
                </div>
            </div>

            {/* Expenses Table / Cards */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 mb-3">
                            <Search className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200">No expenses found</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            No transactions match your current search or filters. Clear your filters or add a new expense.
                        </p>
                        <button
                            onClick={onAddNew}
                            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Record Expense</span>
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-5 py-3.5 font-semibold">Date</th>
                                <th className="px-5 py-3.5 font-semibold">Description</th>
                                <th className="px-5 py-3.5 font-semibold">Category</th>
                                <th className="px-5 py-3.5 font-semibold">Payment</th>
                                <th className="px-5 py-3.5 font-semibold text-right">Amount</th>
                                <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-200">
                            {filtered.map((item) => {
                                const style = getCategoryStyle(item.category);
                                const isDeleting = deletingId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-800/40 transition-colors group"
                                    >
                                        {/* Date */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                                            {item.date}
                                        </td>

                                        {/* Description & AI badge & Notes */}
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-100">
                            {item.description}
                          </span>
                                                {item.aiCategorized && (
                                                    <span
                                                        title="Categorized by Gemini AI"
                                                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                    >
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                                                )}
                                            </div>
                                            {item.notes && (
                                                <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                                                    {item.notes}
                                                </p>
                                            )}
                                        </td>

                                        {/* Category Badge */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${style.bgLight} ${style.color} ${style.borderColor}`}
                        >
                          {item.category}
                        </span>
                                        </td>

                                        {/* Payment Method */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 text-[11px]">
                                            {item.paymentMethod}
                                        </td>

                                        {/* Amount */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right font-bold text-slate-100 text-sm">
                                            {currency}{item.amount.toFixed(2)}
                                        </td>

                                        {/* Edit / Delete CRUD buttons */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    title="Edit Expense"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Are you sure you want to delete "${item.description}"?`)) {
                                                            setDeletingId(item.id);
                                                            await onDelete(item.id);
                                                            setDeletingId(null);
                                                        }
                                                    }}
                                                    disabled={isDeleting}
                                                    title="Delete Expense"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
