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

    const { invoiceId } = await request.json();

    // Get invoice details with items
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true }
    });

    if (!invoice) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send reminder email
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.CONTACT_EMAIL!,
      to: invoice.clientEmail,
      subject: `reminder: invoice ${invoice.invoiceNumber} payment due`,
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
              <p>hello ${invoice.clientName.toLowerCase()},</p>
              <p>this is a friendly reminder regarding invoice <span class="highlight">${invoice.invoiceNumber.toLowerCase()}</span> which is currently pending payment.</p>
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
      console.error('Error sending reminder:', error);
      return new NextResponse('Error sending reminder', { status: 500 });
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
      message: 'Reminder sent successfully',
      data: emailData,
    });

  } catch (error) {
    console.error('Error sending reminder:', error);
    return new NextResponse('Error sending reminder', { status: 500 });
  }
} 