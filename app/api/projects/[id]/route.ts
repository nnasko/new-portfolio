import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[id] - Get a specific project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
      },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a specific project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      description, 
      overview,
      fullDescription,
      image, 
      mobileImage, 
      images,
      mobileImages,
      technologies,
      link, 
      year,
      isVisible, 
      priority,
      order
    } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(overview !== undefined && { overview: overview || null }),
        ...(fullDescription !== undefined && { fullDescription: fullDescription || null }),
        ...(image && { image }),
        ...(mobileImage !== undefined && { mobileImage: mobileImage || null }),
        ...(images !== undefined && { images: images || [] }),
        ...(mobileImages !== undefined && { mobileImages: mobileImages || [] }),
        ...(technologies !== undefined && { technologies: technologies || [] }),
        ...(link && { link }),
        ...(year !== undefined && { year: year || null }),
        ...(isVisible !== undefined && { isVisible }),
        ...(priority !== undefined && { priority }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a specific project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
} 