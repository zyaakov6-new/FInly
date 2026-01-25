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

        // 2. Call Google Cloud Vision API directly (temporary - backend has issues)
        // TODO: Fix Vercel backend and switch back to: https://finly-1g1n42orr-zivs-projects-349ac7ab.vercel.app/api/ocr
        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${CONFIG.GOOGLE_CLOUD_VISION_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requests: [
                        {
                            image: {
                                content: base64,
                            },
                            features: [
                                {
                                    type: 'TEXT_DETECTION',
                                    maxResults: 1,
                                },
                            ],
                            imageContext: {
                                languageHints: ['he', 'en'],
                            },
                        },
                    ],
                }),
            }
        );

        const data = await response.json();

        if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
            const rawText = data.responses[0].textAnnotations[0].description;
            console.log('Google Vision OCR Text:', rawText);
            return parseReceiptText(rawText);
        } else {
            throw new Error('No text detected in image');
        }

    } catch (error: any) {
        console.error('Google Vision Error:', error);

        // Check for specific error types
        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            throw new Error('OCR quota exceeded');
        } else if (error.message?.includes('API key')) {
            throw new Error('OCR API key invalid');
        } else if (error.message?.includes('No text')) {
            throw new Error('OCR no text detected');
        } else if (!error.message || error.message.includes('fetch') || error.message.includes('Network')) {
            throw new Error('Network request failed');
        }

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

    // 2. Amount Detection - Search for Hebrew keywords
    console.log('=== AMOUNT DETECTION ===');
    console.log('Full text:', text);

    const totalKeywords = [
        // Most specific first (transaction amount)
        'סכום עיסקה', 'סכום עסקה',
        // סה"כ combinations (highest priority)
        'סה"כ לתשלום:', 'סה״כ לתשלום:', 'סהכ לתשלום:',
        'סה"כ לתשלום', 'סה״כ לתשלום', 'סהכ לתשלום',
        'סה"כ לשלם:', 'סה״כ לשלם:', 'סהכ לשלם:',
        'סה"כ לשלם', 'סה״כ לשלם', 'סהכ לשלם',
        // Total with colon (common format: "סה"כ: 123.45")
        'סה"כ:', 'סה״כ:', 'סהכ:',
        // Total without colon
        'סה"כ', 'סה״כ', 'סהכ', 'סה\'\'כ',
        // Payment amount
        'לתשלום:', 'לשלם:', 'תשלום:',
        'לתשלום', 'לשלם', 'תשלום',
        // Amount with colon
        'סכום:', 'ע"ס:', 'ע״ס:',
        'סכום', 'ע"ס', 'ע״ס',
        // Transaction
        'עסקה:',
        'עסקה',
        // Sum/total
        'סך הכל:', 'סך-הכל:',
        'סך הכל', 'סך-הכל',
        // English
        'total:', 'sum:', 'amount:',
        'total', 'sum', 'amount'
    ];

    let foundAmount = false;
    let bestMatch: { amount: number; priority: number } | null = null;

    // Search for each keyword with priority
    for (let i = 0; i < totalKeywords.length; i++) {
        const keyword = totalKeywords[i];
        const priority = totalKeywords.length - i; // Earlier keywords have higher priority

        let searchIndex = 0;
        while (true) {
            const keywordIndex = text.toLowerCase().indexOf(keyword.toLowerCase(), searchIndex);
            if (keywordIndex === -1) break;

            // Look for a number within 50 characters after the keyword
            const searchText = text.substring(keywordIndex, keywordIndex + 50);
            console.log(`Searching near "${keyword}":`, searchText);

            // Match numbers with optional decimals: 123.45 or 123,45 or 1234
            const amountMatch = searchText.match(/(\d{1,6}(?:[.,]\d{1,3})?)/);
            if (amountMatch) {
                const originalMatch = amountMatch[0];

                // Smart comma handling: distinguish thousands separator from decimal
                let amountStr = originalMatch;
                if (originalMatch.includes(',')) {
                    const parts = originalMatch.split(',');
                    // If 3 digits after comma, it's thousands separator (17,100)
                    // If 1-2 digits after comma, it's decimal separator (17,10)
                    if (parts[1] && parts[1].length === 3) {
                        amountStr = originalMatch.replace(/,/g, ''); // Remove thousands separator
                    } else {
                        amountStr = originalMatch.replace(',', '.'); // Convert decimal separator
                    }
                }

                const amount = parseFloat(amountStr);

                console.log(`  📊 Matched: "${originalMatch}" → Cleaned: "${amountStr}" → Parsed: ${amount}`);
                // Valid amount range
                if (amount > 0.5 && amount < 1000000) {
                    // Filter out IDs: reject 6+ digit numbers without decimals
                    const originalNum = amountMatch[0];
                    const hasDecimal = originalNum.includes('.') || originalNum.includes(',');
                    const digitCount = originalNum.replace(/[.,]/g, '').length;

                    if (digitCount >= 6 && !hasDecimal) {
                        console.log(`  ✗ Rejected ${amount} - looks like ID (${digitCount} digits)`);
                        searchIndex = keywordIndex + keyword.length;
                        continue;
                    }

                    console.log(`✓ Found amount near "${keyword}":`, amount, `(priority: ${priority})`);

                    // Keep the highest priority match
                    if (!bestMatch || priority > bestMatch.priority) {
                        bestMatch = { amount, priority };
                    }
                    foundAmount = true;
                    break;
                }
            }

            searchIndex = keywordIndex + keyword.length;
        }
    }

    // Use the best match found
    if (bestMatch) {
        result.amount = bestMatch.amount;
        console.log('✓ Using best match:', result.amount);
    }

    // Fallback: Smart last-amount detection (totals are usually at the bottom)
    if (!foundAmount) {
        console.log('⚠ No keywords found, using smart fallback...');

        // Split text into lines to find amounts near the end
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const lastQuarter = lines.slice(-Math.ceil(lines.length / 4)); // Last 25% of receipt
        const lastQuarterText = lastQuarter.join('\n');

        console.log('Searching in last quarter of receipt...');

        // Find all amounts in the last quarter
        const amountRegex = /(\d{1,6}(?:[.,]\d{2,3})?)/g;
        const matches = lastQuarterText.match(amountRegex);

        if (matches) {
            const amounts = matches
                .map((m, index) => ({
                    value: parseFloat(m.replace(',', '.')),
                    original: m,
                    index
                }))
                .filter(a => {
                    // Filter out IDs (6+ digits, no decimal)
                    const hasDecimal = a.original.includes('.') || a.original.includes(',');
                    const digitCount = a.original.replace(/[.,]/g, '').length;

                    if (digitCount >= 6 && !hasDecimal) {
                        console.log(`  ✗ Rejected ${a.value} - looks like ID`);
                        return false;
                    }

                    // Valid price range
                    if (a.value < 1 || a.value > 100000) {
                        console.log(`  ✗ Rejected ${a.value} - out of range`);
                        return false;
                    }

                    return true;
                });

            if (amounts.length > 0) {
                // Use the LAST valid amount (most likely the total)
                result.amount = amounts[amounts.length - 1].value;
                console.log('✓ Fallback - using last amount in receipt:', result.amount);
            } else {
                console.log('✗ No valid amounts found in fallback');
            }
        }
    }

    console.log('=== FINAL AMOUNT ===', result.amount);

    // 3. Date Detection
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

    // 4. Category Detection
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
