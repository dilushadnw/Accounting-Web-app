/**
 * Firestore Service
 * Handles all Firestore database operations
 */

/**
 * Save invoice to Firestore
 * @param {string} userId - User ID
 * @param {object} invoiceData - Invoice data
 * @returns {Promise<string>} Document ID
 */
async function saveInvoice(userId, invoiceData) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const invoice = {
        ...invoiceData,
        userId: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('invoices').add(invoice);
    return docRef.id;
}

/**
 * Update invoice in Firestore
 * @param {string} invoiceId - Invoice ID
 * @param {object} updates - Data to update
 * @returns {Promise<void>}
 */
async function updateInvoice(invoiceId, updates) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    await db.collection('invoices').doc(invoiceId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Get invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<object>} Invoice data
 */
async function getInvoice(invoiceId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const doc = await db.collection('invoices').doc(invoiceId).get();
    
    if (!doc.exists) {
        throw new Error('Invoice not found');
    }
    
    return { id: doc.id, ...doc.data() };
}

/**
 * Get all invoices for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} Array of invoices
 */
async function getInvoices(userId, filters = {}) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    let query = db.collection('invoices').where('userId', '==', userId);
    
    // Apply filters
    if (filters.status) {
        query = query.where('status', '==', filters.status);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Apply limit
    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Delete invoice
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<void>}
 */
async function deleteInvoice(invoiceId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    await db.collection('invoices').doc(invoiceId).delete();
}

/**
 * Save customer to Firestore
 * @param {string} userId - User ID
 * @param {object} customerData - Customer data
 * @returns {Promise<string>} Document ID
 */
async function saveCustomer(userId, customerData) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const customer = {
        ...customerData,
        userId: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('customers').add(customer);
    return docRef.id;
}

/**
 * Get all customers for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of customers
 */
async function getCustomers(userId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const snapshot = await db.collection('customers')
        .where('userId', '==', userId)
        .orderBy('displayName')
        .get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Get customer by ID
 * @param {string} customerId - Customer ID
 * @returns {Promise<object>} Customer data
 */
async function getCustomer(customerId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const doc = await db.collection('customers').doc(customerId).get();
    
    if (!doc.exists) {
        throw new Error('Customer not found');
    }
    
    return { id: doc.id, ...doc.data() };
}

/**
 * Update customer
 * @param {string} customerId - Customer ID
 * @param {object} updates - Data to update
 * @returns {Promise<void>}
 */
async function updateCustomer(customerId, updates) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    await db.collection('customers').doc(customerId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Delete customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<void>}
 */
async function deleteCustomer(customerId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    await db.collection('customers').doc(customerId).delete();
}

/**
 * Save expense to Firestore
 * @param {string} userId - User ID
 * @param {object} expenseData - Expense data
 * @returns {Promise<string>} Document ID
 */
async function saveExpense(userId, expenseData) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    const expense = {
        ...expenseData,
        userId: userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('expenses').add(expense);
    return docRef.id;
}

/**
 * Get all expenses for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional filters
 * @returns {Promise<Array>} Array of expenses
 */
async function getExpenses(userId, filters = {}) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    let query = db.collection('expenses').where('userId', '==', userId);
    
    // Apply filters
    if (filters.category) {
        query = query.where('category', '==', filters.category);
    }
    
    // Order by date
    query = query.orderBy('date', 'desc');
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Delete expense
 * @param {string} expenseId - Expense ID
 * @returns {Promise<void>}
 */
async function deleteExpense(expenseId) {
    if (!db) {
        throw new Error('Firestore is not initialized');
    }
    
    await db.collection('expenses').doc(expenseId).delete();
}
