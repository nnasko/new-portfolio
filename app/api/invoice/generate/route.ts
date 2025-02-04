import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceItemData {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItemData[];
  notes?: string | null;
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

export function generateInvoiceHTML(data: InvoiceData) {
  const total = data.items.reduce((sum: number, item: InvoiceItemData) => sum + (item.quantity * item.price), 0);
  const dueDate = new Date(data.dueDate).toLocaleDateString('en-GB');
  const invoiceDate = new Date(data.date).toLocaleDateString('en-GB');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem 2rem;
            background-color: #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .header {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            font-size: 1.5rem;
            font-weight: 600;
            color: #000000;
            margin-bottom: 1rem;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-top: 1.5rem;
            color: #666;
          }
          .invoice-number {
            font-family: monospace;
            color: #666;
            font-size: 1.1rem;
          }
          .section {
            margin-bottom: 2.5rem;
          }
          .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #000000;
            margin-bottom: 1rem;
          }
          .items {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
          }
          .items th {
            text-align: left;
            padding: 1rem;
            background-color: #f5f5f5;
            border-bottom: 2px solid #eaeaea;
            font-weight: 500;
          }
          .items td {
            padding: 1rem;
            border-bottom: 1px solid #eaeaea;
          }
          .items tr:last-child td {
            border-bottom: none;
          }
          .total-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid #eaeaea;
          }
          .total {
            text-align: right;
            font-size: 1.4rem;
            font-weight: 600;
            color: #000000;
          }
          .bank-details {
            background-color: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2.5rem;
          }
          .bank-details h2 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #000000;
          }
          .bank-details p {
            margin: 0.5rem 0;
            color: #666;
          }
          .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #eaeaea;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
          }
          .highlight {
            color: #000000;
            font-weight: 500;
          }
          .due-date {
            color: #666;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</div>
            <div class="invoice-details">
              <div class="flex flex-col space-y-2">
                <div class="invoice-number">invoice #${data.invoiceNumber.toLowerCase()}</div>
                <div class="due-date">due date: ${dueDate}</div>
              </div>
              <div>
                <div>date: ${invoiceDate}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">client information</div>
            <p class="highlight">${data.clientName}</p>
            <p>${data.clientEmail}</p>
            <p style="white-space: pre-line">${data.clientAddress}</p>
          </div>

          <div class="section">
            <div class="section-title">services</div>
            <table class="items">
              <thead>
                <tr>
                  <th>description</th>
                  <th>quantity</th>
                  <th>price</th>
                  <th>total</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total-section">
              <div class="total">
                total: ${formatCurrency(total)}
              </div>
            </div>
          </div>

          ${data.notes ? `
            <div class="section">
              <div class="section-title">notes</div>
              <p style="white-space: pre-line">${data.notes}</p>
            </div>
          ` : ''}

          <div class="bank-details">
            <h2>payment details</h2>
            <p><span class="highlight">bank:</span> ${process.env.NEXT_PUBLIC_BANK_NAME}</p>
            <p><span class="highlight">account name:</span> ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            <p><span class="highlight">account number:</span> ${process.env.NEXT_PUBLIC_ACCOUNT_NUMBER}</p>
            <p><span class="highlight">sort code:</span> ${process.env.NEXT_PUBLIC_SORT_CODE}</p>
          </div>

          <div class="footer">
            thank you for your business!
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const total = data.items.reduce((sum: number, item: InvoiceItemData) => sum + (item.quantity * item.price), 0);

    // Generate unique invoice number
    const invoiceNumber = await generateUniqueInvoiceNumber();

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(data.date),
        dueDate: new Date(data.dueDate),
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        notes: data.notes,
        total,
        items: {
          create: data.items.map((item: InvoiceItemData) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send email with PDF attachment
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL!,
      to: data.clientEmail,
      subject: `invoice ${invoiceNumber} from ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                color: #1a1a1a;
                line-height: 1.5;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 40px;
                background-color: #ffffff;
                border: 1px solid #eaeaea;
              }
              p {
                margin: 0;
                padding: 0;
                margin-bottom: 16px;
                color: #666666;
              }
              .highlight {
                color: #1a1a1a;
              }
              .signature {
                margin-top: 32px;
                padding-top: 16px;
                border-top: 1px solid #eaeaea;
                color: #666666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <p>hello ${data.clientName.toLowerCase()},</p>
              <p>please find attached invoice <span class="highlight">${invoiceNumber.toLowerCase()}</span>.</p>
              <p>payment is due by <span class="highlight">${new Date(data.dueDate).toLocaleDateString('en-GB')}</span>.</p>
              <p>thank you for your business.</p>
              <div class="signature">
                best regards,<br>
                ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceNumber.toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
      cc: process.env.CONTACT_EMAIL,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new NextResponse('Error sending invoice email', { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice generated and sent successfully',
      data: emailData,
      invoice,
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return new NextResponse('Error generating invoice', { status: 500 });
  }
}