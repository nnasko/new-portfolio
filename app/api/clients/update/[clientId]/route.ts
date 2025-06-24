import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;
    const { name, emails, address } = await request.json();

    // Validate required fields
    if (!name || !emails || !Array.isArray(emails) || emails.length === 0 || !address) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name, at least one email, and address are required' 
      }, { status: 400 });
    }

    // Filter out empty emails
    const validEmails = emails.filter((email: string) => email.trim());
    if (validEmails.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'At least one valid email is required' 
      }, { status: 400 });
    }

    // Update the client
    const client = await prisma.client.update({
      where: { id: clientId },
      data: {
        name: name.trim(),
        emails: validEmails,
        address: address.trim(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      client,
      message: 'Client updated successfully' 
    });

  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update client' 
    }, { status: 500 });
  }
} 