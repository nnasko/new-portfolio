import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { Invoice: true },
        },
        Invoice: {
          select: {
            total: true,
          }
        }
      }
    });

    const clientsWithStats = clients.map(client => {
      const totalInvoiced = client.Invoice.reduce((sum: number, inv) => sum + inv.total, 0);
      const { _count, ...clientData } = client;
      return {
        ...clientData,
        invoiceCount: _count.Invoice,
        totalInvoiced: totalInvoiced,
      };
    });

    return NextResponse.json({ clients: clientsWithStats }); 
  } catch (error) {
    console.error("Error fetching clients with stats:", error);
    return NextResponse.json({ success: false, error: 'failed to fetch clients' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 