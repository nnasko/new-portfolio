import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
// Import crypto for generating ID if needed
import crypto from 'crypto';
// Import cookies
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// Define expected request body structure
interface CreateClientRequestBody {
  name: string;
  email: string;
  address: string;
}

// Generate a unique ID (similar to CUID but using Node's crypto)
function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: Request) {
  let emailFromBody: string | undefined;
  
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
    const { name, email, address } = body;
    emailFromBody = email; // Assign to variable accessible in catch

    // Basic validation
    if (!name || !email || !address) {
      return NextResponse.json({ error: 'missing required fields (name, email, address)' }, { status: 400 });
    }

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'client with this email already exists' }, { status: 409 }); // 409 Conflict
    }

    // Create client with explicitly provided id and updatedAt fields
    // to match the schema requirements
    const newClient = await prisma.client.create({
      data: {
        id: generateId(), // Generate unique ID explicitly
        name,
        email,
        address,
        updatedAt: new Date(), // Explicitly provide the current time
      },
    });

    return NextResponse.json({ client: newClient }, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating client:", error);
    // Handle potential Prisma errors (like unique constraint violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        // Use a more generic message or use the variable defined outside try
        const message = emailFromBody 
            ? `client with this email already exists (${emailFromBody})`
            : 'client with this email already exists';
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