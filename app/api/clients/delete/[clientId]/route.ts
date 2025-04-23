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

    // *** Constraint Check: Check for associated invoices ***
    const invoiceCount = await prisma.invoice.count({
      where: { clientId: clientId },
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `cannot delete client: ${invoiceCount} invoice(s) are still assigned to this client. please reassign or delete them first.`,
        },
        { status: 409 }
      ); // 409 Conflict - cannot fulfill due to conflict with existing resources
    }
    // *** End Constraint Check ***

    // Attempt to delete the client
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
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