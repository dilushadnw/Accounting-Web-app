/**
 * Currency Utilities
 * Helper functions for currency formatting and parsing
 */

/**
 * Format number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    
    // Remove currency symbols, spaces, and commas
    const cleaned = currencyString.replace(/[$,\s]/g, '');
    const number = parseFloat(cleaned);
    
    return isNaN(number) ? 0 : number;
}

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    
    return new Intl.NumberFormat('en-US').format(number);
}

/**
 * Calculate percentage
 * @param {number} value - Value to calculate percentage for
 * @param {number} total - Total amount
 * @returns {number} Percentage
 */
function calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return (value / total) * 100;
}

/**
 * Calculate percentage of an amount
 * @param {number} amount - Base amount
 * @param {number} percentage - Percentage to calculate
 * @returns {number} Calculated amount
 */
function percentageOf(amount, percentage) {
    if (!amount || !percentage) return 0;
    return (amount * percentage) / 100;
}

/**
 * Round to 2 decimal places
 * @param {number} number - Number to round
 * @returns {number} Rounded number
 */
function roundTo2Decimals(number) {
    return Math.round((number + Number.EPSILON) * 100) / 100;
}
