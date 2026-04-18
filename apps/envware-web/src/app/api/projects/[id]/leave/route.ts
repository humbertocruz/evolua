import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const { id: projectId } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: true,
        members: {
          where: { userId: user.id }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.team.ownerId === user.id) {
      return NextResponse.json(
        { error: 'Team owners cannot leave projects. Delete the project or the team instead.' },
        { status: 403 }
      );
    }

    const userId = user.id as string;

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: {
          members: {
            disconnect: { teamId_userId: { teamId: project.teamId, userId } }
          }
        }
      }),
      prisma.projectKey.deleteMany({
        where: {
          projectId: projectId,
          userId: userId
        }
      }),
    ]);

    return NextResponse.json({ message: 'Left project successfully' });
  } catch (error: any) {
    console.error('[PROJECT_LEAVE_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
