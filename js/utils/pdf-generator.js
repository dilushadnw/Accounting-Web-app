/**
 * PDF Generator Utility
 * Helper functions for generating PDF reports
 * Requires jsPDF library: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
 */

/**
 * Generate PDF from HTML element
 * @param {string} elementId - ID of element to convert to PDF
 * @param {string} filename - Name of the PDF file
 */
function generatePDFFromElement(elementId, filename = 'report.pdf') {
    if (typeof jspdf === 'undefined') {
        console.warn('jsPDF library not loaded. Please include: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
        return;
    }
    
    const { jsPDF } = jspdf;
    const element = document.getElementById(elementId);
    const doc = new jsPDF();
    
    doc.html(element, {
        callback: function (doc) {
            doc.save(filename);
        },
        x: 10,
        y: 10,
        width: 190
    });
}

/**
 * Generate simple PDF report
 * @param {object} reportData - Report data object with title, date, and items
 * @param {string} filename - Name of the PDF file
 */
function generateSimplePDFReport(reportData, filename = 'report.pdf') {
    if (typeof jspdf === 'undefined') {
        console.warn('jsPDF library not loaded.');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(reportData.title, 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${reportData.date || new Date().toLocaleDateString()}`, 14, 32);
    
    // Add content
    let y = 45;
    doc.setFontSize(11);
    
    if (reportData.items && Array.isArray(reportData.items)) {
        reportData.items.forEach(item => {
            doc.text(`${item.label}: ${item.value}`, 14, y);
            y += 8;
        });
    }
    
    // Save
    doc.save(filename);
}

/**
 * Export table to PDF
 * @param {string} tableId - ID of table element
 * @param {string} filename - Name of the PDF file
 * @param {string} title - Title for the PDF
 */
function exportTableToPDF(tableId, filename = 'table.pdf', title = 'Table Export') {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF.API.autoTable === 'undefined') {
        console.warn('jsPDF and jsPDF-AutoTable libraries required. Include both libraries.');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    doc.autoTable({
        html: `#${tableId}`,
        startY: 25,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10
        }
    });
    
    doc.save(filename);
}

/**
 * Generate invoice PDF
 * @param {object} invoice - Invoice data
 */
function generateInvoicePDF(invoice) {
    if (typeof jspdf === 'undefined') {
        console.warn('jsPDF library not loaded.');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 35);
    doc.text(`Date: ${invoice.date}`, 14, 42);
    doc.text(`Customer: ${invoice.customerName}`, 14, 49);
    
    // Line items table (if autoTable is available)
    if (typeof doc.autoTable === 'function' && invoice.lineItems) {
        const lineItems = invoice.lineItems.map(item => [
            item.description,
            item.quantity,
            formatCurrency(item.rate),
            formatCurrency(item.amount)
        ]);
        
        doc.autoTable({
            startY: 60,
            head: [['Description', 'Quantity', 'Rate', 'Amount']],
            body: lineItems,
            theme: 'grid',
            headStyles: {
                fillColor: [37, 99, 235]
            }
        });
        
        // Totals
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, finalY);
        doc.text(`Tax: ${formatCurrency(invoice.taxAmount)}`, 140, finalY + 8);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, finalY + 18);
    }
    
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generatePDFFromElement,
        generateSimplePDFReport,
        exportTableToPDF,
        generateInvoicePDF
    };
}
