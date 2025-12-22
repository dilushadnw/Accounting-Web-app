/**
 * Invoice Creation Logic
 * Handles invoice form, line items, calculations, and saving
 */

let currentUser = null;
let invoice = null;
let customers = [];

// Initialize invoice form
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initInvoiceForm();
});

/**
 * Initialize authentication
 */
function initAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initDashboardUI();
            loadCustomers();
            setupForm();
        } else {
            window.location.href = 'login.html';
        }
    });
}

/**
 * Initialize dashboard UI (sidebar, menu, etc.)
 */
function initDashboardUI() {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', () => {
            userDropdown.classList.remove('active');
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await auth.signOut();
            window.location.href = 'login.html';
        });
    }
    
    // Update user info
    const userName = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    if (userName && currentUser.displayName) {
        userName.textContent = currentUser.displayName;
    }
    if (userInitials) {
        const initials = (currentUser.displayName || currentUser.email)
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        userInitials.textContent = initials;
    }
}

/**
 * Initialize invoice form
 */
function initInvoiceForm() {
    // Create new invoice
    invoice = createInvoice();
    
    // Set today's date
    document.getElementById('issueDate').value = getTodayISO();
    
    // Set due date based on payment terms
    updateDueDate();
    
    // Add first line item
    addLineItem();
}

/**
 * Setup form
 */
function setupForm() {
    const form = document.getElementById('invoiceForm');
    const addLineItemBtn = document.getElementById('addLineItemBtn');
    const paymentTermsSelect = document.getElementById('paymentTerms');
    const issueDateInput = document.getElementById('issueDate');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const saveSendBtn = document.getElementById('saveSendBtn');
    
    // Generate invoice number
    document.getElementById('invoiceNumber').value = invoice.invoiceNumber;
    
    // Add line item
    addLineItemBtn.addEventListener('click', () => {
        addLineItem();
    });
    
    // Update due date when payment terms or issue date changes
    paymentTermsSelect.addEventListener('change', updateDueDate);
    issueDateInput.addEventListener('change', updateDueDate);
    
    // Cancel button
    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = 'invoices.html';
        }
    });
    
    // Save as draft
    saveDraftBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await saveInvoiceData('draft');
    });
    
    // Save and send
    saveSendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await saveInvoiceData('sent');
    });
    
    // Tax rate and discount changes
    document.getElementById('taxRate').addEventListener('input', calculateTotals);
    document.getElementById('discount').addEventListener('input', calculateTotals);
    document.getElementById('discountType').addEventListener('change', calculateTotals);
}

/**
 * Load customers from Firestore
 */
async function loadCustomers() {
    const customerSelect = document.getElementById('customerName');
    
    if (!db) {
        // Add sample customers if Firestore is not configured
        customerSelect.innerHTML = `
            <option value="">Select customer...</option>
            <option value="Acme Corporation">Acme Corporation</option>
            <option value="Tech Solutions Inc.">Tech Solutions Inc.</option>
            <option value="Global Services Ltd.">Global Services Ltd.</option>
        `;
        return;
    }
    
    try {
        customers = await getCustomers(currentUser.uid);
        
        customerSelect.innerHTML = '<option value="">Select customer...</option>';
        
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.displayName;
            option.setAttribute('data-id', customer.id);
            option.textContent = customer.displayName;
            customerSelect.appendChild(option);
        });
        
        if (customers.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No customers found. Create a customer first.';
            option.disabled = true;
            customerSelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

/**
 * Add line item to the table
 */
function addLineItem(data = {}) {
    const lineItem = createLineItem(data);
    invoice.lineItems.push(lineItem);
    
    const tbody = document.getElementById('lineItemsBody');
    const row = createLineItemRow(lineItem);
    tbody.appendChild(row);
    
    // Focus on description field of new row
    const descInput = row.querySelector('input[data-field="description"]');
    if (descInput) descInput.focus();
}

/**
 * Create line item row
 */
function createLineItemRow(lineItem) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', lineItem.id);
    
    row.innerHTML = `
        <td>
            <input type="text" data-field="description" value="${lineItem.description}" placeholder="Description" required>
        </td>
        <td>
            <input type="number" data-field="quantity" value="${lineItem.quantity}" min="0" step="1" required>
        </td>
        <td>
            <input type="number" data-field="rate" value="${lineItem.rate}" min="0" step="0.01" required>
        </td>
        <td>
            <input type="text" data-field="amount" value="${formatCurrency(lineItem.amount)}" readonly>
        </td>
        <td>
            <button type="button" class="btn-remove-item" data-id="${lineItem.id}">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
        </td>
    `;
    
    // Add event listeners for inputs
    const inputs = row.querySelectorAll('input[data-field]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            updateLineItem(lineItem.id, e.target.dataset.field, e.target.value);
        });
    });
    
    // Add event listener for remove button
    const removeBtn = row.querySelector('.btn-remove-item');
    removeBtn.addEventListener('click', () => {
        removeLineItem(lineItem.id);
    });
    
    return row;
}

/**
 * Update line item
 */
function updateLineItem(id, field, value) {
    const lineItem = invoice.lineItems.find(item => item.id === id);
    if (!lineItem) return;
    
    if (field === 'description') {
        lineItem.description = value;
    } else if (field === 'quantity' || field === 'rate') {
        lineItem[field] = parseFloat(value) || 0;
        lineItem.amount = calculateLineItemAmount(lineItem);
        
        // Update amount display
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            const amountInput = row.querySelector('input[data-field="amount"]');
            if (amountInput) {
                amountInput.value = formatCurrency(lineItem.amount);
            }
        }
    }
    
    calculateTotals();
}

/**
 * Remove line item
 */
function removeLineItem(id) {
    // Don't allow removing the last line item
    if (invoice.lineItems.length <= 1) {
        alert('At least one line item is required');
        return;
    }
    
    // Remove from invoice
    invoice.lineItems = invoice.lineItems.filter(item => item.id !== id);
    
    // Remove from DOM
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.remove();
    }
    
    calculateTotals();
}

/**
 * Calculate totals
 */
function calculateTotals() {
    // Get tax and discount values
    invoice.taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    invoice.discount = parseFloat(document.getElementById('discount').value) || 0;
    invoice.discountType = document.getElementById('discountType').value;
    
    // Calculate totals
    invoice = calculateInvoiceTotals(invoice);
    
    // Update display
    document.getElementById('subtotal').textContent = formatCurrency(invoice.subtotal);
    document.getElementById('taxAmount').textContent = formatCurrency(invoice.taxAmount);
    
    // Calculate discount amount for display
    let discountAmount = 0;
    if (invoice.discountType === 'percentage') {
        discountAmount = percentageOf(invoice.subtotal, invoice.discount);
    } else {
        discountAmount = invoice.discount;
    }
    document.getElementById('discountAmount').textContent = formatCurrency(discountAmount);
    
    document.getElementById('total').textContent = formatCurrency(invoice.total);
}

/**
 * Update due date based on payment terms and issue date
 */
function updateDueDate() {
    const issueDate = document.getElementById('issueDate').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    
    if (issueDate && paymentTerms) {
        const dueDate = calculateDueDate(issueDate, paymentTerms);
        document.getElementById('dueDate').value = dueDate;
    }
}

/**
 * Save invoice data
 */
async function saveInvoiceData(status) {
    // Get form data
    invoice.invoiceNumber = document.getElementById('invoiceNumber').value;
    invoice.customerName = document.getElementById('customerName').value;
    invoice.issueDate = document.getElementById('issueDate').value;
    invoice.dueDate = document.getElementById('dueDate').value;
    invoice.paymentTerms = document.getElementById('paymentTerms').value;
    invoice.notes = document.getElementById('notes').value;
    invoice.status = status;
    
    // Validate
    const validation = validateInvoice(invoice);
    if (!validation.valid) {
        alert('Please fix the following errors:\n\n' + validation.errors.join('\n'));
        return;
    }
    
    try {
        if (!db) {
            alert('Invoice created successfully!\n\n(Firestore not configured - data not saved)');
            window.location.href = 'invoices.html';
            return;
        }
        
        // Save to Firestore
        const docId = await saveInvoice(currentUser.uid, invoice);
        
        alert(`Invoice ${status === 'draft' ? 'saved as draft' : 'saved and sent'} successfully!`);
        window.location.href = 'view-invoice.html?id=' + docId;
        
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please try again.');
    }
}
