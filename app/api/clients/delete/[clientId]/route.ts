import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Using DELETE verb with Next.js 15+ typing
export async function DELETE(
  request: NextRequest, // Use NextRequest
  { params }: { params: Promise<{ clientId: string }> } // Destructure params and type it
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get("invoice-auth");

    if (!authToken?.value || authToken.value !== process.env.INVOICE_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { clientId } = await params;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID is required in URL" },
        { status: 400 }
      );
    }

    // *** Cascade Delete: Delete associated records first ***
    
    // Get counts for logging/response
    const [invoiceCount, legalDocumentCount] = await Promise.all([
      prisma.invoice.count({ where: { clientId: clientId } }),
      prisma.legalDocument.count({ where: { clientId: clientId } })
    ]);

    // Delete associated invoices
    if (invoiceCount > 0) {
      await prisma.invoice.deleteMany({
        where: { clientId: clientId },
      });
    }

    // Delete associated legal documents
    if (legalDocumentCount > 0) {
      await prisma.legalDocument.deleteMany({
        where: { clientId: clientId },
      });
    }

    // Now delete the client
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
      deletedCounts: {
        invoices: invoiceCount,
        legalDocuments: legalDocumentCount
      }
    });
  } catch (error) {
    console.error("Error deleting client:", error);
    // Handle specific Prisma error for record not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }
    // Generic error
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { success: false, error: `Failed to delete client: ${errorMessage}` },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client if necessary
    // await prisma.$disconnect();
  }
} 