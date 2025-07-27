import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Types for better type safety
interface ClientData {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface InquiryData {
  id: string;
  finalPrice: number;
  projectType: string;
  projectGoal: string;
  targetAudience: string | null;
  timeline: string;
}

interface ServiceAgreementData {
  id: string;
  documentNumber: string;
  title: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
}

// Function to send legal document email
async function sendLegalDocumentEmail(documentId: string) {
  // Get the document from database
  const document = await prisma.legalDocument.findUnique({
    where: { id: documentId },
    include: { Client: true }
  });

  if (!document || !document.Client) {
    throw new Error('Document or client not found');
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const signingUrl = `${baseUrl}/sign/${documentId}`;

  // Send email to client with signing link
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: process.env.CONTACT_EMAIL!,
    to: document.Client.email,
    subject: `Service Agreement Ready for Digital Signature - ${document.documentNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 0; background-color: #fafafa;">
          <div style="max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #e5e5e5;">
            <div style="text-align: left; margin-bottom: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 16px;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 400;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
              <p style="margin: 6px 0 0 0; color: #6b7280; font-size: 13px;">Professional Services</p>
            </div>
            
            <h2 style="color: #1a1a1a; margin-bottom: 16px; font-size: 18px; font-weight: 500;">Service Agreement Ready for Your Signature</h2>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Dear ${document.Client.name},</p>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Your service agreement is ready for digital signature. Please review the document and sign it electronically using the button below.</p>
            
            <div style="margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5;">
              <p style="margin-bottom: 8px; font-size: 14px;"><strong style="color: #1a1a1a;">Document:</strong> <span style="color: #6b7280;">${document.title}</span></p>
              <p style="margin: 0; font-size: 14px;"><strong style="color: #1a1a1a;">Document Number:</strong> <span style="color: #6b7280;">${document.documentNumber}</span></p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${signingUrl}" style="display: inline-block; background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 0; font-weight: 500; font-size: 14px;">Review & Sign Document</a>
            </div>
            
            <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">
              This document requires your electronic signature to proceed with the project. If you have any questions, please don't hesitate to reach out.
            </p>
            
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Best regards,<br>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (emailError) {
    throw new Error(`Failed to send legal document email: ${emailError.message}`);
  }

  // Update document status to SENT
  await prisma.legalDocument.update({
    where: { id: documentId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
  });

  return emailData;
}

// Function to send invoice email
async function sendInvoiceEmail(invoiceId: string) {
  // This would typically trigger the invoice generation and sending
  // For now, we'll create a simple notification email since the invoice 
  // generation route handles the full PDF creation and sending
  
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { Client: true, items: true }
  });

  if (!invoice || !invoice.Client) {
    throw new Error('Invoice or client not found');
  }

  // Send simple notification - the actual invoice will be sent when payment is due
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: process.env.CONTACT_EMAIL!,
    to: invoice.Client.email,
    subject: `Project Invoice Created - ${invoice.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 0; background-color: #fafafa;">
          <div style="max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #e5e5e5;">
            <div style="text-align: left; margin-bottom: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 16px;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 400;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
              <p style="margin: 6px 0 0 0; color: #6b7280; font-size: 13px;">Professional Services</p>
            </div>
            
            <h2 style="color: #1a1a1a; margin-bottom: 16px; font-size: 18px; font-weight: 500;">Project Invoice Created</h2>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Dear ${invoice.Client.name},</p>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Your project invoice has been created and will be sent once the service agreement is signed.</p>
            
            <div style="margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5;">
              <p style="margin-bottom: 8px; font-size: 14px;"><strong style="color: #1a1a1a;">Invoice Number:</strong> <span style="color: #6b7280;">${invoice.invoiceNumber}</span></p>
              <p style="margin-bottom: 8px; font-size: 14px;"><strong style="color: #1a1a1a;">Total Amount:</strong> <span style="color: #6b7280;">£${invoice.total.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span></p>
              <p style="margin: 0; font-size: 14px;"><strong style="color: #1a1a1a;">Due Date:</strong> <span style="color: #6b7280;">${invoice.dueDate.toLocaleDateString('en-GB')}</span></p>
            </div>
            
            <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">
              The detailed invoice with payment instructions will be sent after you sign the service agreement. No payment is required until you receive the full invoice.
            </p>
            
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Best regards,<br>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (emailError) {
    throw new Error(`Failed to send invoice notification email: ${emailError.message}`);
  }

  return emailData;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inquiryId = searchParams.get('id');
    const token = searchParams.get('token');

    if (!inquiryId || !token) {
      return new Response('Missing inquiry ID or token', { status: 400 });
    }

    // Verify token - await the async function
    const expectedToken = await generateQuoteToken(inquiryId);
    if (token !== expectedToken) {
      return new Response('Invalid token', { status: 403 });
    }

    // Fetch inquiry
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId }
    });

    if (!inquiry) {
      return new Response('Inquiry not found', { status: 404 });
    }

    if (inquiry.status !== 'QUOTED') {
      return new Response('Inquiry has not been quoted yet', { status: 400 });
    }

    if (!inquiry.convertedToClientId) {
      return new Response('No client record found for this inquiry', { status: 400 });
    }

    // Check if finalPrice is null
    if (inquiry.finalPrice === null) {
      return new Response('No final price set for this inquiry', { status: 400 });
    }

    // Fetch client separately
    const clientRecord = await prisma.client.findUnique({
      where: { id: inquiry.convertedToClientId }
    });

    if (!clientRecord) {
      return new Response('Client not found', { status: 404 });
    }

    // Create type-safe objects after validation
    const typedInquiry: InquiryData = {
      id: inquiry.id,
      finalPrice: inquiry.finalPrice, // Now guaranteed to be non-null
      projectType: inquiry.projectType,
      projectGoal: inquiry.projectGoal,
      targetAudience: inquiry.targetAudience,
      timeline: inquiry.timeline
    };

    const typedClient: ClientData = {
      id: clientRecord.id,
      name: clientRecord.name,
      email: clientRecord.email,
      address: clientRecord.address
    };

    // Update inquiry status to ACCEPTED
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: 'ACCEPTED'
      }
    });

    // Create service agreement
    const serviceAgreement = await createServiceAgreement(typedInquiry, typedClient);
    
    // Create invoice
    const invoice = await createProjectInvoice(typedInquiry, typedClient);

    // Send confirmation email to client
    await sendAcceptanceConfirmationEmail(typedClient, typedInquiry, serviceAgreement, invoice);

    // Send legal document and invoice emails with delays (Resend rate limit: 2 emails/second)
    setTimeout(async () => {
      try {
        // Send legal document email
        await sendLegalDocumentEmail(serviceAgreement.id);
        console.log(`Legal document email sent for ${serviceAgreement.documentNumber}`);
        
        // Wait 3 seconds before sending invoice email (to be safe with rate limits)
        setTimeout(async () => {
          try {
            await sendInvoiceEmail(invoice.id);
            console.log(`Invoice email sent for ${invoice.invoiceNumber}`);
          } catch (error) {
            console.error('Error sending invoice email:', error);
          }
        }, 3000);
        
      } catch (error) {
        console.error('Error sending legal document email:', error);
      }
    }, 3000); // Wait 3 seconds after confirmation email

    // Return success page HTML
    return new Response(generateAcceptancePageHTML(typedClient, typedInquiry), {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error accepting quote:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

// Generate token for quote acceptance
async function generateQuoteToken(inquiryId: string): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
  const crypto = await import('crypto');
  return crypto.createHmac('sha256', secret).update(inquiryId).digest('hex').substring(0, 16);
}

// Create service agreement automatically
async function createServiceAgreement(inquiry: InquiryData, client: ClientData) {
  const documentNumber = await generateUniqueDocumentNumber();
  
  const serviceAgreement = await prisma.legalDocument.create({
    data: {
      documentNumber,
      title: `Service Agreement - ${inquiry.projectType} Website`,
      content: generateServiceAgreementContent(client, inquiry),
      status: 'DRAFT',
      clientId: client.id,
      documentType: 'SERVICE_AGREEMENT'
    }
  });

  return serviceAgreement;
}

// Create project invoice automatically  
async function createProjectInvoice(inquiry: InquiryData, client: ClientData) {
  const invoiceNumber = await generateUniqueInvoiceNumber();
  const finalPrice = inquiry.finalPrice / 100; // Convert from pence to pounds
  
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: client.id,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      total: finalPrice,
      status: 'UNPAID',
      notes: `Project: ${inquiry.projectType} website development`,
      items: {
        create: [
          {
            description: `${inquiry.projectType} Website Development - ${inquiry.projectGoal}`,
            quantity: 1,
            price: finalPrice
          }
        ]
      }
    }
  });

  return invoice;
}

// Generate unique document number
async function generateUniqueDocumentNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `SA-${currentYear}-`;
  
  const lastDocument = await prisma.legalDocument.findFirst({
    where: {
      documentNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastDocument) {
    const lastNumber = parseInt(lastDocument.documentNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

// Generate unique invoice number
async function generateUniqueInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

// Generate service agreement content
function generateServiceAgreementContent(client: ClientData, inquiry: InquiryData): string {
  const currentDate = new Date().toLocaleDateString('en-GB');
  const finalPrice = (inquiry.finalPrice / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 });
  const depositAmount = (inquiry.finalPrice / 200).toLocaleString('en-GB', { minimumFractionDigits: 2 });
  const timelineText = inquiry.timeline === 'rush' ? '2-3 weeks' : inquiry.timeline === 'normal' ? '4-6 weeks' : '6-8 weeks';
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; max-width: 850px; margin: 0 auto; padding: 40px 20px;">
      
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px; color: #333; font-weight: 300; letter-spacing: -0.5px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
        <p style="margin: 10px 0 0 0; color: #666; font-size: 16px;">Professional Web Development Services</p>
      </div>

      <h2 style="text-align: center; margin: 30px 0; font-size: 24px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">FREELANCE WEB DEVELOPMENT SERVICE AGREEMENT</h2>
        
      <div style="margin: 30px 0; padding: 25px; background: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px;">
        <h3 style="margin: 0 0 20px 0; color: #495057; font-size: 18px; font-weight: 600;">PARTIES TO THIS AGREEMENT</h3>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #495057;">Date of Agreement:</span> ${currentDate}
        </div>
        <div style="margin-bottom: 15px;">
          <span style="font-weight: 600; color: #495057;">Client ("you"):</span><br>
          <div style="margin-left: 15px; margin-top: 5px;">
            <strong>${client.name}</strong><br>
            ${client.email}<br>
            ${client.address.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div>
          <span style="font-weight: 600; color: #495057;">Service Provider ("we/us"):</span><br>
          <div style="margin-left: 15px; margin-top: 5px;">
            <strong>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</strong><br>
            Freelance Web Development Services<br>
            United Kingdom
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">PROJECT DESCRIPTION</h3>
        <div style="padding: 20px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;"><strong>Project Type:</strong> ${inquiry.projectType} Website</p>
          <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;"><strong>Project Goal:</strong> ${inquiry.projectGoal}</p>
          <p style="margin: 0; font-size: 15px; line-height: 1.6;"><strong>Target Audience:</strong> ${inquiry.targetAudience || 'As discussed during consultation'}</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">1. SCOPE OF SERVICES</h3>
        <p style="margin-bottom: 15px; font-size: 15px;">We agree to provide professional web development services including, but not limited to:</p>
        <ul style="margin: 0; padding-left: 25px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px 25px; font-size: 14px; line-height: 1.6;">
          <li style="margin-bottom: 8px;">Website design and user interface development</li>
          <li style="margin-bottom: 8px;">Frontend and backend development as specified</li>
          <li style="margin-bottom: 8px;">Responsive design for mobile and desktop devices</li>
          <li style="margin-bottom: 8px;">Content management system implementation (where applicable)</li>
          <li style="margin-bottom: 8px;">Search engine optimisation (basic on-page SEO)</li>
          <li style="margin-bottom: 8px;">Cross-browser compatibility testing</li>
          <li style="margin-bottom: 8px;">Performance optimisation</li>
          <li style="margin-bottom: 8px;">Documentation and training materials</li>
          <li style="margin-bottom: 8px;">Post-launch support as specified in project scope</li>
          <li style="margin-bottom: 0;">Project management and regular progress updates</li>
        </ul>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">2. PROJECT VALUE & PAYMENT TERMS</h3>
        <div style="padding: 20px; background: #e7f3ff; border: 1px solid #b8daff; border-radius: 4px; margin-bottom: 15px;">
          <p style="margin: 0 0 10px 0; font-size: 18px;"><strong>Total Project Value:</strong> <span style="color: #007bff; font-weight: 600;">£${finalPrice}</span></p>
          <p style="margin: 0; font-size: 14px; color: #666;">Fixed price for complete project as specified</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">3. PAYMENT TERMS</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;"><strong>Deposit:</strong> 50% of total project value (£${depositAmount}) required before commencement of work</li>
            <li style="margin-bottom: 8px;"><strong>Final Payment:</strong> 50% balance (£${depositAmount}) due upon project completion and delivery</li>
            <li style="margin-bottom: 8px;"><strong>Payment Terms:</strong> Net 30 days from invoice date</li>
            <li style="margin-bottom: 8px;"><strong>Late Payment:</strong> Interest charges of 1.5% per month on overdue amounts</li>
            <li style="margin-bottom: 8px;"><strong>Currency:</strong> All payments in British Pounds (GBP)</li>
            <li style="margin-bottom: 0;"><strong>Methods:</strong> Bank transfer or online payment via secure payment link</li>
          </ul>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">4. PROJECT TIMELINE</h3>
        <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Estimated Timeline:</strong> ${timelineText}</p>
          <p style="margin: 0; font-size: 14px; color: #856404;">Timeline commences upon receipt of deposit payment and all required assets/content from client.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">5. INTELLECTUAL PROPERTY RIGHTS</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>Client Ownership:</strong> Upon full payment of all invoices, you will own all rights, title, and interest in the custom website, including source code, design elements, and content created specifically for your project.</p>
          <p style="margin: 0 0 15px 0;"><strong>Service Provider Rights:</strong> We retain rights to:</p>
          <ul style="margin: 0 0 15px 20px; padding-left: 15px;">
            <li style="margin-bottom: 5px;">General methodologies, frameworks, and development techniques</li>
            <li style="margin-bottom: 5px;">Pre-existing intellectual property and open-source components</li>
            <li style="margin-bottom: 0;">Portfolio rights to display completed work for marketing purposes</li>
          </ul>
          <p style="margin: 0;"><strong>Third-Party Components:</strong> Any third-party software, plugins, or components remain subject to their respective licenses.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">6. CLIENT RESPONSIBILITIES</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px;">
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
            <li style="margin-bottom: 8px;">Provide all required content, images, and materials in a timely manner</li>
            <li style="margin-bottom: 8px;">Respond to requests for feedback and approval within 5 business days</li>
            <li style="margin-bottom: 8px;">Ensure all provided content is legally owned and properly licensed</li>
            <li style="margin-bottom: 8px;">Provide access to hosting accounts, domain registrars, and third-party services as needed</li>
            <li style="margin-bottom: 0;">Test and review deliverables thoroughly before final approval</li>
          </ul>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">7. REVISIONS & ADDITIONAL WORK</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>Included Revisions:</strong> Up to 3 rounds of reasonable revisions are included in the project price.</p>
          <p style="margin: 0 0 15px 0;"><strong>Additional Work:</strong> Any work beyond the agreed scope will be quoted separately at our standard hourly rate of £30/hour.</p>
          <p style="margin: 0;"><strong>Major Changes:</strong> Significant scope changes may require a new project agreement and timeline adjustment.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">8. LIMITATION OF LIABILITY</h3>
        <div style="background: #fff8e1; border: 1px solid #ffcc02; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">Our liability is limited to the total amount paid under this agreement. We shall not be liable for any indirect, consequential, or incidental damages, including but not limited to loss of profits, data, or business opportunities.</p>
          <p style="margin: 0;"><strong>Website Availability:</strong> We do not guarantee uninterrupted website operation, as this depends on hosting, internet connectivity, and third-party services beyond our control.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">9. DATA PROTECTION & CONFIDENTIALITY</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>GDPR Compliance:</strong> We will process personal data in accordance with UK GDPR and Data Protection Act 2018.</p>
          <p style="margin: 0 0 15px 0;"><strong>Confidentiality:</strong> Both parties agree to keep confidential all proprietary information shared during this engagement.</p>
          <p style="margin: 0;"><strong>Data Security:</strong> We implement appropriate technical and organisational measures to protect your data.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">10. TERMINATION</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;"><strong>By Client:</strong> You may terminate this agreement with 7 days written notice. Payment is due for all work completed to date.</p>
          <p style="margin: 0 0 15px 0;"><strong>By Service Provider:</strong> We may terminate for non-payment or material breach with 30 days written notice.</p>
          <p style="margin: 0;"><strong>Upon Termination:</strong> All work completed will be delivered, and final invoices settled within 30 days.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">11. FORCE MAJEURE</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0;">Neither party shall be liable for delays or failure to perform due to causes beyond reasonable control, including but not limited to acts of God, government actions, pandemics, natural disasters, or technical failures of third-party services.</p>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">12. GOVERNING LAW & JURISDICTION</h3>
        <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">This agreement is governed by the laws of England and Wales.</p>
          <p style="margin: 0;">Any disputes shall be subject to the exclusive jurisdiction of the English courts. Both parties agree to attempt resolution through mediation before pursuing litigation.</p>
        </div>
      </div>

      <div style="margin: 40px 0;">
        <h3 style="color: #495057; font-size: 18px; font-weight: 600; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #dee2e6;">DIGITAL SIGNATURE & AGREEMENT</h3>
        <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 4px; padding: 20px; font-size: 14px; line-height: 1.6;">
          <p style="margin: 0 0 15px 0;">This agreement may be executed electronically. Digital signatures are legally binding and equivalent to handwritten signatures under the Electronic Communications Act 2000.</p>
          <p style="margin: 0;"><strong>By signing below, both parties acknowledge they have read, understood, and agree to be bound by all terms and conditions of this agreement.</strong></p>
        </div>
      </div>

      <div style="margin-top: 50px; padding: 30px; background: #f8f9fa; border: 2px solid #dee2e6; border-radius: 8px; page-break-inside: avoid;">
        <h4 style="margin: 0 0 30px 0; font-weight: 600; text-align: center; font-size: 16px; color: #495057;">SIGNATURE SECTION</h4>
          
        <div style="display: flex; justify-content: space-between; gap: 40px; margin-top: 30px;">
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff;"></div>
            <div style="text-align: center;">
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${client.name}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Client Signature</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: _____________</p>
            </div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="border-bottom: 2px solid #333; height: 50px; margin-bottom: 15px; background: #ffffff;"></div>
            <div style="text-align: center;">
              <p style="margin: 0; font-weight: 600; font-size: 14px;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Service Provider</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Date: ${currentDate}</p>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #dee2e6; padding-top: 20px;">
        <p style="margin: 0;">This agreement consists of 12 sections and constitutes the entire agreement between the parties.</p>
      </div>
    </div>
  `;
}

// Send acceptance confirmation email
async function sendAcceptanceConfirmationEmail(
  client: ClientData, 
  inquiry: InquiryData, 
  serviceAgreement: ServiceAgreementData, 
  invoice: InvoiceData
) {
  const finalPrice = (inquiry.finalPrice / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 });
  
  await resend.emails.send({
    from: process.env.CONTACT_EMAIL!,
    to: client.email,
    subject: 'Quote Accepted - Next Steps for Your Project',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 0; background-color: #fafafa;">
          <div style="max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #e5e5e5;">
            <div style="text-align: left; margin-bottom: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 16px;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 20px; font-weight: 400;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
              <p style="margin: 6px 0 0 0; color: #6b7280; font-size: 13px;">Professional Services</p>
            </div>
            
            <h2 style="color: #1a1a1a; margin-bottom: 16px; font-size: 18px; font-weight: 500;">Quote Accepted</h2>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Dear ${client.name},</p>
            
            <div style="margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 14px; color: #1a1a1a;">Quote accepted for £${finalPrice}</p>
            </div>
            
            <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Thank you for accepting our quote. I'm excited to work on your ${inquiry.projectType} website project.</p>
            
            <div style="margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5;">
              <h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">Documents Created</h4>
              <p style="margin-bottom: 8px; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Service Agreement:</strong> ${serviceAgreement.documentNumber}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong style="color: #1a1a1a;">Project Invoice:</strong> ${invoice.invoiceNumber}</p>
            </div>
            
            <div style="margin: 20px 0; padding: 16px; background: #fafafa; border: 1px solid #e5e5e5;">
              <h4 style="margin: 0 0 12px 0; color: #1a1a1a; font-size: 15px; font-weight: 500;">What happens next?</h4>
              <ol style="margin: 0; padding-left: 16px; color: #6b7280; font-size: 14px;">
                <li>You'll receive a service agreement for digital signature</li>
                <li>Once signed, you'll receive the project invoice</li>
                <li>Project begins after 50% deposit payment</li>
                <li>I'll be in touch within 24 hours to discuss timeline and requirements</li>
              </ol>
            </div>
            
            <p style="color: #6b7280; font-size: 13px; margin: 24px 0 0 0;">If you have any questions in the meantime, please don't hesitate to reach out.</p>
            
            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Best regards,<br>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

// Generate acceptance confirmation page HTML
function generateAcceptancePageHTML(client: ClientData, inquiry: InquiryData): string {
  const finalPrice = (inquiry.finalPrice / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 });
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote Accepted - ${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1a1a1a;
            line-height: 1.6;
            background: #fafafa;
            min-height: 100vh;
            padding: 20px;
          }
          
          .container {
            max-width: 600px;
            width: 100%;
            margin: 40px auto;
          }
          
          .card {
            background: #ffffff;
            border: 1px solid #e5e5e5;
            box-shadow: none;
            overflow: hidden;
            text-align: center;
          }
          
          .header {
            background: #ffffff;
            color: #1a1a1a;
            padding: 40px 32px 32px;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .checkmark {
            width: 60px;
            height: 60px;
            background: #1a1a1a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            font-size: 24px;
            color: white;
            box-shadow: none;
          }
          
          .content {
            padding: 32px;
          }
          
          .success-badge {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            color: #1a1a1a;
            padding: 16px 20px;
            border-radius: 0;
            margin: 24px 0;
            font-weight: 500;
            font-size: 15px;
          }
          
          .project-info {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 0;
            padding: 20px;
            margin: 24px 0;
            text-align: left;
          }
          
          .next-steps {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 0;
            padding: 24px;
            margin: 24px 0;
            text-align: left;
          }
          
          .next-steps h3 {
            color: #1a1a1a;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .next-steps ol {
            list-style: decimal;
            padding-left: 20px;
          }
          
          .next-steps li {
            margin-bottom: 8px;
            color: #6b7280;
            font-weight: 400;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .contact-info {
            background: #fafafa;
            border-radius: 0;
            padding: 16px;
            margin-top: 24px;
            border: 1px solid #e5e5e5;
          }
          
          h1 {
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          
          .subtitle {
            opacity: 0.7;
            font-size: 14px;
            margin-bottom: 0;
            font-weight: 300;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="checkmark">✓</div>
              <h1>Quote Accepted</h1>
              <p class="subtitle">Thank you, ${client.name}</p>
            </div>
            
            <div class="content">
              <div class="success-badge">
                Your quote for £${finalPrice} has been accepted
              </div>
              
              <div class="project-info">
                <h3 style="color: #1a1a1a; margin-bottom: 12px; font-size: 15px; font-weight: 500;">Project Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; color: #6b7280; font-size: 14px;">
                  <div>
                    <strong style="color: #1a1a1a;">Project Type:</strong><br>
                    ${inquiry.projectType} Website
                  </div>
                  <div>
                    <strong style="color: #1a1a1a;">Total Investment:</strong><br>
                    £${finalPrice}
                  </div>
                </div>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin: 24px 0;">
                Thank you for accepting our quote. I'm excited to work on your ${inquiry.projectType} website project. Your professional website journey starts now.
              </p>
              
              <div class="next-steps">
                <h3>What happens next?</h3>
                <ol>
                  <li>Check your email for a service agreement to digitally sign</li>
                  <li>You'll receive a project invoice once the agreement is signed</li>
                  <li>Project begins after 50% deposit payment (£${(parseFloat(finalPrice.replace(/,/g, '')) / 2).toLocaleString('en-GB', { minimumFractionDigits: 2 })})</li>
                  <li>I'll contact you within 24 hours to discuss timeline and requirements</li>
                </ol>
              </div>
              
              <div class="contact-info">
                <p style="color: #6b7280; font-size: 13px; margin-bottom: 6px;">
                  A confirmation email has been sent to <strong style="color: #1a1a1a;">${client.email}</strong>
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  If you don't see it, please check your spam folder or contact me directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
} 