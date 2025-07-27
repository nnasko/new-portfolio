// Import both options conditionally
import puppeteer from 'puppeteer'; // For local development
import puppeteerCore from 'puppeteer-core'; // For production/Vercel
import chromium from '@sparticuz/chromium'; // For production/Vercel
import { Invoice, InvoiceItem, Client } from '@prisma/client';
import { generateInvoiceHTML } from '@/app/api/invoice/generate/route';

// Define the type expected by this function more accurately
// based on how 'invoiceForPdf' is constructed in the API route
type InvoiceForPdfType = Omit<Invoice, 'Client' | 'date' | 'dueDate' | 'createdAt' | 'updatedAt'> & {
    items: InvoiceItem[];
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    clientId: string;
    // Add Date objects back if they are needed by this function specifically
    date: Date;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
};

// --- Define Interfaces Locally --- 
// (Mirroring the one from generate/route.ts)
interface InvoiceItemData { // Assuming this is needed by InvoiceGenerationData
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceGenerationData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  items: InvoiceItemData[];
  notes?: string | null;
}
// --- End Local Interface Definitions --- 

export async function generateInvoicePDF(invoice: InvoiceForPdfType): Promise<Buffer> {
  let browser = null; // Define browser outside try for finally block
  const isProduction = process.env.NODE_ENV === 'production';
  
  try {
    if (isProduction) {
      // Production: Use puppeteer-core with @sparticuz/chromium
      console.log('Production environment detected. Using puppeteer-core with @sparticuz/chromium...');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true, // Use boolean value for headless
      });
    } else {
      // Development: Use full puppeteer (which bundles its own Chromium)
      console.log('Development environment detected. Using standard puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        // Development-only args if needed
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    
    console.log('Browser launched successfully.');
    const page = await browser.newPage();
    console.log('New page created.');
    
    // Reconstruct the Client object for InvoiceGenerationData
    const clientData: Client = {
        emails: [invoice.clientEmail],
        id: invoice.clientId,
        name: invoice.clientName,
        email: invoice.clientEmail,
        address: invoice.clientAddress,
        createdAt: new Date(), // Placeholder - original createdAt not in invoiceForPdf
        updatedAt: new Date(), // Placeholder - original updatedAt not in invoiceForPdf
    };

    // Construct the data object generateInvoiceHTML expects
    const dataForHtml: InvoiceGenerationData = {
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date.toISOString(), // Convert Date back to ISO string
        dueDate: invoice.dueDate.toISOString(), // Convert Date back to ISO string
        client: clientData, // Pass the reconstructed Client object
        items: invoice.items,
        notes: invoice.notes,
    };
    
    console.log('Generating HTML content...');
    const htmlContent = generateInvoiceHTML(dataForHtml);
    console.log('Setting page content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    console.log('Page content set.');

    // Generate PDF
    console.log('Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 0 15mm;">
          ${dataForHtml.invoiceNumber.toUpperCase()} • ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666; padding: 0 15mm;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: true,
    });
    console.log('PDF generated successfully.');

    return Buffer.from(pdf);
  } catch (error) {
      // Add more detailed error logging
      console.error(`Error during PDF generation in ${isProduction ? 'production' : 'development'} mode:`, error);
      if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
      }
      // Re-throw the error to be caught by the API route
      throw error; 
  } finally {
    if (browser !== null) {
      console.log('Closing browser...');
      await browser.close();
      console.log('Browser closed.');
    }
  }
} 