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

    // Get all service agreements from database
    const documents = await prisma.legalDocument.findMany({
      where: {
        documentType: 'SERVICE_AGREEMENT'
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Client: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      documents 
    });
  } catch (error) {
    console.error('Error fetching service agreements:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch service agreements' 
    }, { status: 500 });
  }
} 