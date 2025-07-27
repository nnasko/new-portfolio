import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf';
import { InvoiceStatus, Client } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceItemData {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceRequestData {
  date: string;
  dueDate: string;
  clientId: string;
  items: InvoiceItemData[];
  notes?: string | null;
}

interface InvoiceGenerationData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  items: InvoiceItemData[];
  notes?: string | null;
}

interface ResendEmailResponse {
  id: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

async function generateUniqueInvoiceNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  // Get the latest invoice for this month
  const latestInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `inv-${year}${month}-`
      }
    },
    orderBy: {
      invoiceNumber: 'desc'
    }
  });

  let sequence = 1;
  if (latestInvoice) {
    const lastSequence = parseInt(latestInvoice.invoiceNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `inv-${year}${month}-${sequence.toString().padStart(3, '0')}`;
}

export function generateInvoiceHTML(data: InvoiceGenerationData) {
  const total = data.items.reduce((sum: number, item: InvoiceItemData) => sum + (item.quantity * item.price), 0);
  const dueDate = new Date(data.dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });
  const invoiceDate = new Date(data.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333;
            line-height: 1.7;
            margin: 0;
            padding: 0;
            background-color: #fafafa;
          }
          
          .container {
            max-width: 850px;
            margin: 0 auto;
            padding: 40px 30px;
            background-color: #ffffff;
            min-height: 100vh;
          }
          
          .header {
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .logo {
            font-size: 28px;
            font-weight: 300;
            color: #333;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .company-tagline {
            font-size: 14px;
            color: #666;
            margin-bottom: 40px;
          }
          
          .invoice-meta {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-top: 30px;
          }
          
          .invoice-title {
            font-size: 24px;
            font-weight: 400;
            color: #333;
            margin-bottom: 8px;
            text-transform: lowercase;
            letter-spacing: -0.25px;
          }
          
          .invoice-number {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            color: #666;
            font-size: 15px;
            margin-bottom: 6px;
          }
          
          .date-info {
            text-align: right;
            font-size: 14px;
            color: #666;
          }
          
          .date-label {
            font-weight: 500;
            color: #333;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            margin-bottom: 16px;
            text-transform: lowercase;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 8px;
          }
          
          .client-info {
            background-color: #fafafa;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #333;
          }
          
          .client-name {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
          }
          
          .client-contact {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .items-table thead {
            background-color: #f8f9fa;
          }
          
          .items-table th {
            text-align: left;
            padding: 16px 20px;
            font-weight: 500;
            font-size: 14px;
            color: #495057;
            border-bottom: 1px solid #e9ecef;
            text-transform: lowercase;
          }
          
          .items-table td {
            padding: 16px 20px;
            border-bottom: 1px solid #f1f3f4;
            font-size: 14px;
          }
          
          .items-table tbody tr:last-child td {
            border-bottom: none;
          }
          
          .items-table tbody tr:hover {
            background-color: #fbfbfb;
          }
          
          .description-cell {
            font-weight: 500;
            color: #333;
          }
          
          .quantity-cell, .price-cell, .total-cell {
            text-align: right;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            color: #666;
          }
          
          .total-cell {
            font-weight: 600;
            color: #333;
          }
          
          .summary-section {
            margin-top: 30px;
            padding-top: 24px;
            border-top: 2px solid #e9ecef;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          
          .total-label {
            font-size: 18px;
            font-weight: 500;
            color: #333;
          }
          
          .total-amount {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          }
          
          .notes-section {
            background-color: #fafafa;
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid #007bff;
          }
          
          .notes-content {
            color: #495057;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-line;
          }
          
          .payment-details {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 24px;
            border-radius: 8px;
            margin-top: 40px;
          }
          
          .payment-title {
            font-size: 18px;
            font-weight: 500;
            color: #333;
            margin-bottom: 20px;
            text-transform: lowercase;
          }
          
          .payment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          
          .payment-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .payment-item:last-child {
            border-bottom: none;
          }
          
          .payment-label {
            font-size: 14px;
            color: #666;
            text-transform: lowercase;
          }
          
          .payment-value {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
          }
          
          .payment-link {
            grid-column: 1 / -1;
            margin-top: 16px;
            padding: 16px;
            background-color: #e7f3ff;
            border-radius: 6px;
            text-align: center;
          }
          
          .payment-link-text {
            color: #0066cc;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 24px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
          }
          
          .footer-text {
            color: #666;
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .footer-note {
            color: #999;
            font-size: 12px;
          }
          
          @media print {
            body {
              background-color: white;
            }
            .container {
              box-shadow: none;
              max-width: none;
              margin: 0;
              padding: 20px;
            }
            .payment-link {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <div class="logo">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</div>
            <div class="company-tagline">professional web development services</div>
            
            <div class="invoice-meta">
              <div>
                <div class="invoice-title">invoice</div>
                <div class="invoice-number">#${data.invoiceNumber.toLowerCase()}</div>
              </div>
              <div class="date-info">
                <div><span class="date-label">issued:</span> ${invoiceDate}</div>
                <div><span class="date-label">due:</span> ${dueDate}</div>
              </div>
            </div>
          </header>

          <section class="section">
            <h2 class="section-title">billed to</h2>
            <div class="client-info">
              <div class="client-name">${data.client.name}</div>
              <div class="client-contact">
                ${data.client.email}<br>
                ${data.client.address.replace(/\n/g, '<br>')}
              </div>
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">services provided</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>description</th>
                  <th style="text-align: right;">qty</th>
                  <th style="text-align: right;">rate</th>
                  <th style="text-align: right;">amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td class="description-cell">${item.description}</td>
                    <td class="quantity-cell">${item.quantity}</td>
                    <td class="price-cell">${formatCurrency(item.price)}</td>
                    <td class="total-cell">${formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="summary-section">
              <div class="total-row">
                <span class="total-label">total amount</span>
                <span class="total-amount">${formatCurrency(total)}</span>
              </div>
            </div>
          </section>

          ${data.notes ? `
            <section class="section">
              <h2 class="section-title">additional notes</h2>
              <div class="notes-section">
                <div class="notes-content">${data.notes}</div>
              </div>
            </section>
          ` : ''}

          <section class="payment-details">
            <h2 class="payment-title">payment information</h2>
            <div class="payment-grid">
              <div class="payment-item">
                <span class="payment-label">bank:</span>
                <span class="payment-value">${process.env.NEXT_PUBLIC_BANK_NAME}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">account name:</span>
                <span class="payment-value">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">account number:</span>
                <span class="payment-value">${process.env.NEXT_PUBLIC_ACCOUNT_NUMBER}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">sort code:</span>
                <span class="payment-value">${process.env.NEXT_PUBLIC_SORT_CODE}</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">payment terms:</span>
                <span class="payment-value">net 30 days</span>
              </div>
              <div class="payment-item">
                <span class="payment-label">reference:</span>
                <span class="payment-value">${data.invoiceNumber}</span>
              </div>
              
              <div class="payment-link">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${data.invoiceNumber.toLowerCase()}" class="payment-link-text">
                  pay online → ${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${data.invoiceNumber.toLowerCase()}
                </a>
              </div>
            </div>
          </section>

          <footer class="footer">
            <div class="footer-text">thank you for your business</div>
            <div class="footer-note">
              payment due within 30 days • questions? reply to this email
            </div>
          </footer>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  let generatedInvoiceNumber: string | null = null;
  let emailResponse: ResendEmailResponse | null = null;
  let fetchedClient: Client | null = null;

  try {
    // Check authentication (support both cookie and internal header)
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    const internalAuth = request.headers.get('X-Internal-Auth');
    
    const isAuthenticated = (authToken?.value === process.env.INVOICE_PASSWORD) || 
                           (internalAuth === process.env.INVOICE_PASSWORD);
    
    if (!isAuthenticated) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    if (!process.env.CONTACT_EMAIL) {
      throw new Error('CONTACT_EMAIL is not configured');
    }

    // Use updated interface for request body
    const requestData: InvoiceRequestData = await request.json();
    
    // --- Fetch Client Data --- 
    if (!requestData.clientId) {
        throw new Error('Client ID is missing from the request');
    }
    fetchedClient = await prisma.client.findUnique({
        where: { id: requestData.clientId },
    });
    if (!fetchedClient) {
        throw new Error(`Client with ID ${requestData.clientId} not found`);
    }
    // --- End Fetch Client Data --- 
    
    // Generate unique invoice number
    generatedInvoiceNumber = await generateUniqueInvoiceNumber();

    // Calculate total
    const total = requestData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Prepare data for PDF/HTML generation, including the fetched client
    const generationData: InvoiceGenerationData = {
        invoiceNumber: generatedInvoiceNumber,
        date: requestData.date,
        dueDate: requestData.dueDate,
        client: fetchedClient,
        items: requestData.items,
        notes: requestData.notes
    };

    // Create invoice object for PDF generation (use fetched client)
    const invoiceForPdf = {
      id: 'temp',
      invoiceNumber: generationData.invoiceNumber,
      date: new Date(generationData.date),
      dueDate: new Date(generationData.dueDate),
      clientName: generationData.client.name,
      clientEmail: generationData.client.email,
      clientAddress: generationData.client.address,
      clientId: generationData.client.id,
      notes: generationData.notes || null,
      total,
      amountPaid: 0,
      status: 'UNPAID' as InvoiceStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastReminder: null,
      reminderCount: 0,
      paidDate: null,
      paymentMethod: null,
      paymentReference: null,
      items: generationData.items.map(item => ({
        id: 'temp',
        invoiceId: 'temp',
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceForPdf);

    // Generate email HTML using generationData
    const emailHtml = generateInvoiceHTML(generationData);

    // Send email with Resend (use fetched client email)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL!,
      to: fetchedClient.email,
      subject: `invoice ${generationData.invoiceNumber}`,
      cc: process.env.CONTACT_EMAIL!,
      html: emailHtml,
      attachments: [
        {
          filename: `invoice-${generationData.invoiceNumber.toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    emailResponse = emailData;

    // Save to database - link to client using clientId
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generationData.invoiceNumber,
        date: new Date(generationData.date),
        dueDate: new Date(generationData.dueDate),
        clientId: fetchedClient.id,
        notes: generationData.notes,
        total,
        status: 'UNPAID' as InvoiceStatus,
        reminderCount: 0,
        items: {
          create: generationData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: { items: true, Client: true }
    });

    console.log('Invoice created successfully:', invoice);

    // Return invoice data including the associated client
    return NextResponse.json({ 
      success: true,
      data: {
        invoice,
        emailData: emailResponse
      }
    });

  } catch (error) {
    // Log the full error for debugging
    console.error('Full error details:', error);
    
    // Check if the operation was actually successful despite the error
    if (generatedInvoiceNumber && fetchedClient) {
      try {
        const createdInvoice = await prisma.invoice.findUnique({
          where: { 
            invoiceNumber: generatedInvoiceNumber
          },
          include: { items: true, Client: true }
        });

        if (createdInvoice) {
          console.log('Invoice exists despite error:', createdInvoice);
          return NextResponse.json({ 
            success: true,
            data: {
              invoice: createdInvoice,
              emailData: emailResponse
            },
            warning: 'Operation succeeded but encountered a non-critical error'
          });
        }
      } catch (findError) {
        console.error('Error checking invoice existence:', findError);
      }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}