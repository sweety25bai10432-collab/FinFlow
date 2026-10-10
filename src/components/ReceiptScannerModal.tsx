import React, { useState } from 'react';
import { aiApi, expenseApi } from '../services/api.js';
import { ReceiptScanResult, ExpenseCategory } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    X,
    Camera,
    Upload,
    Receipt,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileText,
    DollarSign,
    Calendar,
    Building,
    Tag,
    Plus,
} from 'lucide-react';

interface ReceiptScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExpenseAdded: () => void;
    currency?: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onExpenseAdded,
                                                                            currency = '$',
                                                                        }) => {
    const { isDark } = useTheme();
    const [inputText, setInputText] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPreviewImage(base64);
            triggerScan(base64, true);
        };
        reader.readAsDataURL(file);
    };

    const triggerScan = async (data: string, isImage: boolean = false) => {
        setIsScanning(true);
        setScanResult(null);
        try {
            const res = await aiApi.scanReceipt(data, isImage);
            setScanResult(res.result);
        } catch (err) {
            console.error('Scan failed:', err);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSaveExpense = async () => {
        if (!scanResult) return;
        setIsSaving(true);
        try {
            await expenseApi.addExpense({
                description: scanResult.merchant,
                amount: scanResult.amount,
                category: scanResult.category,
                date: scanResult.date,
                paymentMethod: scanResult.paymentMethod,
                receiptItems: scanResult.items,
                taxAmount: scanResult.tax,
                notes: `Scanned from Receipt OCR • Tax: ${currency}${scanResult.tax || 0}`,
                aiCategorized: true,
            });
            setSaveSuccess(true);
            onExpenseAdded();
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to save scanned expense:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const sampleReceiptText = `TRADER JOE'S #142
751 E. Blithedale Ave, Mill Valley, CA
DATE: ${new Date().toISOString().split('T')[0]}  TIME: 14:32

Organic Baby Spinach         $3.49
Almond Milk Unsweetened      $2.99
Cold Brew Concentrate Coffee $8.99
Wild Pacific Salmon Filet   $14.50
Dark Chocolate Peanut Cups   $4.99
-----------------------------------
SUBTOTAL:                   $34.96
TAX (8.25%):                 $2.88
TOTAL AMOUNT:               $37.84
PAYMENT: VISA ENDING IN 4821`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div
                className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-colors ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${
                        isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm">Smart Receipt & Invoice Scanner</h3>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">
                  OCR + Gemini
                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Upload photos or paste invoice text to auto-extract merchant, total & line items
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
                    {/* Upload Area / Camera simulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                isDark
                                    ? 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/40 hover:bg-slate-800/80'
                                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                            <Upload className="w-6 h-6 text-emerald-400" />
                            <div className="text-center">
                                <span className="font-semibold block text-slate-200 dark:text-white">Upload Receipt Photo</span>
                                <span className="text-[10px] text-slate-400">PNG, JPG, or PDF</span>
                            </div>
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setInputText(sampleReceiptText);
                                triggerScan(sampleReceiptText, false);
                            }}
                            className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                isDark
                                    ? 'border-slate-700 hover:border-teal-500/50 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                                    : 'border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            <FileText className="w-6 h-6 text-teal-400" />
                            <div className="text-center">
                                <span className="font-semibold block">Load Sample Receipt</span>
                                <span className="text-[10px] text-slate-400">Trader Joe's itemized bill</span>
                            </div>
                        </button>
                    </div>

                    {/* Text Input Option */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Or Paste Receipt Text / E-Invoice
                            </label>
                            {inputText && (
                                <button
                                    onClick={() => setInputText('')}
                                    className="text-[10px] text-slate-400 hover:text-rose-400"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            rows={4}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste merchant receipt text, invoice details, or bill breakdown here..."
                            className={`w-full rounded-2xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border transition-colors ${
                                isDark
                                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500'
                                    : 'bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            }`}
                        />
                        {inputText && (
                            <button
                                type="button"
                                disabled={isScanning}
                                onClick={() => triggerScan(inputText, false)}
                                className="mt-2 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>Analyze Receipt with AI</span>
                            </button>
                        )}
                    </div>

                    {/* Loading Indicator */}
                    {isScanning && (
                        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col items-center justify-center gap-2 text-center animate-pulse">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                            <p className="font-bold text-xs text-emerald-300">Scanning Receipt & Running OCR...</p>
                            <p className="text-[10px] text-slate-400">
                                Extracting merchant name, line items, taxes, and categorizing with Gemini
                            </p>
                        </div>
                    )}

                    {/* Extracted Data Card */}
                    {scanResult && !isScanning && (
                        <div
                            className={`p-4 rounded-2xl border space-y-3.5 ${
                                isDark ? 'bg-slate-800/60 border-emerald-500/40' : 'bg-emerald-50/60 border-emerald-300'
                            }`}
                        >
                            <div className="flex items-center justify-between border-b pb-2.5 border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-sm text-slate-100 dark:text-white">
                    {scanResult.merchant}
                  </span>
                                </div>
                                <span className="font-extrabold text-base text-emerald-400">
                  {currency}{scanResult.amount.toFixed(2)}
                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Category</span>
                                    <strong className="text-emerald-400 truncate block">{scanResult.category}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Date</span>
                                    <strong className="text-slate-200 block">{scanResult.date}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Tax Paid</span>
                                    <strong className="text-slate-200 block">{currency}{(scanResult.tax || 0).toFixed(2)}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Payment</span>
                                    <strong className="text-slate-200 block">{scanResult.paymentMethod}</strong>
                                </div>
                            </div>

                            {/* Line Items */}
                            {scanResult.items && scanResult.items.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Detected Line Items ({scanResult.items.length})
                  </span>
                                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                                        {scanResult.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300"
                                            >
                                                <span className="truncate pr-2">{item.name}</span>
                                                <span className="font-bold shrink-0">{currency}{item.price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action */}
                            <button
                                type="button"
                                disabled={isSaving || saveSuccess}
                                onClick={handleSaveExpense}
                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                                ) : (
                                    <Plus className="w-4 h-4 stroke-[2.5]" />
                                )}
                                <span>{saveSuccess ? 'Logged to Expenses!' : 'Confirm & Add to Expenses'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { aiApi, expenseApi } from '../services/api.js';
import { ReceiptScanResult, ExpenseCategory } from '../types.js';
import { useTheme } from '../context/ThemeContext.js';
import {
    X,
    Camera,
    Upload,
    Receipt,
    Sparkles,
    Loader2,
    CheckCircle2,
    AlertCircle,
    FileText,
    DollarSign,
    Calendar,
    Building,
    Tag,
    Plus,
} from 'lucide-react';

interface ReceiptScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExpenseAdded: () => void;
    currency?: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
                                                                            isOpen,
                                                                            onClose,
                                                                            onExpenseAdded,
                                                                            currency = '$',
                                                                        }) => {
    const { isDark } = useTheme();
    const [inputText, setInputText] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ReceiptScanResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    if (!isOpen) return null;

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPreviewImage(base64);
            triggerScan(base64, true);
        };
        reader.readAsDataURL(file);
    };

    const triggerScan = async (data: string, isImage: boolean = false) => {
        setIsScanning(true);
        setScanResult(null);
        try {
            const res = await aiApi.scanReceipt(data, isImage);
            setScanResult(res.result);
        } catch (err) {
            console.error('Scan failed:', err);
        } finally {
            setIsScanning(false);
        }
    };

    const handleSaveExpense = async () => {
        if (!scanResult) return;
        setIsSaving(true);
        try {
            await expenseApi.addExpense({
                description: scanResult.merchant,
                amount: scanResult.amount,
                category: scanResult.category,
                date: scanResult.date,
                paymentMethod: scanResult.paymentMethod,
                receiptItems: scanResult.items,
                taxAmount: scanResult.tax,
                notes: `Scanned from Receipt OCR • Tax: ${currency}${scanResult.tax || 0}`,
                aiCategorized: true,
            });
            setSaveSuccess(true);
            onExpenseAdded();
            setTimeout(() => {
                setSaveSuccess(false);
                onClose();
            }, 1500);
        } catch (err) {
            console.error('Failed to save scanned expense:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const sampleReceiptText = `TRADER JOE'S #142
751 E. Blithedale Ave, Mill Valley, CA
DATE: ${new Date().toISOString().split('T')[0]}  TIME: 14:32

Organic Baby Spinach         $3.49
Almond Milk Unsweetened      $2.99
Cold Brew Concentrate Coffee $8.99
Wild Pacific Salmon Filet   $14.50
Dark Chocolate Peanut Cups   $4.99
-----------------------------------
SUBTOTAL:                   $34.96
TAX (8.25%):                 $2.88
TOTAL AMOUNT:               $37.84
PAYMENT: VISA ENDING IN 4821`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div
                className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden my-6 transition-colors ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${
                        isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm">Smart Receipt & Invoice Scanner</h3>
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400">
                  OCR + Gemini
                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                                Upload photos or paste invoice text to auto-extract merchant, total & line items
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
                    {/* Upload Area / Camera simulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                            className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                                isDark
                                    ? 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/40 hover:bg-slate-800/80'
                                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100'
                            }`}
                        >
                            <Upload className="w-6 h-6 text-emerald-400" />
                            <div className="text-center">
                                <span className="font-semibold block text-slate-200 dark:text-white">Upload Receipt Photo</span>
                                <span className="text-[10px] text-slate-400">PNG, JPG, or PDF</span>
                            </div>
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setInputText(sampleReceiptText);
                                triggerScan(sampleReceiptText, false);
                            }}
                            className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                isDark
                                    ? 'border-slate-700 hover:border-teal-500/50 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                                    : 'border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-slate-100 text-slate-700'
                            }`}
                        >
                            <FileText className="w-6 h-6 text-teal-400" />
                            <div className="text-center">
                                <span className="font-semibold block">Load Sample Receipt</span>
                                <span className="text-[10px] text-slate-400">Trader Joe's itemized bill</span>
                            </div>
                        </button>
                    </div>

                    {/* Text Input Option */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                Or Paste Receipt Text / E-Invoice
                            </label>
                            {inputText && (
                                <button
                                    onClick={() => setInputText('')}
                                    className="text-[10px] text-slate-400 hover:text-rose-400"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <textarea
                            rows={4}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste merchant receipt text, invoice details, or bill breakdown here..."
                            className={`w-full rounded-2xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border transition-colors ${
                                isDark
                                    ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder:text-slate-500'
                                    : 'bg-slate-100 border-slate-200 text-slate-800 placeholder:text-slate-400'
                            }`}
                        />
                        {inputText && (
                            <button
                                type="button"
                                disabled={isScanning}
                                onClick={() => triggerScan(inputText, false)}
                                className="mt-2 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>Analyze Receipt with AI</span>
                            </button>
                        )}
                    </div>

                    {/* Loading Indicator */}
                    {isScanning && (
                        <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col items-center justify-center gap-2 text-center animate-pulse">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                            <p className="font-bold text-xs text-emerald-300">Scanning Receipt & Running OCR...</p>
                            <p className="text-[10px] text-slate-400">
                                Extracting merchant name, line items, taxes, and categorizing with Gemini
                            </p>
                        </div>
                    )}

                    {/* Extracted Data Card */}
                    {scanResult && !isScanning && (
                        <div
                            className={`p-4 rounded-2xl border space-y-3.5 ${
                                isDark ? 'bg-slate-800/60 border-emerald-500/40' : 'bg-emerald-50/60 border-emerald-300'
                            }`}
                        >
                            <div className="flex items-center justify-between border-b pb-2.5 border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span className="font-bold text-sm text-slate-100 dark:text-white">
                    {scanResult.merchant}
                  </span>
                                </div>
                                <span className="font-extrabold text-base text-emerald-400">
                  {currency}{scanResult.amount.toFixed(2)}
                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Category</span>
                                    <strong className="text-emerald-400 truncate block">{scanResult.category}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Date</span>
                                    <strong className="text-slate-200 block">{scanResult.date}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Tax Paid</span>
                                    <strong className="text-slate-200 block">{currency}{(scanResult.tax || 0).toFixed(2)}</strong>
                                </div>
                                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-700/40">
                                    <span className="text-slate-400 block text-[10px]">Payment</span>
                                    <strong className="text-slate-200 block">{scanResult.paymentMethod}</strong>
                                </div>
                            </div>

                            {/* Line Items */}
                            {scanResult.items && scanResult.items.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Detected Line Items ({scanResult.items.length})
                  </span>
                                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                                        {scanResult.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300"
                                            >
                                                <span className="truncate pr-2">{item.name}</span>
                                                <span className="font-bold shrink-0">{currency}{item.price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action */}
                            <button
                                type="button"
                                disabled={isSaving || saveSuccess}
                                onClick={handleSaveExpense}
                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saveSuccess ? (
                                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                                ) : (
                                    <Plus className="w-4 h-4 stroke-[2.5]" />
                                )}
                                <span>{saveSuccess ? 'Logged to Expenses!' : 'Confirm & Add to Expenses'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
