import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Type for project order update
interface ProjectOrderUpdate {
  id: string;
}

// GET /api/projects - List all projects
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Ensure all projects have the new fields with defaults
    const normalizedProjects = projects.map(project => ({
      ...project,
      overview: project.overview || null,
      fullDescription: project.fullDescription || null,
      images: project.images || [],
      mobileImages: project.mobileImages || [],
      technologies: project.technologies || [],
      year: project.year || null,
    }));

    return NextResponse.json({
      success: true,
      data: normalizedProjects,
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
      },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
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
      priority 
    } = body;

    // Get the current maximum order value
    const maxOrderProject = await prisma.project.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const nextOrder = maxOrderProject ? maxOrderProject.order + 1 : 0;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        overview: overview || null,
        fullDescription: fullDescription || null,
        image,
        mobileImage: mobileImage || image,
        images: images || [],
        mobileImages: mobileImages || [],
        technologies: technologies || [],
        link,
        year: year || null,
        isVisible: isVisible ?? true,
        priority: priority ?? false,
        order: nextOrder,
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
      },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Update project order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projects } = body;

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        {
          success: false,
          error: "Projects must be an array",
        },
        { status: 400 }
      );
    }

    // Update the order of projects
    const updatePromises = projects.map((project: ProjectOrderUpdate, index: number) =>
      prisma.project.update({
        where: { id: project.id },
        data: { order: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Project order updated successfully",
    });
  } catch (error) {
    console.error("Failed to update project order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project order",
      },
      { status: 500 }
    );
  }
} 