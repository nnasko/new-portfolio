import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateInvoicePDF } from '@/lib/pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

// Invoice HTML generation function (copied from invoice/generate/route.ts)
function generateInvoiceHTML(data: {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: { name: string; email: string; address: string };
  items: { description: string; quantity: number; price: number }[];
  notes?: string | null;
}) {
  const total = data.items.reduce((sum: number, item) => sum + (item.quantity * item.price), 0);
  const dueDate = new Date(data.dueDate).toLocaleDateString('en-GB');
  const invoiceDate = new Date(data.date).toLocaleDateString('en-GB');
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem 2rem;
            background-color: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
          }
          .header {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #1a1a1a;
          }
          .logo {
            font-size: 1.5rem;
            font-weight: 300;
            color: #1a1a1a;
            margin-bottom: 1rem;
            letter-spacing: -0.5px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-top: 1.5rem;
            color: #6b7280;
          }
          .invoice-number {
            font-family: monospace;
            color: #6b7280;
            font-size: 1.1rem;
          }
          .section {
            margin-bottom: 2.5rem;
          }
          .section-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a1a1a;
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
            background-color: #f8fafc;
            border-bottom: 2px solid #e5e7eb;
            font-weight: 600;
          }
          .items td {
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .items tr:last-child td {
            border-bottom: none;
          }
          .total-section {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 2px solid #1a1a1a;
          }
          .total {
            text-align: right;
            font-size: 1.4rem;
            font-weight: 600;
            color: #1a1a1a;
          }
          .bank-details {
            background-color: #f8fafc;
            border: 1px solid #e5e7eb;
            padding: 1.5rem;
            border-radius: 12px;
            margin-top: 2.5rem;
          }
          .bank-details h2 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            color: #1a1a1a;
            font-weight: 600;
          }
          .bank-details p {
            margin: 0.5rem 0;
            color: #6b7280;
          }
          .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9rem;
          }
          .highlight {
            color: #1a1a1a;
            font-weight: 600;
          }
          .due-date {
            color: #6b7280;
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
            <p class="highlight">${data.client.name}</p>
            <p>${data.client.email}</p>
            <p style="white-space: pre-line">${data.client.address}</p>
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
            <p><span class="highlight">payment terms:</span> Net 30 days from invoice date</p>
            <p><span class="highlight">payment link:</span> ${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${data.invoiceNumber.toLowerCase()}</p>
          </div>

          <div class="footer">
            thank you for your business!
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const { signature } = await request.json();

    // Get the document from database
    const document = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      include: { 
        Client: true,
      }
    });

    if (!document) {
      return NextResponse.json({ 
        success: false, 
        error: 'Document not found' 
      }, { status: 404 });
    }

    // Check if document can be signed
    if (document.status === 'DRAFT') {
      return NextResponse.json({ 
        success: false, 
        error: 'Document not available for signing' 
      }, { status: 403 });
    }

    if (document.status === 'ACKNOWLEDGED') {
      return NextResponse.json({ 
        success: false, 
        error: 'Document has already been signed' 
      }, { status: 409 });
    }

    if (!signature) {
      return NextResponse.json({ 
        success: false, 
        error: 'Signature is required' 
      }, { status: 400 });
    }

    // Update document status to ACKNOWLEDGED (signed) and save signature
    const updatedDocument = await prisma.legalDocument.update({
      where: { id: documentId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        clientSignature: signature,
      },
      include: {
        Client: true,
      }
    });

    // Send confirmation emails to both client and admin
    const pdfDownloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/legal/public/${documentId}/pdf`;
    
    try {
      // Email to client
      const clientEmailResult = await resend.emails.send({
        from: process.env.CONTACT_EMAIL!,
        to: updatedDocument.Client!.email,
        subject: `Document Signed Successfully - ${updatedDocument.documentNumber}`,
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
                .header {
                  text-align: center;
                  margin-bottom: 40px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 20px;
                }
                .success {
                  background-color: #d4edda;
                  border: 1px solid #c3e6cb;
                  color: #155724;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 20px 0;
                }
                .button {
                  display: inline-block;
                  background-color: #28a745;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 4px;
                  font-weight: 500;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
                  <p>Professional Services</p>
                </div>
                
                <div class="success">
                  <h2>✓ Service Agreement Signed Successfully</h2>
                </div>
                
                <p>Dear ${updatedDocument.Client!.name},</p>
                
                <p>Thank you for signing the service agreement. Your digital signature has been recorded and the agreement is now legally binding.</p>
                
                <p><strong>Document Details:</strong></p>
                <ul>
                  <li><strong>Document:</strong> ${updatedDocument.title}</li>
                  <li><strong>Document Number:</strong> ${updatedDocument.documentNumber}</li>
                  <li><strong>Signed On:</strong> ${new Date(updatedDocument.acknowledgedAt!).toLocaleString('en-GB')}</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${pdfDownloadUrl}" class="button">Download Signed Agreement</a>
                </div>
                
                <p>Please keep this signed agreement for your records. We look forward to working with you.</p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
              </div>
            </body>
          </html>
        `,
      });

      // Email to admin
      const adminEmailResult = await resend.emails.send({
        from: process.env.CONTACT_EMAIL!,
        to: process.env.CONTACT_EMAIL!,
        subject: `Service Agreement Signed - ${updatedDocument.documentNumber}`,
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
                .alert {
                  background-color: #d1ecf1;
                  border: 1px solid #bee5eb;
                  color: #0c5460;
                  padding: 15px;
                  border-radius: 4px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Service Agreement Signed</h1>
                
                <div class="alert">
                  <strong>Document Signed:</strong> ${updatedDocument.documentNumber}
                </div>
                
                <p><strong>Client Details:</strong></p>
                <ul>
                  <li><strong>Name:</strong> ${updatedDocument.Client!.name}</li>
                  <li><strong>Email:</strong> ${updatedDocument.Client!.email}</li>
                  <li><strong>Signed On:</strong> ${new Date(updatedDocument.acknowledgedAt!).toLocaleString('en-GB')}</li>
                </ul>
                
                <p><strong>Document:</strong> ${updatedDocument.title}</p>
                
                <p>The client has successfully signed the service agreement using the digital signature feature.</p>
                
                <p><a href="${pdfDownloadUrl}">Download Signed Agreement</a></p>
              </div>
            </body>
          </html>
        `,
      });

      console.log(`Confirmation emails sent for document ${updatedDocument.documentNumber}`);
      console.log(`Client email: ${clientEmailResult.data?.id}`);
      console.log(`Admin email: ${adminEmailResult.data?.id}`);

    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      // Don't fail the signing process if emails fail
    }

    // Send invoice after legal document is signed (with delay for rate limits)
    setTimeout(async () => {
      try {
        // Find the most recent invoice for this client
        const invoice = await prisma.invoice.findFirst({
          where: { 
            clientId: updatedDocument.Client!.id,
            status: 'UNPAID'
          },
          orderBy: { createdAt: 'desc' },
          include: { 
            items: true,
            Client: true 
          }
        });

        if (invoice) {
          console.log(`Sending invoice ${invoice.invoiceNumber} after document signing...`);
          
          try {
            // Prepare invoice data for PDF and email generation
            const invoiceData = {
              invoiceNumber: invoice.invoiceNumber,
              date: invoice.date.toISOString().split('T')[0],
              dueDate: invoice.dueDate.toISOString().split('T')[0],
              client: {
                name: invoice.Client!.name,
                email: invoice.Client!.email,
                address: invoice.Client!.address
              },
              items: invoice.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                price: item.price
              })),
              notes: invoice.notes || `Invoice for service agreement ${updatedDocument.documentNumber}`
            };

            // Generate PDF
            const invoiceForPdf = {
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              date: invoice.date,
              dueDate: invoice.dueDate,
              clientName: invoice.Client!.name,
              clientEmail: invoice.Client!.email,
              clientAddress: invoice.Client!.address,
              clientId: invoice.Client!.id,
              notes: invoiceData.notes,
              total: invoice.total,
              amountPaid: invoice.amountPaid,
              status: invoice.status as 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE',
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt,
              lastReminder: invoice.lastReminder,
              reminderCount: invoice.reminderCount,
              paidDate: invoice.paidDate,
              paymentMethod: invoice.paymentMethod,
              paymentReference: invoice.paymentReference,
              items: invoice.items
            };

            const pdfBuffer = await generateInvoicePDF(invoiceForPdf);
            const emailHtml = generateInvoiceHTML(invoiceData);

            // Send email with invoice PDF
            const { error: emailError } = await resend.emails.send({
              from: process.env.CONTACT_EMAIL!,
              to: invoice.Client!.email,
              subject: `invoice ${invoice.invoiceNumber}`,
              cc: process.env.CONTACT_EMAIL!,
              html: emailHtml,
              attachments: [
                {
                  filename: `invoice-${invoice.invoiceNumber.toLowerCase()}.pdf`,
                  content: Buffer.from(pdfBuffer).toString('base64'),
                },
              ],
            });

            if (emailError) {
              console.error(`Error sending invoice ${invoice.invoiceNumber}:`, emailError);
            } else {
              console.log(`Invoice ${invoice.invoiceNumber} sent successfully after document signing`);
            }

          } catch (error) {
            console.error(`Failed to send invoice ${invoice.invoiceNumber}:`, error);
          }
        } else {
          console.log('No unpaid invoice found for client after document signing');
        }
      } catch (error) {
        console.error('Error sending invoice after document signing:', error);
      }
    }, 3000); // Wait 3 seconds after confirmation emails

    return NextResponse.json({ 
      success: true,
      message: 'Document signed successfully',
      document: {
        id: updatedDocument.id,
        documentNumber: updatedDocument.documentNumber,
        title: updatedDocument.title,
        status: updatedDocument.status,
        acknowledgedAt: updatedDocument.acknowledgedAt?.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to sign document' 
    }, { status: 500 });
  }
} 