import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { config } from '../config.js';

export function generateInvoice({ auction, buyer, seller, amount }) {
  if (!fs.existsSync(config.invoicePath)) fs.mkdirSync(config.invoicePath, { recursive: true });
  const filename = `invoice_${auction.id}.pdf`;
  const filepath = path.join(config.invoicePath, filename);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filepath));

  doc.fontSize(20).text('Auction Invoice', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Auction: ${auction.item_name}`);
  doc.text(`Auction ID: ${auction.id}`);
  doc.text(`Seller: ${seller.name} <${seller.email}>`);
  doc.text(`Buyer: ${buyer.name} <${buyer.email}>`);
  doc.moveDown();
  doc.text(`Final Amount: ₹${amount}`);
  doc.text(`Date: ${new Date().toLocaleString()}`);
  doc.end();

  return filepath;
}
