import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json({ success: false, error: 'Document ID is required in URL' }, { status: 400 });
    }

    // Attempt to delete the legal document
    await prisma.legalDocument.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true, message: 'Legal document deleted successfully' });

  } catch (error) {
    console.error('Error deleting legal document:', error);
    // Handle specific Prisma error for record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Legal document not found' }, { status: 404 });
    }
    // Generic error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to delete legal document: ${errorMessage}` }, { status: 500 });
  }
} 