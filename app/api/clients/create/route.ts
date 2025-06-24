import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
// Import crypto for generating ID if needed
import crypto from 'crypto';
// Import cookies
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Define expected request body structure - support both old and new formats
interface CreateClientRequestBody {
  name: string;
  email?: string; // Legacy support for single email
  emails?: string[]; // New format for multiple emails
  address: string;
}

// Generate a unique ID (similar to CUID but using Node's crypto)
function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: Request) {
  try {
    // *** Add Authentication Check ***
    const cookieStore = await cookies();
    const authToken = cookieStore.get('invoice-auth');
    
    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    // *** End Authentication Check ***

    // Explicitly type the body using the interface
    const body: CreateClientRequestBody = await request.json();
    const { name, email, emails, address } = body;

    // Handle both old and new email formats
    let finalEmails: string[] = [];
    if (emails && Array.isArray(emails)) {
      finalEmails = emails;
    } else if (email) {
      finalEmails = [email];
    }
    
    // finalEmails is used for validation and client creation

    // Basic validation
    if (!name || finalEmails.length === 0 || !address) {
      return NextResponse.json({ error: 'missing required fields (name, email(s), address)' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = finalEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: `invalid email format: ${invalidEmails.join(', ')}` }, { status: 400 });
    }

    // Check if client name already exists
    const existingClient = await prisma.client.findFirst({
      where: { name },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'client with this name already exists' }, { status: 409 }); // 409 Conflict
    }

    // Create client data - support both schema versions
    const clientData: Record<string, unknown> = {
      id: generateId(), // Generate unique ID explicitly
      name,
      address,
      updatedAt: new Date(), // Explicitly provide the current time
    };

    // Try to use new schema first, fallback to old schema
    try {
      // Try new schema with emails array
      clientData.emails = finalEmails;
      const newClient = await prisma.client.create({ 
        data: clientData as unknown as Parameters<typeof prisma.client.create>[0]['data']
      });
      return NextResponse.json({ client: newClient }, { status: 201 });
    } catch (schemaError) {
      // If that fails, try old schema with single email
      console.error('Error creating client:', schemaError);
      if (finalEmails.length > 1) {
        return NextResponse.json({ 
          error: 'multiple emails not supported in current schema. please provide only one email address.' 
        }, { status: 400 });
      }
      
      delete clientData.emails;
      clientData.email = finalEmails[0];
      
      const newClient = await prisma.client.create({ 
        data: clientData as unknown as Parameters<typeof prisma.client.create>[0]['data']
      });
      return NextResponse.json({ client: newClient }, { status: 201 });
    }

  } catch (error) {
    console.error("Error creating client:", error);
    // Handle potential Prisma errors (like unique constraint violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        // Use a more generic message or use the variable defined outside try
        const message = `client with this name already exists`;
        return NextResponse.json(
          { error: message }, 
          { status: 409 }
        );
      }
    }
    // Generic error for other cases
    return NextResponse.json({ success: false, error: 'failed to create client' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 