import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateInvoicePDF } from '@/lib/pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { invoiceId, selectedEmails } = await request.json();

    // Get invoice details, including Client and items
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        items: true, 
        Client: true // Include client data
      }
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    // Ensure client data is present
    if (!invoice.Client) {
       console.error(`Invoice ${invoiceId} is missing client data. Cannot send reminder.`);
       return NextResponse.json({ success: false, error: 'Invoice is missing client data' }, { status: 400 });
    }

    // Determine which emails to send to - handle both old and new schema
    let recipientEmails: string[] = [];
    
    if (selectedEmails && Array.isArray(selectedEmails) && selectedEmails.length > 0) {
      // Use selected emails if provided
      recipientEmails = selectedEmails;
    } else {
      // Handle both new schema (emails array) and old schema (single email)
      const clientData = invoice.Client as {
        emails?: string[];
        email?: string;
      };
      if (clientData.emails && Array.isArray(clientData.emails)) {
        // New schema with emails array
        recipientEmails = clientData.emails;
      } else if (clientData.email) {
        // Old schema with single email field
        recipientEmails = [clientData.email];
      }
    }

    if (recipientEmails.length === 0) {
      return NextResponse.json({ success: false, error: 'No email addresses found for client' }, { status: 400 });
    }

    // --- Prepare data for PDF generation --- 
    // (Similar to generate/route.ts, create the object generateInvoicePDF expects)
    const clientData = invoice.Client as {
      emails?: string[];
      email?: string;
      name: string;
      address: string;
      id: string;
    };
    const invoiceData = invoice as {
      amountPaid?: number;
      total: number;
    };
    
    const invoiceForPdf = {
        // Fields directly from invoice record
        ...invoice, 
        // Add direct client fields expected by the current pdf function input type
        clientName: invoice.Client.name,
        clientEmail: clientData.emails?.[0] || clientData.email || '',
        clientAddress: invoice.Client.address,
        clientId: invoice.Client.id,
        // Ensure date types match if needed (assuming they are already Date objects here)
        date: invoice.date, 
        dueDate: invoice.dueDate, 
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
        // items are already included
    };
    // --- End Prepare data for PDF --- 

    // Generate PDF using the adapted data structure
    const pdfBuffer = await generateInvoicePDF(invoiceForPdf);

    // Handle amountPaid field - may not exist in current schema
    const amountPaid = invoiceData.amountPaid || 0;
    const remainingBalance = invoice.total - amountPaid;

    // Send reminder email using fetched client details
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL!,
      to: recipientEmails, // Send to multiple selected emails
      subject: `reminder: invoice ${invoice.invoiceNumber} payment due`,
      cc: process.env.CONTACT_EMAIL!, // Add CC back to self
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
              <p>hello ${invoice.Client.name.toLowerCase()},</p>
              <p>this is a friendly reminder regarding invoice <span class="highlight">${invoice.invoiceNumber.toLowerCase()}</span> which is currently pending payment.</p>
              <p><strong>invoice total:</strong> £${invoice.total.toFixed(2)}</p>
              ${amountPaid > 0 ? `<p><strong>amount paid:</strong> £${amountPaid.toFixed(2)}</p>
              <p><strong>remaining balance:</strong> £${remainingBalance.toFixed(2)}</p>` : ''}
              <p>i have attached a copy of the invoice for your reference.</p>
              <p>if you have already processed the payment, please disregard this message.</p>
              <p>if you have any questions or need assistance with the payment process, please don't hesitate to reach out.</p>
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
          filename: `invoice-${invoice.invoiceNumber.toLowerCase()}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    });

    if (error) {
      console.error('Error sending reminder email:', error);
      // Provide more context in the error response
      return NextResponse.json({ success: false, error: `Failed to send reminder email: ${error.message}` }, { status: 500 });
    }

    // Update reminder count and last reminder date
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        reminderCount: { increment: 1 },
        lastReminder: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Reminder sent successfully to ${recipientEmails.length} email address(es)`,
      sentTo: recipientEmails,
      data: emailData,
    });

  } catch (error) {
    console.error('Error in send-reminder route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
} 