import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const { id: requestId } = await params;
  const userId = user.id as string;

  try {
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { email: true, name: true } },
        project: { 
          select: { 
            name: true, 
            slug: true, 
            teamId: true,
            team: { select: { slug: true } }
          } 
        }
      }
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Verificar se o usuário tem permissão para ver esse request (deve ser Admin/Owner do time)
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: projectRequest.project.teamId, userId: userId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    return NextResponse.json(projectRequest);

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
