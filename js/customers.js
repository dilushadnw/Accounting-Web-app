/**
 * Customers Management Logic
 */

let currentUser = null;
let allCustomers = [];

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

function initAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            initUI();
            if (window.location.pathname.includes('customers.html')) {
                loadCustomers();
            }
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
    
    const logoutBtn = document.getElementById('logoutBtn');
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
    
    // Setup search
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('input', filterCustomers);
    }
}

async function loadCustomers() {
    const tbody = document.getElementById('customersTableBody');
    
    if (!db) {
        displaySampleCustomers(tbody);
        return;
    }
    
    try {
        allCustomers = await getCustomers(currentUser.uid);
        displayCustomers(allCustomers);
        updateStats(allCustomers);
    } catch (error) {
        console.error('Error loading customers:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error loading customers</td></tr>';
    }
}

function displaySampleCustomers(tbody) {
    allCustomers = [
        { id: '1', displayName: 'Acme Corporation', email: 'contact@acme.com', phone: '(555) 123-4567', balanceOwed: 2500 },
        { id: '2', displayName: 'Tech Solutions Inc.', email: 'info@techsolutions.com', phone: '(555) 234-5678', balanceOwed: 0 },
        { id: '3', displayName: 'Global Services Ltd.', email: 'hello@globalservices.com', phone: '(555) 345-6789', balanceOwed: 3200 },
        { id: '4', displayName: 'Digital Marketing Co.', email: 'contact@digitalmarketing.com', phone: '(555) 456-7890', balanceOwed: 1500 }
    ];
    displayCustomers(allCustomers);
    updateStats(allCustomers);
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTableBody');
    
    if (!customers || customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 40px;">
                    <p>No customers found.</p>
                    <a href="add-customer.html" class="btn-link">Add your first customer</a>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${escapeHtml(customer.displayName)}</strong></td>
            <td>${escapeHtml(customer.email || '-')}</td>
            <td>${escapeHtml(customer.phone || '-')}</td>
            <td><strong>${formatCurrency(customer.balanceOwed || 0)}</strong></td>
            <td>
                <a href="customer-detail.html?id=${customer.id}" class="btn-link">View</a>
                <button class="btn-link" onclick="deleteCustomerConfirm('${customer.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function filterCustomers() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
    
    let filtered = allCustomers;
    
    if (searchTerm) {
        filtered = filtered.filter(cust => 
            cust.displayName.toLowerCase().includes(searchTerm) ||
            (cust.email && cust.email.toLowerCase().includes(searchTerm)) ||
            (cust.phone && cust.phone.toLowerCase().includes(searchTerm))
        );
    }
    
    displayCustomers(filtered);
}

function updateStats(customers) {
    document.getElementById('totalCustomers').textContent = customers.length;
    
    const totalOwed = customers.reduce((sum, cust) => sum + (cust.balanceOwed || 0), 0);
    document.getElementById('totalOwed').textContent = formatCurrency(totalOwed);
    
    // Calculate active customers this month (with balance or recent activity)
    const activeCount = customers.filter(cust => (cust.balanceOwed || 0) > 0).length;
    document.getElementById('activeCustomers').textContent = activeCount;
}

async function deleteCustomerConfirm(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
        if (db) {
            await deleteCustomer(id);
        }
        allCustomers = allCustomers.filter(cust => cust.id !== id);
        displayCustomers(allCustomers);
        updateStats(allCustomers);
        alert('Customer deleted successfully');
    } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Error deleting customer');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
