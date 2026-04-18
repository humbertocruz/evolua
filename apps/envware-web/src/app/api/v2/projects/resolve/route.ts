import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gitUrl = searchParams.get('gitUrl');

    if (!gitUrl) {
      return NextResponse.json({ success: false, error: 'Missing gitUrl' }, { status: 400 });
    }

    // Tenta encontrar o projeto pela URL do Git
    const project = await prisma.project.findFirst({
      where: { gitUrl: gitUrl },
      include: {
        team: true
      }
    });

    if (!project) {
      return NextResponse.json({ 
        success: false, 
        error: 'Project not found for this Git URL. 🌸' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      teamSlug: project.team.slug,
      projectSlug: project.slug,
      projectName: project.name
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
