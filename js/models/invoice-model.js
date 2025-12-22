/**
 * Invoice Model
 * Data structure and validation for invoices
 */

/**
 * Create a new invoice object
 * @param {object} data - Invoice data
 * @returns {object} Invoice object
 */
function createInvoice(data = {}) {
    return {
        invoiceNumber: data.invoiceNumber || generateInvoiceNumber(),
        customerName: data.customerName || '',
        customerId: data.customerId || null,
        issueDate: data.issueDate || getTodayISO(),
        dueDate: data.dueDate || '',
        paymentTerms: data.paymentTerms || 'Net 30',
        lineItems: data.lineItems || [createLineItem()],
        subtotal: data.subtotal || 0,
        taxRate: data.taxRate || 0,
        taxAmount: data.taxAmount || 0,
        discount: data.discount || 0,
        discountType: data.discountType || 'percentage', // 'percentage' or 'fixed'
        total: data.total || 0,
        notes: data.notes || '',
        status: data.status || 'draft' // draft, sent, paid, overdue
    };
}

/**
 * Create a new line item
 * @param {object} data - Line item data
 * @returns {object} Line item object
 */
function createLineItem(data = {}) {
    return {
        id: data.id || generateLineItemId(),
        description: data.description || '',
        quantity: data.quantity || 1,
        rate: data.rate || 0,
        amount: data.amount || 0
    };
}

/**
 * Calculate line item amount
 * @param {object} lineItem - Line item
 * @returns {number} Calculated amount
 */
function calculateLineItemAmount(lineItem) {
    const quantity = parseFloat(lineItem.quantity) || 0;
    const rate = parseFloat(lineItem.rate) || 0;
    return roundTo2Decimals(quantity * rate);
}

/**
 * Calculate invoice totals
 * @param {object} invoice - Invoice object
 * @returns {object} Updated invoice with calculated totals
 */
function calculateInvoiceTotals(invoice) {
    // Calculate subtotal from line items
    const subtotal = invoice.lineItems.reduce((sum, item) => {
        return sum + calculateLineItemAmount(item);
    }, 0);
    
    // Calculate tax
    const taxRate = parseFloat(invoice.taxRate) || 0;
    const taxAmount = roundTo2Decimals(percentageOf(subtotal, taxRate));
    
    // Calculate discount
    let discountAmount = 0;
    if (invoice.discountType === 'percentage') {
        const discountPercent = parseFloat(invoice.discount) || 0;
        discountAmount = roundTo2Decimals(percentageOf(subtotal, discountPercent));
    } else {
        discountAmount = parseFloat(invoice.discount) || 0;
    }
    
    // Calculate total
    const total = roundTo2Decimals(subtotal + taxAmount - discountAmount);
    
    return {
        ...invoice,
        subtotal: roundTo2Decimals(subtotal),
        taxAmount: taxAmount,
        total: Math.max(0, total) // Ensure total is never negative
    };
}

/**
 * Validate invoice
 * @param {object} invoice - Invoice to validate
 * @returns {object} Validation result { valid: boolean, errors: array }
 */
function validateInvoice(invoice) {
    const errors = [];
    
    if (!invoice.customerName || invoice.customerName.trim() === '') {
        errors.push('Customer name is required');
    }
    
    if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === '') {
        errors.push('Invoice number is required');
    }
    
    if (!invoice.issueDate) {
        errors.push('Issue date is required');
    }
    
    if (!invoice.dueDate) {
        errors.push('Due date is required');
    }
    
    if (!invoice.lineItems || invoice.lineItems.length === 0) {
        errors.push('At least one line item is required');
    } else {
        // Validate line items
        invoice.lineItems.forEach((item, index) => {
            if (!item.description || item.description.trim() === '') {
                errors.push(`Line item ${index + 1}: Description is required`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
            }
            if (item.rate === undefined || item.rate < 0) {
                errors.push(`Line item ${index + 1}: Rate must be 0 or greater`);
            }
        });
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Generate invoice number
 * @returns {string} Invoice number
 */
function generateInvoiceNumber() {
    const prefix = 'INV';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate line item ID
 * @returns {string} Line item ID
 */
function generateLineItemId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2, 11);
}

/**
 * Update invoice status based on dates and payment
 * @param {object} invoice - Invoice object
 * @returns {string} Updated status
 */
function updateInvoiceStatus(invoice) {
    // If already paid, keep paid status
    if (invoice.status === 'paid') {
        return 'paid';
    }
    
    // Check if overdue
    if (invoice.dueDate && isOverdue(invoice.dueDate)) {
        return 'overdue';
    }
    
    // If sent and not overdue, keep sent status
    if (invoice.status === 'sent') {
        return 'sent';
    }
    
    // Otherwise, it's draft
    return invoice.status || 'draft';
}
