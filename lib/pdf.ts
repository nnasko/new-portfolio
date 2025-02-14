import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { generateInvoiceHTML } from '@/app/api/invoice/generate/route';
import { Invoice, InvoiceItem } from '@prisma/client';

export async function generateInvoicePDF(invoice: Invoice & { items: InvoiceItem[] }): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    
    // Set content
    const htmlContent = generateInvoiceHTML({
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
    });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '40px',
        right: '40px',
        bottom: '40px',
        left: '40px'
      },
      printBackground: true,
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
} 