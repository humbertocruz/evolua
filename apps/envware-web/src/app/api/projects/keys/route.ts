import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function POST(request: Request) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  try {
    const { projectId, userId: targetUserId, encryptedProjectKey, environment = '.env' } = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const currentUserId = user.id as string;

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId: currentUserId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Upsert project key - find existing or create new
    let projectKey;
    const existing = await prisma.projectKey.findFirst({
      where: { projectId, userId: targetUserId, environment }
    });

    if (existing) {
      projectKey = await prisma.projectKey.update({
        where: { id: existing.id },
        data: { encryptedProjectKey }
      });
    } else {
      projectKey = await prisma.projectKey.create({
        data: {
          projectId,
          userId: targetUserId,
          environment,
          encryptedProjectKey
        }
      });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { teamId_userId: { teamId: project.teamId, userId: targetUserId } }
        }
      }
    });

    return NextResponse.json(projectKey);

  } catch (error) {
    console.error('[PROJECT_KEYS_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}