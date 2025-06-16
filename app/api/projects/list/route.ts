import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        overview: true,
        fullDescription: true,
        technologies: true,
        year: true,
        isVisible: true,
        priority: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      projects 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch projects' 
    }, { status: 500 });
  }
} 