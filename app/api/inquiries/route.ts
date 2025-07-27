import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      { 
        success: true,
        inquiries 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { 
      id, 
      status, 
      notes, 
      priority, 
      followUpDate, 
      convertedToClientId, 
      finalPrice, 
      quotedAt 
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Inquiry ID is required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (priority !== undefined) updateData.priority = priority;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;
    if (convertedToClientId !== undefined) updateData.convertedToClientId = convertedToClientId;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (quotedAt !== undefined) updateData.quotedAt = new Date(quotedAt);

    console.log('Updating inquiry with data:', updateData);

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: updateData
    });

    console.log('Updated inquiry result:', {
      id: updatedInquiry.id,
      status: updatedInquiry.status,
      convertedToClientId: updatedInquiry.convertedToClientId,
      finalPrice: updatedInquiry.finalPrice
    });

    return NextResponse.json(
      { 
        success: true,
        inquiry: updatedInquiry 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating inquiry:", error);
    return NextResponse.json(
      { error: "Failed to update inquiry" },
      { status: 500 }
    );
  }
} 