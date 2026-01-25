import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface Transaction {
    id: string;
    type: 'income' | 'expense' | 'invoice';
    title?: string;
    amount: string | number;
    date: string;
    category?: string;
    supplier?: string;
    clientName?: string;
    notes?: string;
    description?: string;
}

export const exportToCSV = async (transactions: Transaction[], filename: string = 'finly_export.csv') => {
    try {
        // Create CSV header
        const headers = ['תאריך', 'סוג', 'סכום', 'קטגוריה', 'ספק/לקוח', 'תיאור', 'הערות'];

        // Create CSV rows
        const rows = transactions.map(t => {
            const date = new Date(t.date).toLocaleDateString('he-IL');
            const type = t.type === 'expense' ? 'הוצאה' : t.type === 'income' ? 'הכנסה' : 'חשבונית';
            const amount = typeof t.amount === 'string' ? t.amount : t.amount.toString();
            const category = t.category || '';
            const supplier = t.supplier || t.clientName || '';
            const description = t.title || t.description || '';
            const notes = t.notes || '';

            // Escape commas and quotes in CSV
            const escape = (str: string) => {
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            return [
                escape(date),
                escape(type),
                escape(amount),
                escape(category),
                escape(supplier),
                escape(description),
                escape(notes)
            ].join(',');
        });

        // Combine header and rows
        const csv = [headers.join(','), ...rows].join('\n');

        // Add BOM for Hebrew support in Excel
        const bom = '\uFEFF';
        const csvWithBom = bom + csv;

        // Save to file
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, csvWithBom, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'ייצא נתונים',
                UTI: 'public.comma-separated-values-text',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }

        return true;
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
};

export const exportToExcel = async (transactions: Transaction[], filename: string = 'finly_export.xlsx') => {
    // For now, use CSV format which Excel can open
    // In the future, can use a library like xlsx for true Excel format
    return exportToCSV(transactions, filename.replace('.xlsx', '.csv'));
};
