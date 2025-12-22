/**
 * Invoices List Logic
 * Handles invoice listing, filtering, and actions
 */

let currentUser = null;
let allInvoices = [];

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initUI();
            loadInvoices();
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
    if (currentUser.displayName) {
        document.getElementById('userName').textContent = currentUser.displayName;
    }
    const initials = (currentUser.displayName || currentUser.email).substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    
    // Filters
    document.getElementById('searchFilter').addEventListener('input', filterInvoices);
    document.getElementById('statusFilter').addEventListener('change', filterInvoices);
}

async function loadInvoices() {
    const tbody = document.getElementById('invoicesTableBody');
    
    if (!db) {
        // Show sample data
        displaySampleInvoices(tbody);
        return;
    }
    
    try {
        allInvoices = await getInvoices(currentUser.uid);
        displayInvoices(allInvoices);
    } catch (error) {
        console.error('Error loading invoices:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading invoices</td></tr>';
    }
}

function displaySampleInvoices(tbody) {
    const sampleInvoices = [
        { id: 'INV-001', invoiceNumber: 'INV-001', customerName: 'Acme Corporation', issueDate: '2024-12-15', dueDate: '2025-01-14', total: 2500, status: 'paid' },
        { id: 'INV-002', invoiceNumber: 'INV-002', customerName: 'Tech Solutions Inc.', issueDate: '2024-12-18', dueDate: '2025-01-17', total: 1800, status: 'sent' },
        { id: 'INV-003', invoiceNumber: 'INV-003', customerName: 'Global Services Ltd.', issueDate: '2024-12-20', dueDate: '2025-01-19', total: 3200, status: 'draft' },
        { id: 'INV-004', invoiceNumber: 'INV-004', customerName: 'Digital Marketing Co.', issueDate: '2024-12-10', dueDate: '2025-01-09', total: 1500, status: 'overdue' }
    ];
    
    allInvoices = sampleInvoices;
    displayInvoices(sampleInvoices);
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    
    if (!invoices || invoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 40px;">
                    <p>No invoices found.</p>
                    <a href="create-invoice.html" class="btn-link">Create your first invoice</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(invoice.invoiceNumber)}</strong></td>
            <td>${escapeHtml(invoice.customerName)}</td>
            <td>${formatDate(invoice.issueDate || invoice.date)}</td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td><strong>${formatCurrency(invoice.total)}</strong></td>
            <td>${getStatusBadge(invoice.status)}</td>
            <td>
                <button class="btn-link" onclick="viewInvoice('${invoice.id}')">View</button>
                <button class="btn-link" onclick="deleteInvoiceConfirm('${invoice.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterInvoices() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = allInvoices;
    
    if (searchTerm) {
        filtered = filtered.filter(inv => 
            inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
            inv.customerName.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    
    displayInvoices(filtered);
}

function getStatusBadge(status) {
    const badges = {
        'draft': '<span class="badge badge-info">Draft</span>',
        'sent': '<span class="badge badge-warning">Sent</span>',
        'paid': '<span class="badge badge-success">Paid</span>',
        'overdue': '<span class="badge badge-danger">Overdue</span>'
    };
    return badges[status] || '<span class="badge badge-info">' + status + '</span>';
}

function viewInvoice(id) {
    window.location.href = `view-invoice.html?id=${id}`;
}

async function deleteInvoiceConfirm(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
        if (db) {
            await deleteInvoice(id);
        }
        allInvoices = allInvoices.filter(inv => inv.id !== id);
        displayInvoices(allInvoices);
        alert('Invoice deleted successfully');
    } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
