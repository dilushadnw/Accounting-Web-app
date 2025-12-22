/**
 * Dashboard Logic
 * Handles dashboard functionality, user menu, sidebar, and data display
 */

let currentUser = null;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initMenuToggle();
    initUserMenu();
    initSidebar();
});

/**
 * Initialize Authentication
 */
function initAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            updateUserInfo(user);
            loadDashboardData();
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });
}

/**
 * Update user information in the navbar
 */
function updateUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userInitialsElement = document.getElementById('userInitials');
    
    if (userNameElement && user.displayName) {
        userNameElement.textContent = user.displayName;
    } else if (userNameElement && user.email) {
        userNameElement.textContent = user.email.split('@')[0];
    }
    
    if (userInitialsElement) {
        const initials = getInitials(user.displayName || user.email);
        userInitialsElement.textContent = initials;
    }
}

/**
 * Get user initials from name or email
 */
function getInitials(name) {
    if (!name) return 'U';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Initialize mobile menu toggle
 */
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
}

/**
 * Initialize user menu dropdown
 */
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await auth.signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error logging out. Please try again.');
                }
            }
        });
    }
}

/**
 * Initialize sidebar navigation
 */
function initSidebar() {
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href)) {
            item.classList.add('active');
        } else if (href) {
            item.classList.remove('active');
        }
    });
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        await loadRecentInvoices();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

/**
 * Load recent invoices
 */
async function loadRecentInvoices() {
    const tableBody = document.getElementById('recentInvoices');
    
    if (!tableBody) return;
    
    // Check if Firestore is available
    if (!db) {
        // Show sample data if Firestore is not configured
        displaySampleInvoices(tableBody);
        return;
    }
    
    try {
        const snapshot = await db.collection('invoices')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 40px; color: #64748b;">
                        No invoices yet. <a href="create-invoice.html" style="color: #2563eb;">Create your first invoice</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const invoice = doc.data();
            const row = createInvoiceRow(doc.id, invoice);
            tableBody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        displaySampleInvoices(tableBody);
    }
}

/**
 * Display sample invoices for demo
 */
function displaySampleInvoices(tableBody) {
    const sampleInvoices = [
        {
            id: 'INV-001',
            customerName: 'Acme Corporation',
            date: '2024-12-15',
            total: 2500.00,
            status: 'paid'
        },
        {
            id: 'INV-002',
            customerName: 'Tech Solutions Inc.',
            date: '2024-12-18',
            total: 1800.00,
            status: 'sent'
        },
        {
            id: 'INV-003',
            customerName: 'Global Services Ltd.',
            date: '2024-12-20',
            total: 3200.00,
            status: 'draft'
        },
        {
            id: 'INV-004',
            customerName: 'Digital Marketing Co.',
            date: '2024-12-10',
            total: 1500.00,
            status: 'overdue'
        }
    ];
    
    tableBody.innerHTML = '';
    
    sampleInvoices.forEach(invoice => {
        const row = createInvoiceRow(invoice.id, invoice);
        tableBody.appendChild(row);
    });
}

/**
 * Create invoice table row
 */
function createInvoiceRow(id, invoice) {
    const row = document.createElement('tr');
    
    const invoiceNumber = invoice.invoiceNumber || id;
    const customerName = invoice.customerName || 'Unknown';
    const date = invoice.date || invoice.issueDate || 'N/A';
    const total = invoice.total || 0;
    const status = invoice.status || 'draft';
    
    row.innerHTML = `
        <td><strong>${escapeHtml(invoiceNumber)}</strong></td>
        <td>${escapeHtml(customerName)}</td>
        <td>${formatDate(date)}</td>
        <td><strong>${formatCurrency(total)}</strong></td>
        <td>${getStatusBadge(status)}</td>
    `;
    
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
        window.location.href = `view-invoice.html?id=${id}`;
    });
    
    return row;
}

/**
 * Get status badge HTML
 */
function getStatusBadge(status) {
    const statusMap = {
        'draft': { class: 'badge-info', text: 'Draft' },
        'sent': { class: 'badge-warning', text: 'Sent' },
        'paid': { class: 'badge-success', text: 'Paid' },
        'overdue': { class: 'badge-danger', text: 'Overdue' }
    };
    
    const badge = statusMap[status.toLowerCase()] || { class: 'badge-info', text: status };
    
    return `<span class="badge ${badge.class}">${escapeHtml(badge.text)}</span>`;
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    } catch (error) {
        return dateString;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show error message
 */
function showError(message) {
    console.error(message);
    // You can implement a toast notification here
}
