import { jsPDF } from 'jspdf';
import { SpendingSummary, Expense } from '../types.js';

/**
 * Generates and downloads the Itemized Financial Audit Statement as a PDF
 */
export function downloadExpenseReportPDF(
    summary: SpendingSummary | null,
    expenses: Expense[],
    currency: string = '$'
) {
    if (!summary) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 18;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129);
    doc.text('FinFlow AI — Financial Statement', margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Monthly Spending Audit • ${new Date().toLocaleDateString()}`, margin, y);
    y += 8;

    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // KPI Metric Cards
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const col1 = margin + 4;
    const col2 = margin + 48;
    const col3 = margin + 98;
    const col4 = margin + 144;

    doc.text('TOTAL SPENT', col1, y + 6);
    doc.text('MONTHLY BUDGET', col2, y + 6);
    doc.text('BUDGET USED', col3, y + 6);
    doc.text('REMAINING', col4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${currency}${summary.totalSpending.toFixed(2)}`, col1, y + 15);
    doc.text(`${currency}${summary.monthlyBudget.toFixed(2)}`, col2, y + 15);
    doc.text(`${summary.budgetUtilizationPercentage}%`, col3, y + 15);
    doc.text(`${currency}${summary.remainingBudget.toFixed(2)}`, col4, y + 15);

    y += 28;

    // Category Breakdown Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Category Outflow Breakdown', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    summary.categoryBreakdown.slice(0, 6).forEach((cat) => {
        doc.setTextColor(71, 85, 105);
        doc.text(`${cat.category} (${cat.count} txns):`, margin, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${currency}${cat.amount.toFixed(2)} (${cat.percentage}%)`, margin + 65, y);
        doc.setFont('helvetica', 'normal');
        y += 5;
    });

    y += 5;

    // Transactions Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Itemized Transaction Records', margin, y);
    y += 6;

    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Date', margin + 2, y + 4.5);
    doc.text('Description', margin + 25, y + 4.5);
    doc.text('Category', margin + 85, y + 4.5);
    doc.text('Payment', margin + 130, y + 4.5);
    doc.text('Amount', margin + 160, y + 4.5);
    y += 8;

    doc.setFont('helvetica', 'normal');
    expenses.slice(0, 22).forEach((e, idx) => {
        if (y > pageHeight - 15) {
            doc.addPage();
            y = 15;
        }
        if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 3.5, pageWidth - margin * 2, 6, 'F');
        }
        doc.setTextColor(71, 85, 105);
        doc.text(e.date, margin + 2, y);
        doc.text(e.description.slice(0, 28), margin + 25, y);
        doc.text(e.category.slice(0, 22), margin + 85, y);
        doc.text(e.paymentMethod, margin + 130, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${currency}${e.amount.toFixed(2)}`, margin + 160, y);
        doc.setFont('helvetica', 'normal');
        y += 5.5;
    });

    doc.save(`FinFlow_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generates and downloads comprehensive transaction details as a multipage PDF document
 */
export function downloadTransactionDetailsPDF(
    expenses: Expense[],
    currency: string = '$',
    filterInfo?: string
) {
    if (!expenses || expenses.length === 0) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 18;

    // Header Banner
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129); // Emerald primary
    doc.text('FinFlow AI — Transaction Detail Statement', margin, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(
        `Export Date: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Filter: ${filterInfo || 'All Recorded Transactions'}`,
        margin,
        y
    );
    y += 6;

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // Compute summary totals
    const totalCount = expenses.length;
    const totalOutflow = expenses
        .filter((e) => (e.type || 'expense') === 'expense')
        .reduce((sum, e) => sum + e.amount, 0);
    const totalInflow = expenses
        .filter((e) => (e.type || 'expense') === 'income')
        .reduce((sum, e) => sum + e.amount, 0);
    const netDiff = totalInflow - totalOutflow;

    // Summary Metrics Bar
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    const col1 = margin + 4;
    const col2 = margin + 48;
    const col3 = margin + 98;
    const col4 = margin + 144;

    doc.text('TOTAL TRANSACTIONS', col1, y + 5);
    doc.text('TOTAL DEBIT / SPENT', col2, y + 5);
    doc.text('TOTAL CREDIT / INCOME', col3, y + 5);
    doc.text('NET STATEMENT BALANCE', col4, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${totalCount} records`, col1, y + 13);
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(`-${currency}${totalOutflow.toFixed(2)}`, col2, y + 13);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`+${currency}${totalInflow.toFixed(2)}`, col3, y + 13);
    doc.setTextColor(netDiff >= 0 ? 16 : 225, netDiff >= 0 ? 185 : 29, netDiff >= 0 ? 129 : 72);
    doc.text(`${netDiff >= 0 ? '+' : ''}${currency}${netDiff.toFixed(2)}`, col4, y + 13);

    y += 24;

    const renderTableHeader = (currentY: number) => {
        doc.setFillColor(30, 41, 59); // Slate-800 dark header
        doc.rect(margin, currentY, pageWidth - margin * 2, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('#', margin + 2, currentY + 4.5);
        doc.text('Date', margin + 10, currentY + 4.5);
        doc.text('Description', margin + 34, currentY + 4.5);
        doc.text('Category', margin + 90, currentY + 4.5);
        doc.text('Payment', margin + 132, currentY + 4.5);
        doc.text('Type', margin + 158, currentY + 4.5);
        doc.text('Amount', margin + 172, currentY + 4.5);
        return currentY + 7;
    };

    y = renderTableHeader(y);

    // Render Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    expenses.forEach((e, index) => {
        if (y > pageHeight - 16) {
            doc.addPage();
            y = 15;
            y = renderTableHeader(y);
        }

        const isEven = index % 2 === 1;
        if (isEven) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 0.5, pageWidth - margin * 2, 6, 'F');
        }

        doc.setTextColor(148, 163, 184);
        doc.text(`${index + 1}`, margin + 2, y + 4);

        doc.setTextColor(71, 85, 105);
        doc.text(e.date, margin + 10, y + 4);

        const desc = e.description.length > 28 ? e.description.substring(0, 26) + '...' : e.description;
        doc.setTextColor(15, 23, 42);
        doc.text(desc, margin + 34, y + 4);

        const cat = e.category.length > 22 ? e.category.substring(0, 20) + '...' : e.category;
        doc.setTextColor(71, 85, 105);
        doc.text(cat, margin + 90, y + 4);

        doc.text(e.paymentMethod, margin + 132, y + 4);

        const isExpense = (e.type || 'expense') === 'expense';
        doc.setTextColor(isExpense ? 225 : 16, isExpense ? 29 : 185, isExpense ? 72 : 129);
        doc.text(isExpense ? 'Debit' : 'Credit', margin + 158, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.text(`${currency}${e.amount.toFixed(2)}`, margin + 172, y + 4);
        doc.setFont('helvetica', 'normal');

        y += 6;
    });

    // Footer page numbers
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`FinFlow AI Statement • Generated ${new Date().toLocaleDateString()}`, margin, pageHeight - 8);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - 8);
    }

    doc.save(`FinFlow_Transaction_Details_${new Date().toISOString().split('T')[0]}.pdf`);
}
