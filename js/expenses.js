/**
 * Expenses Management Logic
 */

let currentUser = null;
let allExpenses = [];

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initUI();
            loadExpenses();
        } else {
            window.location.href = 'login.html';
        }
    });
}

function initUI() {
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    }
    
    // User menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        document.addEventListener('click', () => userDropdown.classList.remove('active'));
    }
    
    document.getElementById('logoutBtn').addEventListener('click', async (e) => {
        e.preventDefault();
        await auth.signOut();
        window.location.href = 'login.html';
    });
    
    // Update user info
    if (currentUser.displayName) {
        document.getElementById('userName').textContent = currentUser.displayName;
    }
    const initials = (currentUser.displayName || currentUser.email).substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    // Setup filters
    document.getElementById('searchFilter').addEventListener('input', filterExpenses);
    document.getElementById('categoryFilter').addEventListener('change', filterExpenses);
    document.getElementById('startDate').addEventListener('change', filterExpenses);
    document.getElementById('endDate').addEventListener('change', filterExpenses);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Receipt modal
    const modal = document.getElementById('receiptModal');
    document.getElementById('closeModal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

async function loadExpenses() {
    const tbody = document.getElementById('expensesTableBody');
    
    if (!db) {
        displaySampleExpenses(tbody);
        return;
    }
    
    try {
        allExpenses = await getExpenses(currentUser.uid);
        displayExpenses(allExpenses);
        updateSummary(allExpenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading expenses</td></tr>';
    }
}

function displaySampleExpenses(tbody) {
    allExpenses = [
        { id: '1', date: '2024-12-15', vendor: 'Office Depot', category: 'Office', amount: 150.50, receiptUrl: null, paymentMethod: 'Credit Card' },
        { id: '2', date: '2024-12-18', vendor: 'Gas Station', category: 'Travel', amount: 45.00, receiptUrl: null, paymentMethod: 'Cash' },
        { id: '3', date: '2024-12-20', vendor: 'Restaurant', category: 'Meals', amount: 75.25, receiptUrl: null, paymentMethod: 'Credit Card' },
        { id: '4', date: '2024-12-10', vendor: 'Electric Company', category: 'Utilities', amount: 120.00, receiptUrl: null, paymentMethod: 'Bank Transfer' }
    ];
    displayExpenses(allExpenses);
    updateSummary(allExpenses);
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    
    if (!expenses || expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 40px;">
                    <p>No expenses found.</p>
                    <a href="add-expense.html" class="btn-link">Add your first expense</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${escapeHtml(expense.vendor)}</td>
            <td><span class="category-badge category-${expense.category.toLowerCase()}">${escapeHtml(expense.category)}</span></td>
            <td><strong>${formatCurrency(expense.amount)}</strong></td>
            <td>
                ${expense.receiptUrl 
                    ? `<img src="${expense.receiptUrl}" class="receipt-thumbnail" onclick="showReceipt('${expense.receiptUrl}')" alt="Receipt">`
                    : '<span style="color: #94a3b8;">No receipt</span>'}
            </td>
            <td>
                <button class="btn-link" onclick="deleteExpenseConfirm('${expense.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterExpenses() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filtered = allExpenses;
    
    if (searchTerm) {
        filtered = filtered.filter(exp => 
            exp.vendor.toLowerCase().includes(searchTerm) ||
            (exp.description && exp.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (category) {
        filtered = filtered.filter(exp => exp.category === category);
    }
    
    if (startDate) {
        filtered = filtered.filter(exp => exp.date >= startDate);
    }
    
    if (endDate) {
        filtered = filtered.filter(exp => exp.date <= endDate);
    }
    
    displayExpenses(filtered);
    updateSummary(filtered);
}

function updateSummary(expenses) {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalExpenses').textContent = formatCurrency(total);
    document.getElementById('expenseCount').textContent = expenses.length;
    
    // Calculate this month's expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
    
    const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('monthExpenses').textContent = formatCurrency(monthTotal);
}

function showReceipt(url) {
    const modal = document.getElementById('receiptModal');
    const image = document.getElementById('modalImage');
    image.src = url;
    modal.classList.add('active');
}

async function deleteExpenseConfirm(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        if (db) {
            await deleteExpense(id);
        }
        allExpenses = allExpenses.filter(exp => exp.id !== id);
        displayExpenses(allExpenses);
        updateSummary(allExpenses);
        alert('Expense deleted successfully');
    } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
    }
}

function exportToCSV() {
    const headers = ['Date', 'Vendor', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = allExpenses.map(exp => [
        exp.date,
        exp.vendor,
        exp.category,
        exp.amount,
        exp.paymentMethod || '',
        exp.description || ''
    ]);
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
