import { ExpenseCategory } from '../types.js';

export interface CategoryMeta {
    color: string;
    bgLight: string;
    borderColor: string;
    chartColor: string;
    iconName: string;
}

export const CATEGORY_STYLES: Record<ExpenseCategory, CategoryMeta> = {
    'Food & Dining': {
        color: 'text-amber-500',
        bgLight: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        chartColor: '#f59e0b',
        iconName: 'Utensils',
    },
    'Shopping & Retail': {
        color: 'text-pink-500',
        bgLight: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        chartColor: '#ec4899',
        iconName: 'ShoppingBag',
    },
    'Housing & Rent': {
        color: 'text-indigo-500',
        bgLight: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/30',
        chartColor: '#6366f1',
        iconName: 'Home',
    },
    'Transportation': {
        color: 'text-blue-500',
        bgLight: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        chartColor: '#3b82f6',
        iconName: 'Car',
    },
    'Utilities & Bills': {
        color: 'text-cyan-500',
        bgLight: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/30',
        chartColor: '#06b6d4',
        iconName: 'Zap',
    },
    'Healthcare & Medical': {
        color: 'text-rose-500',
        bgLight: 'bg-rose-500/10',
        borderColor: 'border-rose-500/30',
        chartColor: '#f43f5e',
        iconName: 'HeartPulse',
    },
    'Entertainment & Leisure': {
        color: 'text-purple-500',
        bgLight: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        chartColor: '#a855f7',
        iconName: 'Film',
    },
    'Travel & Vacation': {
        color: 'text-emerald-500',
        bgLight: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        chartColor: '#10b981',
        iconName: 'Plane',
    },
    'Education & Learning': {
        color: 'text-teal-500',
        bgLight: 'bg-teal-500/10',
        borderColor: 'border-teal-500/30',
        chartColor: '#14b8a6',
        iconName: 'GraduationCap',
    },
    'Personal Care & Fitness': {
        color: 'text-orange-500',
        bgLight: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        chartColor: '#f97316',
        iconName: 'Dumbbell',
    },
    'Investments & Savings': {
        color: 'text-emerald-400',
        bgLight: 'bg-emerald-400/10',
        borderColor: 'border-emerald-400/30',
        chartColor: '#34d399',
        iconName: 'TrendingUp',
    },
    'Other': {
        color: 'text-slate-400',
        bgLight: 'bg-slate-400/10',
        borderColor: 'border-slate-400/30',
        chartColor: '#94a3b8',
        iconName: 'MoreHorizontal',
    },
};

export function getCategoryStyle(category: ExpenseCategory): CategoryMeta {
    return CATEGORY_STYLES[category] || CATEGORY_STYLES['Other'];
}
