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
    // Check if jsPDF is available
    if (typeof jspdf === 'undefined') {
        console.warn('jsPDF library not loaded. PDF export is unavailable.');
        alert('PDF export requires jsPDF library to be loaded.');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Profit & Loss Report', 14, 22);
    
    // Add period
    const period = document.getElementById('reportPeriod').textContent;
    doc.setFontSize(12);
    doc.text(`Period: ${period}`, 14, 32);
    
    // Add date generated
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);
    
    // Income section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Income', 14, 52);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const salesRevenue = document.getElementById('salesRevenue').textContent;
    const otherIncome = document.getElementById('otherIncome').textContent;
    const totalIncome = document.getElementById('totalIncome').textContent;
    
    doc.text(`Sales Revenue: ${salesRevenue}`, 20, 60);
    doc.text(`Other Income: ${otherIncome}`, 20, 68);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Income: ${totalIncome}`, 20, 76);
    
    // Expense section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.text('Expenses', 14, 90);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const officeExpenses = document.getElementById('officeExpenses').textContent;
    const travelExpenses = document.getElementById('travelExpenses').textContent;
    const mealsExpenses = document.getElementById('mealsExpenses').textContent;
    const utilitiesExpenses = document.getElementById('utilitiesExpenses').textContent;
    const suppliesExpenses = document.getElementById('suppliesExpenses').textContent;
    const otherExpenses = document.getElementById('otherExpenses').textContent;
    const totalExpenses = document.getElementById('totalExpenses').textContent;
    
    doc.text(`Office Expenses: ${officeExpenses}`, 20, 98);
    doc.text(`Travel Expenses: ${travelExpenses}`, 20, 106);
    doc.text(`Meals & Entertainment: ${mealsExpenses}`, 20, 114);
    doc.text(`Utilities: ${utilitiesExpenses}`, 20, 122);
    doc.text(`Supplies: ${suppliesExpenses}`, 20, 130);
    doc.text(`Other Expenses: ${otherExpenses}`, 20, 138);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Expenses: ${totalExpenses}`, 20, 146);
    
    // Net Profit/Loss
    const netResult = document.getElementById('netResult');
    const netLabel = netResult.querySelector('span:first-child').textContent;
    const netAmount = document.getElementById('netAmount').textContent;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    
    // Set color based on profit/loss
    if (netLabel === 'Net Profit') {
        doc.setTextColor(5, 150, 105); // Green
    } else {
        doc.setTextColor(220, 38, 38); // Red
    }
    
    doc.text(`${netLabel}: ${netAmount}`, 14, 162);
    
    // Save the PDF
    doc.save(`profit-loss-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
