/**
 * Utility functions for formatting numbers and currencies
 */

/**
 * Formats a number as Hebrew currency (NIS)
 * Example: 5000 -> ₪5,000
 */
export const formatCurrency = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string'
        ? parseFloat(amount.replace(/[^\d.-]/g, '')) || 0
        : amount;

    return `₪${numericAmount.toLocaleString('he-IL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

/**
 * Formats a number with thousands separators
 * Example: 12450 -> 12,450
 */
export const formatNumber = (num: number | string): string => {
    const numericValue = typeof num === 'string'
        ? parseFloat(num.replace(/[^\d.-]/g, '')) || 0
        : num;

    return numericValue.toLocaleString('he-IL');
};

/**
 * Formats a percentage
 * Example: 74 -> 74%
 */
export const formatPercent = (percent: number | string): string => {
    const numericValue = typeof percent === 'string'
        ? parseFloat(percent) || 0
        : percent;

    return `${numericValue}%`;
};
