import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { Project } from "@prisma/client";

// Type for project order update
interface ProjectOrderUpdate {
  id: string;
}

// GET /api/projects - List all projects
export async function GET() {
  try {
    // Add a timeout to the database query
    const projects = await Promise.race([
      prisma.project.findMany({
        orderBy: { order: "asc" }, // Changed to order by 'order' field for consistency
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      )
    ]) as Project[];

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
    
    // Return fallback data instead of just an error
    const fallbackProjects = [
      {
        id: "1",
        title: "surplush",
        description: "a platform for businesses to get essential supplies cheaper & the eco-friendly way",
        image: "/surplush/main.png",
        mobileImage: "/surplush/mobile-main.png",
        link: "/work/surplush",
        isVisible: true,
        priority: true,
        order: 0,
        overview: null,
        fullDescription: null,
        images: [],
        mobileImages: [],
        technologies: [],
        year: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "kronos clothing",
        description: "my custom-built store for my clothing brand",
        image: "/kronos/main.png",
        mobileImage: "/kronos/mobile-main.png",
        link: "/work/kronos",
        isVisible: true,
        priority: false,
        order: 1,
        overview: null,
        fullDescription: null,
        images: [],
        mobileImages: [],
        technologies: [],
        year: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        title: "jacked fitness",
        description: "a place for people to find out more about jack and his abilities as a personal trainer",
        image: "/jacked/main.png",
        mobileImage: "/jacked/mobile-main.png",
        link: "/work/jacked",
        isVisible: true,
        priority: false,
        order: 2,
        overview: null,
        fullDescription: null,
        images: [],
        mobileImages: [],
        technologies: [],
        year: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: fallbackProjects,
      fallback: true, // Indicate this is fallback data
    });
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
      priority,
      order 
    } = body;

    // Use provided order or get the next available order
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrderProject = await prisma.project.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      finalOrder = maxOrderProject ? maxOrderProject.order + 1 : 0;
    }

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
        order: finalOrder,
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