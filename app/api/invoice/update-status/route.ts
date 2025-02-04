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

    const { invoiceId, status } = await request.json();

    // Update invoice status
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return new NextResponse('Error updating invoice status', { status: 500 });
  }
} 