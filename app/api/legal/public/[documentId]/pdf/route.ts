import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateServiceAgreementPDF } from '@/lib/legal-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // Get the document from database (no auth required)
    const document = await prisma.legalDocument.findUnique({
      where: { id: documentId },
      include: { 
        Client: true,
      }
    });

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Only allow access to documents that have been sent
    if (document.status === 'DRAFT') {
      return new NextResponse('Document not available', { status: 403 });
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

    // Return PDF for download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="service-agreement-${document.documentNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating public PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
} 