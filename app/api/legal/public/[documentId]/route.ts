import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    // Get the document from database (no auth required for public signing)
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

    // Only allow access to documents that have been sent
    if (document.status === 'DRAFT') {
      return NextResponse.json({ 
        success: false, 
        error: 'Document not available for signing' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true,
      document: {
        id: document.id,
        documentNumber: document.documentNumber,
        title: document.title,
        content: document.content,
        status: document.status,
        Client: document.Client,
        createdAt: document.createdAt.toISOString(),
        sentAt: document.sentAt?.toISOString(),
        acknowledgedAt: document.acknowledgedAt?.toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching public document:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch document' 
    }, { status: 500 });
  }
} 