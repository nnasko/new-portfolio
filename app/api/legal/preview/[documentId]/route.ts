import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { generateServiceAgreementPDF } from '@/lib/legal-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { documentId } = await params;

    // Get the actual document from database
    const document = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      include: { 
        Client: true,
      }
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateServiceAgreementPDF({
      id: document.id,
      documentNumber: document.documentNumber,
      title: document.title,
      content: document.content,
      clientSignature: document.clientSignature || undefined,
      Client: document.Client || undefined
    });

    // Check if download is requested
    const url = new URL(request.url);
    const isDownload = url.searchParams.get('download') === 'true';

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isDownload 
          ? `attachment; filename="service-agreement-${document.documentNumber}.pdf"`
          : 'inline; filename="preview.pdf"',
      },
    });

  } catch (error) {
    console.error('Error previewing service agreement:', error);
    return new NextResponse('Error generating preview', { status: 500 });
  }
} 