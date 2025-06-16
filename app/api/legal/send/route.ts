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

    // Get the base URL from environment variable or construct from request headers
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // Try to get the origin from headers first (more reliable in serverless)
      const origin = request.headers.get('origin') || request.headers.get('referer');
      
      if (origin) {
        // Extract base URL from origin/referer
        const originUrl = new URL(origin);
        baseUrl = `${originUrl.protocol}//${originUrl.host}`;
      } else {
        // Fallback to constructing from request URL
        const url = new URL(request.url);
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : url.protocol;
        baseUrl = `${protocol}//${url.host}`;
      }
    }

    const signingUrl = `${baseUrl}/sign/${documentId}`;
    
    // Debug logging
    console.log('Base URL:', baseUrl);
    console.log('Signing URL:', signingUrl);
    console.log('NEXT_PUBLIC_BASE_URL env var:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('Request URL:', request.url);

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
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a; line-height: 1.5; margin: 0; padding: 0; background-color: #f9f9f9;">
              <div style="max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #eaeaea;">
                <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                  <h1 style="margin: 0; color: #1a1a1a;">${process.env.NEXT_PUBLIC_ACCOUNT_NAME}</h1>
                  <p style="margin: 10px 0 0 0; color: #666;">Professional Services</p>
                </div>
                
                <h2 style="color: #1a1a1a; margin-bottom: 20px;">Service Agreement Ready for Your Signature</h2>
                
                <p style="margin-bottom: 16px;">Dear ${document.Client.name},</p>
                
                <p style="margin-bottom: 16px;">Your service agreement is ready for digital signature. Please review the document and sign it electronically using the button below.</p>
                
                <p style="margin-bottom: 20px;"><strong>Document:</strong> ${document.title}<br>
                <strong>Document Number:</strong> ${document.documentNumber}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${signingUrl}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; border: none; cursor: pointer;">Review &amp; Sign Document</a>
                </div>
                
                <p style="margin-bottom: 10px;">This digital signature process is secure and legally binding. You'll be able to:</p>
                <ul style="margin-bottom: 20px; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Review the complete agreement</li>
                  <li style="margin-bottom: 8px;">Sign electronically with your mouse or finger</li>
                  <li style="margin-bottom: 0;">Download a signed copy for your records</li>
                </ul>
                
                <p style="margin-bottom: 20px;">If you have any questions about this agreement, please don't hesitate to contact us.</p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
                  <p style="margin-bottom: 10px;"><strong>Direct Link:</strong> <a href="${signingUrl}" style="color: #007bff; text-decoration: none;">${signingUrl}</a></p>
                  <p style="margin: 0; font-style: italic;">This link is unique to your document and should not be shared.</p>
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