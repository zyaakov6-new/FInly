import TextRecognition from '@react-native-ml-kit/text-recognition';

export interface ScannedReceipt {
    amount?: number;
    date?: string; // YYYY-MM-DD
    merchant?: string;
    category?: string;
}

export const scanReceipt = async (imageUri: string): Promise<ScannedReceipt> => {
    try {
        // 1. Run ML Kit Text Recognition
        const result = await TextRecognition.recognize(imageUri);

        if (!result || !result.text) {
            throw new Error('No text detected in the image');
        }

        const rawText = result.text;
        console.log('Detected Text:', rawText);

        return parseReceiptText(rawText);

    } catch (error) {
        console.error('ML Kit OCR Error:', error);
        throw error;
    }
};

const parseReceiptText = (text: string): ScannedReceipt => {
    const lines = text.split('\n');
    const result: ScannedReceipt = {};

    // 1. Merchant - Usually the first non-empty line
    const merchant = lines.find(line => line.trim().length > 2);
    if (merchant) {
        result.merchant = merchant.trim();
    }

    // 2. Amount Heuristic
    // Look for patterns like "Total", "Amount", "₪", "$", "Sum"
    // And pick the largest number found after these keywords or at the end of many lines
    const amountRegex = /(\d{1,5}(?:[.,]\d{2}))/g;
    const matches = text.match(amountRegex);
    if (matches) {
        // Often the last amount found on a receipt is the total
        const amounts = matches.map(m => parseFloat(m.replace(',', '.')));
        const maxAmount = Math.max(...amounts);
        result.amount = maxAmount;
    }

    // 3. Date Heuristic
    const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
        const dateStr = dateMatch[0];
        // Basic parsing - might need adjustment for local formats
        const parts = dateStr.split(/[\/-]/);
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
    if (textLower.includes('restaurant') || textLower.includes('cafe') || textLower.includes('food')) {
        result.category = 'Food';
    } else if (textLower.includes('taxi') || textLower.includes('uber') || textLower.includes('transport')) {
        result.category = 'Transport';
    } else if (textLower.includes('shop') || textLower.includes('store')) {
        result.category = 'Shopping';
    } else if (textLower.includes('electric') || textLower.includes('water') || textLower.includes('gas')) {
        result.category = 'Bills';
    } else {
        result.category = 'Other';
    }

    return result;
};
