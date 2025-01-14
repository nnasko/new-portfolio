import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Get views for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("GET - Fetching views for slug:", slug);

    const views = await prisma.projectViews.findUnique({
      where: {
        slug,
      },
      select: {
        views: true,
      },
    });

    console.log("GET - Found views:", views);
    return NextResponse.json({ views: views?.views ?? 0 });
  } catch (error) {
    console.error("GET - Error:", error);
    return NextResponse.json({ error: "Failed to get views" }, { status: 500 });
  }
}

// Increment views for a project
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log("POST - Incrementing views for slug:", slug);

    const views = await prisma.projectViews.upsert({
      where: {
        slug,
      },
      create: {
        slug,
        views: 1,
      },
      update: {
        views: {
          increment: 1,
        },
      },
    });

    console.log("POST - Updated views:", views);
    return NextResponse.json({ views: views.views });
  } catch (error) {
    console.error("POST - Error:", error);
    return NextResponse.json(
      { error: "Failed to increment views" },
      { status: 500 }
    );
  }
}
