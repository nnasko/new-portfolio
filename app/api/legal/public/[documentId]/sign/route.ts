import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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