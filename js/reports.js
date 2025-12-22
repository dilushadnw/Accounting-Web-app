/**
 * Reports Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profit-loss.html')) {
        initProfitLoss();
    }
});

function initProfitLoss() {
    const dateRangeSelect = document.getElementById('dateRange');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const customDatesGroup = document.getElementById('customDatesGroup');
    const customDatesGroup2 = document.getElementById('customDatesGroup2');
    
    // Handle date range selection
    dateRangeSelect.addEventListener('change', () => {
        if (dateRangeSelect.value === 'custom') {
            customDatesGroup.style.display = 'block';
            customDatesGroup2.style.display = 'block';
        } else {
            customDatesGroup.style.display = 'none';
            customDatesGroup2.style.display = 'none';
        }
    });
    
    // Generate report button
    document.getElementById('generateBtn').addEventListener('click', generateReport);
    
    // Export buttons
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    
    // Load initial report
    generateReport();
}

function generateReport() {
    const dateRange = document.getElementById('dateRange').value;
    let periodText = '';
    
    switch(dateRange) {
        case 'this_month':
            periodText = 'This Month';
            break;
        case 'last_month':
            periodText = 'Last Month';
            break;
        case 'this_year':
            periodText = 'This Year';
            break;
        case 'custom':
            const start = document.getElementById('startDate').value;
            const end = document.getElementById('endDate').value;
            if (start && end) {
                periodText = `${formatDate(start)} - ${formatDate(end)}`;
            } else {
                periodText = 'Custom Range';
            }
            break;
    }
    
    document.getElementById('reportPeriod').textContent = periodText;
    
    // Calculate totals
    calculateTotals();
}

function calculateTotals() {
    // Get income values
    const salesRevenue = parseFloat(document.getElementById('salesRevenue').textContent.replace(/[$,]/g, ''));
    const otherIncome = parseFloat(document.getElementById('otherIncome').textContent.replace(/[$,]/g, ''));
    const totalIncome = salesRevenue + otherIncome;
    
    // Get expense values
    const officeExpenses = parseFloat(document.getElementById('officeExpenses').textContent.replace(/[$,]/g, ''));
    const travelExpenses = parseFloat(document.getElementById('travelExpenses').textContent.replace(/[$,]/g, ''));
    const mealsExpenses = parseFloat(document.getElementById('mealsExpenses').textContent.replace(/[$,]/g, ''));
    const utilitiesExpenses = parseFloat(document.getElementById('utilitiesExpenses').textContent.replace(/[$,]/g, ''));
    const suppliesExpenses = parseFloat(document.getElementById('suppliesExpenses').textContent.replace(/[$,]/g, ''));
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').textContent.replace(/[$,]/g, ''));
    const totalExpenses = officeExpenses + travelExpenses + mealsExpenses + utilitiesExpenses + suppliesExpenses + otherExpenses;
    
    // Calculate net
    const netAmount = totalIncome - totalExpenses;
    
    // Update display
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('netAmount').textContent = formatCurrency(Math.abs(netAmount));
    
    // Update net profit/loss styling
    const netResult = document.getElementById('netResult');
    if (netAmount >= 0) {
        netResult.className = 'report-line net-profit';
        netResult.querySelector('span:first-child').textContent = 'Net Profit';
    } else {
        netResult.className = 'report-line net-loss';
        netResult.querySelector('span:first-child').textContent = 'Net Loss';
    }
}

function exportToPDF() {
    alert('PDF export functionality requires jsPDF library. This is a placeholder for the export feature.');
    // In production, you would use jsPDF:
    // const doc = new jsPDF();
    // doc.text('Profit & Loss Report', 10, 10);
    // ... add report content
    // doc.save('profit-loss-report.pdf');
}

function exportToCSV() {
    const period = document.getElementById('reportPeriod').textContent;
    
    const data = [
        ['Profit & Loss Report', ''],
        ['Period', period],
        ['', ''],
        ['Income', ''],
        ['Sales Revenue', document.getElementById('salesRevenue').textContent],
        ['Other Income', document.getElementById('otherIncome').textContent],
        ['Total Income', document.getElementById('totalIncome').textContent],
        ['', ''],
        ['Expenses', ''],
        ['Office Expenses', document.getElementById('officeExpenses').textContent],
        ['Travel Expenses', document.getElementById('travelExpenses').textContent],
        ['Meals & Entertainment', document.getElementById('mealsExpenses').textContent],
        ['Utilities', document.getElementById('utilitiesExpenses').textContent],
        ['Supplies', document.getElementById('suppliesExpenses').textContent],
        ['Other Expenses', document.getElementById('otherExpenses').textContent],
        ['Total Expenses', document.getElementById('totalExpenses').textContent],
        ['', ''],
        [document.getElementById('netResult').querySelector('span:first-child').textContent, document.getElementById('netAmount').textContent]
    ];
    
    let csv = '';
    data.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}
