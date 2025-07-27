import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params;

    // Find the invoice with client and items
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: invoiceNumber.toUpperCase() },
      include: { 
        Client: true,
        items: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invoice not found' 
      }, { status: 404 });
    }

    // Return invoice data (safe for public viewing)
    return NextResponse.json({ 
      success: true,
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        status: invoice.status,
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        notes: invoice.notes,
        paidDate: invoice.paidDate?.toISOString() || null,
        paymentMethod: invoice.paymentMethod,
        client: {
          name: invoice.Client?.name,
          email: invoice.Client?.email,
          address: invoice.Client?.address
        },
        items: invoice.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch invoice' 
    }, { status: 500 });
  }
} 