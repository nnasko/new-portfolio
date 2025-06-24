import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { invoiceId, status, amountPaid } = await request.json();

    if (!invoiceId || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Prepare update data with legacy support
    const updateData: {
      status: string;
      amountPaid?: number;
    } = { status };
    
    // Only include amountPaid if it's provided and the field exists in schema
    if (typeof amountPaid === 'number') {
      try {
        // Try to update with amountPaid (new schema)
        updateData.amountPaid = amountPaid;
        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: updateData as unknown as Parameters<typeof prisma.invoice.update>[0]['data'],
          include: { Client: true }
        });

        return NextResponse.json({ 
          success: true, 
          invoice: updatedInvoice 
        });
      } catch (error) {
        console.error('Error updating invoice status:', error);
        delete updateData.amountPaid;
        const updatedInvoice = await prisma.invoice.update({
          where: { id: invoiceId },
          data: updateData as unknown as Parameters<typeof prisma.invoice.update>[0]['data'],
          include: { Client: true }
        });

        return NextResponse.json({ 
          success: true, 
          invoice: updatedInvoice,
          warning: 'amountPaid field not supported in current schema'
        });
      }
    } else {
      // Update without amountPaid
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: updateData as unknown as Parameters<typeof prisma.invoice.update>[0]['data'],
        include: { Client: true }
      });

      return NextResponse.json({ 
        success: true, 
        invoice: updatedInvoice 
      });
    }

  } catch (error) {
    console.error('Error updating invoice status:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update invoice status' 
    }, { status: 500 });
  }
} 