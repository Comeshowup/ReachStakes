import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoicePdf = async (invoice, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('INVOICE', { align: 'right' });
            doc.moveDown();

            doc.fontSize(10).text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
            doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, { align: 'right' });
            doc.text(`Status: ${invoice.status}`, { align: 'right' });
            doc.moveDown();

            // From / To
            doc.fontSize(12).text('From:', 50, 150);
            doc.font('Helvetica-Bold').text(invoice.creator.fullName);
            doc.font('Helvetica').text(invoice.creator.email);
            doc.moveDown();

            doc.text('To:', 300, 150);
            doc.font('Helvetica-Bold').text(invoice.brandName);
            doc.moveDown();

            // Line Items Header
            const tableTop = 250;
            doc.font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Amount', 400, tableTop, { align: 'right' });

            // Line
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Item
            const itemTop = tableTop + 30;
            doc.font('Helvetica');
            doc.text(invoice.campaignTitle || 'Campaign Services', 50, itemTop);
            doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 400, itemTop, { align: 'right' });

            // Total
            const totalTop = itemTop + 50;
            doc.moveTo(50, totalTop - 10).lineTo(550, totalTop - 10).stroke();
            doc.fontSize(14).font('Helvetica-Bold').text('Total:', 300, totalTop);
            doc.text(`$${parseFloat(invoice.amount).toFixed(2)}`, 400, totalTop, { align: 'right' });

            // Footer
            doc.fontSize(10).font('Helvetica').text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
