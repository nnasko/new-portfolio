import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

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
    });

    return NextResponse.json({ clients }); 
  } catch (error) {
    console.error("Error fetching clients with stats:", error);
    return NextResponse.json({ success: false, error: 'failed to fetch clients' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 