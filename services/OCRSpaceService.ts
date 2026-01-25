import * as FileSystem from 'expo-file-system/legacy';
import { CONFIG } from '../constants/config';

export interface ScannedReceipt {
    amount?: number;
    date?: string; // YYYY-MM-DD
    merchant?: string;
    category?: string;
}

export const scanReceipt = async (imageUri: string): Promise<ScannedReceipt> => {
    try {
        // 1. Read image as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // 2. Call OCR.space API
        const formData = new FormData();
        formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
        formData.append('apikey', CONFIG.OCR_SPACE_API_KEY);
        formData.append('language', 'eng'); // English - extracts numbers from Hebrew receipts
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2'); // Engine 2 is better for receipts

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.IsErroredOnProcessing || !data.ParsedResults || data.ParsedResults.length === 0) {
            throw new Error(data.ErrorMessage || 'OCR processing failed');
        }

        const rawText = data.ParsedResults[0].ParsedText;
        console.log('OCR Detected Text:', rawText);

        return parseReceiptText(rawText);

    } catch (error: any) {
        console.error('OCR.space Error Details:', {
            error,
            message: error?.message,
            stack: error?.stack
        });
        throw new Error(`OCR failed: ${error?.message || 'Unknown error'}`);
    }
};

const parseReceiptText = (text: string): ScannedReceipt => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const result: ScannedReceipt = {};

    // 1. Merchant - Usually the first non-empty line
    if (lines.length > 0) {
        result.merchant = lines[0];
    }

    // 2. Amount Detection - Search for keywords FIRST
    console.log('=== OCR AMOUNT DETECTION ===');
    console.log('Full text:', text);

    // Hebrew and English keywords for "total"
    const totalKeywords = [
        'סה"כ', 'סה״כ', 'סהכ',           // Total variations
        'לתשלום', 'לשלם',                 // To pay
        'סכום', 'סך הכל',                // Sum, total
        'total', 'sum', 'amount'          // English
    ];

    let foundAmount = false;

    // Search for each keyword
    for (const keyword of totalKeywords) {
        // Find all occurrences of this keyword
        let searchIndex = 0;
        while (true) {
            const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase(), searchIndex);
            if (keywordIndex === -1) break;

            // Look for a number within 100 characters after the keyword
            const searchText = text.substring(keywordIndex, keywordIndex + 100);
            console.log(`Searching near keyword "${keyword}":`, searchText);

            // Match numbers with optional decimal
            const amountMatch = searchText.match(/(\d{1,6}(?:[.,]\d{1,2})?)/);
            if (amountMatch) {
                const amount = parseFloat(amountMatch[0].replace(',', '.'));
                // Basic sanity check: amount should be > 1 and < 1,000,000
                if (amount > 1 && amount < 1000000) {
                    result.amount = amount;
                    console.log(`✓ Found amount near "${keyword}":`, result.amount);
                    foundAmount = true;
                    break;
                }
            }

            searchIndex = keywordIndex + keyword.length;
        }

        if (foundAmount) break;
    }

    // If no keyword found, use fallback: last significant amount
    if (!foundAmount) {
        const amountRegex = /(\d{1,6}(?:[.,]\d{1,2})?)/g;
        const matches = text.match(amountRegex);
        console.log('No keyword found. All number matches:', matches);

        if (matches) {
            const amounts = matches
                .map(m => parseFloat(m.replace(',', '.')))
                .filter(n => n > 10 && n < 1000000); // Basic filter

            console.log('Filtered amounts (>10, <1M):', amounts);

            if (amounts.length > 0) {
                // Use the last amount as a guess
                result.amount = amounts[amounts.length - 1];
                console.log('✓ Using LAST amount as fallback:', result.amount);
            }
        }
    }

    console.log('=== FINAL AMOUNT ===', result.amount);

    // 3. Date Heuristic - Look for date patterns
    const dateRegex = /(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        const dateStr = dateMatch[0];
        const parts = dateStr.split(/[\/.]/);
        if (parts.length === 3) {
            let year = parseInt(parts[2]);
            if (year < 100) year += 2000;
            const month = parseInt(parts[1]);
            const day = parseInt(parts[0]);
            result.date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }

    // 4. Category - Simple keyword matching
    const textLower = text.toLowerCase();
    if (textLower.includes('restaurant') || textLower.includes('cafe') || textLower.includes('food') || textLower.includes('מסעדה')) {
        result.category = 'Food';
    } else if (textLower.includes('taxi') || textLower.includes('uber') || textLower.includes('transport') || textLower.includes('תחבורה')) {
        result.category = 'Transport';
    } else if (textLower.includes('shop') || textLower.includes('store') || textLower.includes('market') || textLower.includes('חנות')) {
        result.category = 'Shopping';
    } else if (textLower.includes('electric') || textLower.includes('water') || textLower.includes('gas') || textLower.includes('חשמל')) {
        result.category = 'Bills';
    } else {
        result.category = 'Other';
    }

    return result;
};
