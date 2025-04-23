import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Type for route parameters
// interface RouteParams {
//   params: { 
//     invoiceId: string;
//   }
// }

// Using DELETE verb
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await params;

    if (!invoiceId) {
        return NextResponse.json({ success: false, error: 'Invoice ID is required in URL' }, { status: 400 });
    }

    // Attempt to delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    // Handle specific Prisma error for record not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }
    // Generic error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ success: false, error: `Failed to delete invoice: ${errorMessage}` }, { status: 500 });
  } finally {
      // Disconnect Prisma client if necessary, depending on your setup
      // await prisma.$disconnect(); 
  }
} 