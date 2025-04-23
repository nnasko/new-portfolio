import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all invoices and check for overdue ones
    const now = new Date();
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        Client: true,
      }
    });

    // Update overdue invoices
    const overdueInvoices = invoices.filter(invoice => 
      invoice.status === 'UNPAID' && 
      new Date(invoice.dueDate) < now
    );

    if (overdueInvoices.length > 0) {
      await prisma.invoice.updateMany({
        where: {
          id: {
            in: overdueInvoices.map(inv => inv.id)
          },
          status: 'UNPAID',
          dueDate: {
            lt: now
          }
        },
        data: {
          status: 'OVERDUE'
        }
      });

      // Update the status in our local array for accurate stats
      invoices.forEach(invoice => {
        if (overdueInvoices.find(oi => oi.id === invoice.id)) {
          invoice.status = 'OVERDUE';
        }
      });
    }

    // Calculate stats
    const stats = {
      totalInvoiced: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPaid: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0),
      totalUnpaid: invoices.filter(inv => inv.status === 'UNPAID').reduce((sum, inv) => sum + inv.total, 0),
      totalOverdue: invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.total, 0),
      invoiceCount: invoices.length,
      paidCount: invoices.filter(inv => inv.status === 'PAID').length,
      overdueCount: invoices.filter(inv => inv.status === 'OVERDUE').length,
    };

    return NextResponse.json({ invoices, stats });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse('Error fetching invoices', { status: 500 });
  }
} 