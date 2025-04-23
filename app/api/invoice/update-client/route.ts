import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

interface UpdateClientRequestBody {
  invoiceId: string;
  clientId: string | null; // Allow setting to null to unassign
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body: UpdateClientRequestBody = await request.json();
    const { invoiceId, clientId } = body;

    if (!invoiceId) {
        return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    // Validate that the client exists if clientId is not null
    if (clientId) {
        const clientExists = await prisma.client.findUnique({
            where: { id: clientId },
            select: { id: true } // Only select id for efficiency
        });
        if (!clientExists) {
            return NextResponse.json({ error: `Client with ID ${clientId} not found` }, { status: 404 });
        }
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: clientId, // Set or unset the clientId
      },
      include: {
        Client: true, // Include updated client info in the response
      }
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });

  } catch (error) {
    console.error('Error updating invoice client:', error);
    // Handle specific errors like invoice not found (P2025)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update invoice client' }, { status: 500 });
  }
} 