import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    vat?: number;
    vatAmount?: number;
    total: number;
    notes?: string;
    businessName: string;
    businessId?: string;
    businessEmail?: string;
    businessPhone?: string;
    businessAddress?: string;
    status: 'pending' | 'paid' | 'overdue';
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'paid': return '#10B981';
        case 'overdue': return '#EF4444';
        default: return '#F59E0B';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'paid': return 'שולם';
        case 'overdue': return 'בפיגור';
        default: return 'ממתין לתשלום';
    }
};

export const generateInvoiceHTML = (data: InvoiceData): string => {
    const statusColor = getStatusColor(data.status);
    const statusText = getStatusText(data.status);

    const itemsHTML = data.items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: right;">${item.description}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: center;">₪${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: left; font-weight: 600;">₪${item.total.toLocaleString()}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #FFFFFF;
                color: #1F2937;
                padding: 40px;
                direction: rtl;
            }
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #6366F1;
            }
            .brand {
                text-align: right;
            }
            .brand h1 {
                font-size: 28px;
                color: #6366F1;
                margin-bottom: 8px;
            }
            .brand p {
                color: #6B7280;
                font-size: 14px;
            }
            .invoice-info {
                text-align: left;
            }
            .invoice-number {
                font-size: 24px;
                font-weight: 700;
                color: #1F2937;
                margin-bottom: 8px;
            }
            .invoice-date {
                color: #6B7280;
                font-size: 14px;
            }
            .status-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                color: white;
                background: ${statusColor};
                margin-top: 12px;
            }
            .parties {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            .party {
                flex: 1;
            }
            .party-title {
                font-size: 12px;
                color: #6B7280;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 12px;
            }
            .party-name {
                font-size: 18px;
                font-weight: 600;
                color: #1F2937;
                margin-bottom: 4px;
            }
            .party-details {
                font-size: 14px;
                color: #6B7280;
                line-height: 1.6;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th {
                background: #F3F4F6;
                padding: 14px 12px;
                text-align: right;
                font-size: 12px;
                font-weight: 600;
                color: #6B7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .items-table th:nth-child(2),
            .items-table th:nth-child(3) {
                text-align: center;
            }
            .items-table th:last-child {
                text-align: left;
            }
            .totals {
                display: flex;
                justify-content: flex-start;
                margin-bottom: 40px;
            }
            .totals-box {
                background: #F9FAFB;
                border-radius: 12px;
                padding: 24px;
                min-width: 280px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
            }
            .total-row.subtotal {
                color: #6B7280;
            }
            .total-row.vat {
                color: #6B7280;
                border-bottom: 1px solid #E5E7EB;
                padding-bottom: 12px;
                margin-bottom: 12px;
            }
            .total-row.grand-total {
                font-size: 20px;
                font-weight: 700;
                color: #6366F1;
            }
            .notes {
                background: #FEF3C7;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 40px;
            }
            .notes-title {
                font-size: 12px;
                font-weight: 600;
                color: #92400E;
                margin-bottom: 8px;
            }
            .notes-text {
                font-size: 14px;
                color: #78350F;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #9CA3AF;
                font-size: 12px;
            }
            .footer p {
                margin-bottom: 4px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div class="brand">
                    <h1>${data.businessName}</h1>
                    ${data.businessId ? `<p>ח.פ./ע.מ.: ${data.businessId}</p>` : ''}
                    ${data.businessPhone ? `<p>טלפון: ${data.businessPhone}</p>` : ''}
                    ${data.businessEmail ? `<p>${data.businessEmail}</p>` : ''}
                </div>
                <div class="invoice-info">
                    <div class="invoice-number">חשבונית #${data.invoiceNumber}</div>
                    <div class="invoice-date">תאריך: ${data.date}</div>
                    ${data.dueDate ? `<div class="invoice-date">תאריך תשלום: ${data.dueDate}</div>` : ''}
                    <div class="status-badge">${statusText}</div>
                </div>
            </div>

            <div class="parties">
                <div class="party">
                    <div class="party-title">פרטי לקוח</div>
                    <div class="party-name">${data.clientName}</div>
                    <div class="party-details">
                        ${data.clientEmail ? `${data.clientEmail}<br>` : ''}
                        ${data.clientPhone ? `${data.clientPhone}<br>` : ''}
                        ${data.clientAddress ? data.clientAddress : ''}
                    </div>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>תיאור</th>
                        <th>כמות</th>
                        <th>מחיר יחידה</th>
                        <th>סה"כ</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-box">
                    <div class="total-row subtotal">
                        <span>סיכום ביניים</span>
                        <span>₪${data.subtotal.toLocaleString()}</span>
                    </div>
                    ${data.vat && data.vatAmount ? `
                    <div class="total-row vat">
                        <span>מע"מ (${data.vat}%)</span>
                        <span>₪${data.vatAmount.toLocaleString()}</span>
                    </div>
                    ` : ''}
                    <div class="total-row grand-total">
                        <span>סה"כ לתשלום</span>
                        <span>₪${data.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            ${data.notes ? `
            <div class="notes">
                <div class="notes-title">הערות</div>
                <div class="notes-text">${data.notes}</div>
            </div>
            ` : ''}

            <div class="footer">
                <p>תודה על העסקה!</p>
                <p>חשבונית זו הופקה על ידי FInly</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const generateInvoicePDF = async (data: InvoiceData): Promise<string> => {
    try {
        const html = generateInvoiceHTML(data);
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });
        return uri;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate invoice PDF');
    }
};

export const shareInvoicePDF = async (data: InvoiceData): Promise<void> => {
    try {
        const pdfUri = await generateInvoicePDF(data);

        // Rename file to have a better name
        const newPath = FileSystem.documentDirectory + `invoice_${data.invoiceNumber}.pdf`;
        await FileSystem.moveAsync({
            from: pdfUri,
            to: newPath,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newPath, {
                mimeType: 'application/pdf',
                dialogTitle: `חשבונית #${data.invoiceNumber}`,
                UTI: 'com.adobe.pdf',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Error sharing PDF:', error);
        throw error;
    }
};

export const printInvoice = async (data: InvoiceData): Promise<void> => {
    try {
        const html = generateInvoiceHTML(data);
        await Print.printAsync({ html });
    } catch (error) {
        console.error('Error printing invoice:', error);
        throw error;
    }
};

// Helper to create invoice data from transaction
export const createInvoiceDataFromTransaction = (
    transaction: any,
    businessInfo: {
        name: string;
        id?: string;
        email?: string;
        phone?: string;
        address?: string;
    }
): InvoiceData => {
    const amount = parseFloat(transaction.amount.replace(/[^0-9.-]+/g, '')) || 0;

    return {
        invoiceNumber: transaction.id.slice(-6).toUpperCase(),
        date: new Date(transaction.date).toLocaleDateString('he-IL'),
        clientName: transaction.clientName || 'לקוח',
        items: [{
            description: transaction.title || 'שירות',
            quantity: 1,
            unitPrice: amount,
            total: amount,
        }],
        subtotal: amount,
        total: amount,
        notes: transaction.notes,
        businessName: businessInfo.name,
        businessId: businessInfo.id,
        businessEmail: businessInfo.email,
        businessPhone: businessInfo.phone,
        businessAddress: businessInfo.address,
        status: transaction.status || 'pending',
    };
};
