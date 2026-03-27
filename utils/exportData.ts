import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

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

export const exportToPDF = async (transactions: Transaction[], filename: string = 'finly_export.pdf') => {
    try {
        // Calculate totals by category
        const categoryTotals: { [key: string]: number } = {};
        let totalAmount = 0;

        transactions.forEach(t => {
            const amount = typeof t.amount === 'string'
                ? parseFloat(t.amount.replace(/[^0-9.-]+/g, '')) || 0
                : t.amount;
            const category = t.category || 'אחר';
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            totalAmount += amount;
        });

        // Sort categories by amount
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);

        // Generate HTML for PDF
        const html = `
            <!DOCTYPE html>
            <html dir="rtl" lang="he">
            <head>
                <meta charset="utf-8">
                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 40px;
                        direction: rtl;
                        color: #333;
                        line-height: 1.6;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4F7DF3;
                    }
                    .header h1 {
                        color: #4F7DF3;
                        font-size: 28px;
                        margin-bottom: 10px;
                    }
                    .header p {
                        color: #666;
                        font-size: 14px;
                    }
                    .summary {
                        display: flex;
                        justify-content: space-between;
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 30px;
                    }
                    .summary-item {
                        text-align: center;
                    }
                    .summary-label {
                        color: #666;
                        font-size: 12px;
                        margin-bottom: 5px;
                    }
                    .summary-value {
                        color: #333;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .section-title {
                        font-size: 18px;
                        color: #333;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    .category-list {
                        margin-bottom: 30px;
                    }
                    .category-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .category-name {
                        color: #333;
                    }
                    .category-amount {
                        color: #E53935;
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                        font-size: 12px;
                    }
                    th {
                        background: #4F7DF3;
                        color: white;
                        padding: 12px 8px;
                        text-align: right;
                    }
                    td {
                        padding: 10px 8px;
                        border-bottom: 1px solid #eee;
                    }
                    tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    .expense-amount {
                        color: #E53935;
                        font-weight: bold;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        color: #999;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>דו"ח הוצאות - FInly</h1>
                    <p>נוצר בתאריך: ${new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-label">סה"כ הוצאות</div>
                        <div class="summary-value">₪${totalAmount.toLocaleString()}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">מספר פריטים</div>
                        <div class="summary-value">${transactions.length}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">קטגוריות</div>
                        <div class="summary-value">${sortedCategories.length}</div>
                    </div>
                </div>

                <div class="category-list">
                    <h2 class="section-title">חלוקה לפי קטגוריה</h2>
                    ${sortedCategories.map(([category, amount]) => `
                        <div class="category-item">
                            <span class="category-name">${category}</span>
                            <span class="category-amount">₪${amount.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>

                <h2 class="section-title">פירוט הוצאות</h2>
                <table>
                    <thead>
                        <tr>
                            <th>תאריך</th>
                            <th>קטגוריה</th>
                            <th>ספק</th>
                            <th>תיאור</th>
                            <th>סכום</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('he-IL')}</td>
                                <td>${t.category || '-'}</td>
                                <td>${t.supplier || t.clientName || '-'}</td>
                                <td>${t.title || t.description || '-'}</td>
                                <td class="expense-amount">${typeof t.amount === 'string' ? t.amount : `₪${t.amount.toLocaleString()}`}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>FInly - ניהול פיננסי חכם</p>
                </div>
            </body>
            </html>
        `;

        // Generate PDF
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });

        // Share the PDF
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'שתף דו"ח הוצאות',
                UTI: 'com.adobe.pdf',
            });
        }

        return true;
    } catch (error) {
        console.error('PDF Export error:', error);
        throw error;
    }
};
