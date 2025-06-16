import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { documentId } = await request.json();

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

    if (!document.Client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Document has no associated client' 
      }, { status: 400 });
    }

    const signingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sign/${documentId}`;

    // Send email to client with signing link
    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: process.env.CONTACT_EMAIL!,
        to: document.Client.email,
        subject: `Service Agreement Ready for Digital Signature - ${document.documentNumber}`,
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
                .button {
                  display: inline-block;
                  background-color: #007bff;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 4px;
                  font-weight: 500;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 1px solid #eaeaea;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
                  <p>Professional Services</p>
                </div>
                
                <h2>Service Agreement Ready for Your Signature</h2>
                
                <p>Dear ${document.Client.name},</p>
                
                <p>Your service agreement is ready for digital signature. Please review the document and sign it electronically using the link below.</p>
                
                <p><strong>Document:</strong> ${document.title}<br>
                <strong>Document Number:</strong> ${document.documentNumber}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signingUrl}" class="button">Review & Sign Document</a>
                </div>
                
                <p>This digital signature process is secure and legally binding. You'll be able to:</p>
                <ul>
                  <li>Review the complete agreement</li>
                  <li>Sign electronically with your mouse or finger</li>
                  <li>Download a signed copy for your records</li>
                </ul>
                
                <p>If you have any questions about this agreement, please don't hesitate to contact us.</p>
                
                <div class="footer">
                  <p><strong>Document Link:</strong> <a href="${signingUrl}">${signingUrl}</a></p>
                  <p>This link is unique to your document and should not be shared.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        return NextResponse.json({ 
          success: false, 
          error: `Failed to send email: ${emailError.message}` 
        }, { status: 500 });
      }

      // Update document status to SENT
      await prisma.legalDocument.update({
        where: { id: documentId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      console.log(`Document sent for signing: ${document.documentNumber}`);
      console.log(`Email sent to: ${document.Client.email}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Service agreement sent for signature',
        signingUrl, // Return the URL for testing
        emailId: emailData?.id,
      });

    } catch (emailError) {
      console.error('Error sending signing email:', emailError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send signing email' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in send service agreement route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
} 