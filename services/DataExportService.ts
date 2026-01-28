import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Transaction {
    id: string;
    type: string;
    title: string;
    amount: string;
    date: Date | string;
    category: string;
    status?: string;
    clientName?: string;
    notes?: string;
    isIncome?: boolean;
}

// Convert transactions to CSV format
export const transactionsToCSV = (transactions: Transaction[]): string => {
    const headers = [
        'תאריך',
        'סוג',
        'כותרת',
        'סכום',
        'קטגוריה',
        'לקוח',
        'סטטוס',
        'הערות'
    ];

    const rows = transactions.map(t => {
        const date = new Date(t.date).toLocaleDateString('he-IL');
        const type = t.type === 'invoice' ? 'הכנסה' : 'הוצאה';
        const amount = t.amount.replace(/[^0-9.-]+/g, '');
        const status = t.status === 'paid' ? 'שולם' : t.status === 'overdue' ? 'בפיגור' : 'ממתין';

        return [
            date,
            type,
            t.title || '',
            amount,
            t.category || '',
            t.clientName || '',
            status,
            (t.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
        ].map(field => `"${field}"`).join(',');
    });

    // Add BOM for Hebrew support in Excel
    const BOM = '\uFEFF';
    return BOM + headers.join(',') + '\n' + rows.join('\n');
};

// Generate monthly summary CSV
export const generateMonthlySummaryCSV = (
    transactions: Transaction[],
    month: number,
    year: number
): string => {
    const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
    });

    const income = monthTransactions
        .filter(t => t.type === 'invoice')
        .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);

    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);

    const profit = income - expenses;

    const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    const summary = [
        `סיכום חודשי - ${monthNames[month]} ${year}`,
        '',
        `סה"כ הכנסות,₪${income.toLocaleString()}`,
        `סה"כ הוצאות,₪${expenses.toLocaleString()}`,
        `רווח נקי,₪${profit.toLocaleString()}`,
        '',
        'פירוט עסקאות:',
        ''
    ];

    const BOM = '\uFEFF';
    return BOM + summary.join('\n') + '\n' + transactionsToCSV(monthTransactions);
};

// Generate yearly summary CSV
export const generateYearlySummaryCSV = (
    transactions: Transaction[],
    year: number
): string => {
    const yearTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year;
    });

    const monthNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    // Monthly breakdown
    const monthlyData = monthNames.map((name, index) => {
        const monthTx = yearTransactions.filter(t => new Date(t.date).getMonth() === index);
        const income = monthTx
            .filter(t => t.type === 'invoice')
            .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);
        const expenses = monthTx
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0), 0);

        return { name, income, expenses, profit: income - expenses };
    });

    const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
    const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
    const totalProfit = totalIncome - totalExpenses;

    // Category breakdown
    const categories: { [key: string]: { income: number; expenses: number } } = {};
    yearTransactions.forEach(t => {
        const cat = t.category || 'אחר';
        if (!categories[cat]) {
            categories[cat] = { income: 0, expenses: 0 };
        }
        const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0;
        if (t.type === 'invoice') {
            categories[cat].income += amount;
        } else {
            categories[cat].expenses += amount;
        }
    });

    const BOM = '\uFEFF';
    let csv = BOM;

    // Header
    csv += `דוח שנתי - ${year}\n\n`;

    // Summary
    csv += `סיכום שנתי\n`;
    csv += `סה"כ הכנסות,₪${totalIncome.toLocaleString()}\n`;
    csv += `סה"כ הוצאות,₪${totalExpenses.toLocaleString()}\n`;
    csv += `רווח נקי,₪${totalProfit.toLocaleString()}\n\n`;

    // Monthly breakdown
    csv += `פירוט חודשי\n`;
    csv += `חודש,הכנסות,הוצאות,רווח\n`;
    monthlyData.forEach(m => {
        csv += `${m.name},₪${m.income.toLocaleString()},₪${m.expenses.toLocaleString()},₪${m.profit.toLocaleString()}\n`;
    });
    csv += '\n';

    // Category breakdown
    csv += `פירוט לפי קטגוריה\n`;
    csv += `קטגוריה,הכנסות,הוצאות\n`;
    Object.entries(categories).forEach(([cat, data]) => {
        csv += `${cat},₪${data.income.toLocaleString()},₪${data.expenses.toLocaleString()}\n`;
    });
    csv += '\n';

    // All transactions
    csv += `כל העסקאות\n`;
    csv += transactionsToCSV(yearTransactions);

    return csv;
};

// Export and share CSV file
export const exportAndShareCSV = async (
    content: string,
    filename: string
): Promise<void> => {
    try {
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'ייצוא נתונים',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Error exporting CSV:', error);
        throw error;
    }
};

// Export transactions
export const exportTransactions = async (
    transactions: Transaction[],
    type: 'all' | 'monthly' | 'yearly' = 'all',
    options?: { month?: number; year?: number }
): Promise<void> => {
    const now = new Date();
    const year = options?.year ?? now.getFullYear();
    const month = options?.month ?? now.getMonth();

    let content: string;
    let filename: string;

    switch (type) {
        case 'monthly':
            content = generateMonthlySummaryCSV(transactions, month, year);
            filename = `finly_report_${year}_${String(month + 1).padStart(2, '0')}.csv`;
            break;
        case 'yearly':
            content = generateYearlySummaryCSV(transactions, year);
            filename = `finly_report_${year}.csv`;
            break;
        default:
            content = transactionsToCSV(transactions);
            filename = `finly_transactions_${now.toISOString().split('T')[0]}.csv`;
    }

    await exportAndShareCSV(content, filename);
};
