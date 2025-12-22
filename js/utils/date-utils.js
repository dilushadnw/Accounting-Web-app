/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
function formatDate(date, locale = 'en-US') {
    if (!date) return '';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateISO(date) {
    if (!date) return '';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date to ISO:', error);
        return '';
    }
}

/**
 * Get today's date as YYYY-MM-DD
 * @returns {string} Today's date
 */
function getTodayISO() {
    return formatDateISO(new Date());
}

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
    const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
}

/**
 * Calculate due date based on payment terms
 * @param {Date|string} issueDate - Invoice issue date
 * @param {string} paymentTerms - Payment terms (e.g., "Net 30", "Net 15")
 * @returns {string} Due date in YYYY-MM-DD format
 */
function calculateDueDate(issueDate, paymentTerms) {
    if (!issueDate) return getTodayISO();
    
    // Extract number of days from payment terms
    const match = paymentTerms.match(/\d+/);
    const days = match ? parseInt(match[0]) : 30;
    
    const dueDate = addDays(issueDate, days);
    return formatDateISO(dueDate);
}

/**
 * Check if a date is overdue
 * @param {Date|string} dueDate - Due date to check
 * @returns {boolean} True if overdue
 */
function isOverdue(dueDate) {
    if (!dueDate) return false;
    
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return due < today;
}

/**
 * Get month name from date
 * @param {Date|string} date - Date to get month from
 * @returns {string} Month name
 */
function getMonthName(date) {
    if (!date) return '';
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(dateObj);
    } catch (error) {
        console.error('Error getting month name:', error);
        return '';
    }
}

/**
 * Get year from date
 * @param {Date|string} date - Date to get year from
 * @returns {number} Year
 */
function getYear(date) {
    if (!date) return new Date().getFullYear();
    
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.getFullYear();
    } catch (error) {
        console.error('Error getting year:', error);
        return new Date().getFullYear();
    }
}

/**
 * Format date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range
 */
function formatDateRange(startDate, endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Get first day of current month
 * @returns {string} First day in YYYY-MM-DD format
 */
function getFirstDayOfMonth() {
    const date = new Date();
    date.setDate(1);
    return formatDateISO(date);
}

/**
 * Get last day of current month
 * @returns {string} Last day in YYYY-MM-DD format
 */
function getLastDayOfMonth() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return formatDateISO(date);
}
