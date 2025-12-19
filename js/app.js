// Main Application Logic

// State Management
let transactions = [];
let currentUser = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeForm();
    initializeFilters();
    
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
            loadTransactions();
        } else {
            // Use demo data when not logged in
            loadDemoData();
        }
    });
});

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Update reports when switching to reports tab
            if (targetTab === 'reports') {
                updateReports();
            }
        });
    });
}

// Form Handling
function initializeForm() {
    const form = document.getElementById('transactionForm');
    
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addTransaction();
    });
}

// Add Transaction
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    const transaction = {
        id: Date.now().toString(),
        description,
        amount,
        type,
        category,
        date,
        timestamp: Date.now()
    };

    // Save to Firebase if user is logged in
    if (currentUser) {
        database.ref(`users/${currentUser.uid}/transactions/${transaction.id}`).set(transaction)
            .then(() => {
                console.log('Transaction saved to Firebase');
                transactions.push(transaction);
                updateUI();
                document.getElementById('transactionForm').reset();
                document.getElementById('date').valueAsDate = new Date();
            })
            .catch((error) => {
                console.error('Error saving transaction:', error);
                alert('Error saving transaction. Using local storage.');
                saveLocally(transaction);
            });
    } else {
        // Save locally if not logged in
        saveLocally(transaction);
    }
}

// Save transaction locally
function saveLocally(transaction) {
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
    document.getElementById('transactionForm').reset();
    document.getElementById('date').valueAsDate = new Date();
}

// Load Transactions from Firebase
function loadTransactions() {
    if (!currentUser) return;

    database.ref(`users/${currentUser.uid}/transactions`).on('value', (snapshot) => {
        transactions = [];
        snapshot.forEach((childSnapshot) => {
            transactions.push(childSnapshot.val());
        });
        updateUI();
    });
}

// Load Demo Data
function loadDemoData() {
    const stored = localStorage.getItem('transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    } else {
        // Create some demo transactions
        transactions = [
            {
                id: '1',
                description: 'Monthly Salary',
                amount: 5000,
                type: 'income',
                category: 'salary',
                date: '2024-01-01',
                timestamp: Date.now() - 86400000 * 30
            },
            {
                id: '2',
                description: 'Grocery Shopping',
                amount: 150,
                type: 'expense',
                category: 'food',
                date: '2024-01-15',
                timestamp: Date.now() - 86400000 * 15
            },
            {
                id: '3',
                description: 'Gas Bill',
                amount: 80,
                type: 'expense',
                category: 'utilities',
                date: '2024-01-20',
                timestamp: Date.now() - 86400000 * 10
            }
        ];
    }
    updateUI();
}

// Delete Transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        if (currentUser) {
            database.ref(`users/${currentUser.uid}/transactions/${id}`).remove()
                .then(() => {
                    console.log('Transaction deleted from Firebase');
                })
                .catch((error) => {
                    console.error('Error deleting transaction:', error);
                });
        } else {
            transactions = transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(transactions));
            updateUI();
        }
    }
}

// Update UI
function updateUI() {
    updateDashboard();
    displayTransactions();
}

// Update Dashboard
function updateDashboard() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;

    document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('netBalance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('netBalance').className = balance >= 0 ? 'amount positive' : 'amount negative';
    document.getElementById('transactionCount').textContent = transactions.length;

    // Update recent transactions
    displayRecentTransactions();
}

// Display Recent Transactions
function displayRecentTransactions() {
    const recentList = document.getElementById('recentList');
    const recent = [...transactions]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);

    if (recent.length === 0) {
        recentList.innerHTML = '<div class="empty-state"><p>No transactions yet</p></div>';
        return;
    }

    recentList.innerHTML = recent.map(t => createTransactionElement(t)).join('');
}

// Display All Transactions
function displayTransactions() {
    const list = document.getElementById('transactionList');
    const filterType = document.getElementById('filterType').value;
    const filterCategory = document.getElementById('filterCategory').value;

    let filtered = [...transactions];

    if (filterType !== 'all') {
        filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
        filtered = filtered.filter(t => t.category === filterCategory);
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No transactions found</p></div>';
        return;
    }

    list.innerHTML = filtered.map(t => createTransactionElement(t, true)).join('');
}

// Create Transaction Element
function createTransactionElement(transaction, showDelete = false) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const deleteBtn = showDelete ? 
        `<div class="transaction-actions">
            <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')">Delete</button>
        </div>` : '';

    return `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-details">
                <h4>${transaction.description}</h4>
                <p>${transaction.category} • ${transaction.date}</p>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${sign}$${transaction.amount.toFixed(2)}
            </div>
            ${deleteBtn}
        </div>
    `;
}

// Initialize Filters
function initializeFilters() {
    document.getElementById('filterType').addEventListener('change', displayTransactions);
    document.getElementById('filterCategory').addEventListener('change', displayTransactions);
}

// Update Reports
function updateReports() {
    updateCategoryReport();
    updateMonthlyReport();
}

// Category Report
function updateCategoryReport() {
    const categoryReport = document.getElementById('categoryReport');
    const categoryTotals = {};

    transactions.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            categoryTotals[t.category].income += t.amount;
        } else {
            categoryTotals[t.category].expense += t.amount;
        }
    });

    if (Object.keys(categoryTotals).length === 0) {
        categoryReport.innerHTML = '<div class="empty-state"><p>No data available</p></div>';
        return;
    }

    categoryReport.innerHTML = Object.entries(categoryTotals).map(([category, totals]) => `
        <div class="report-item">
            <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <span>Income: $${totals.income.toFixed(2)} | Expenses: $${totals.expense.toFixed(2)}</span>
        </div>
    `).join('');
}

// Monthly Report
function updateMonthlyReport() {
    const monthlyReport = document.getElementById('monthlyReport');
    const monthlyTotals = {};

    transactions.forEach(t => {
        const month = t.date.substring(0, 7); // YYYY-MM
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyTotals[month].income += t.amount;
        } else {
            monthlyTotals[month].expense += t.amount;
        }
    });

    if (Object.keys(monthlyTotals).length === 0) {
        monthlyReport.innerHTML = '<div class="empty-state"><p>No data available</p></div>';
        return;
    }

    const sortedMonths = Object.entries(monthlyTotals).sort((a, b) => b[0].localeCompare(a[0]));

    monthlyReport.innerHTML = sortedMonths.map(([month, totals]) => {
        const balance = totals.income - totals.expense;
        return `
            <div class="report-item">
                <span>${month}</span>
                <span style="color: ${balance >= 0 ? '#4caf50' : '#f44336'}">
                    Net: $${balance.toFixed(2)} (Income: $${totals.income.toFixed(2)} | Expenses: $${totals.expense.toFixed(2)})
                </span>
            </div>
        `;
    }).join('');
}
