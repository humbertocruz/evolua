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
    const { projectId, userId: targetUserId, encryptedProjectKey } = await request.json();

    // Validar se o projeto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { team: true }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const currentUserId = user.id as string;

    // Validar se o usuário atual é admin/owner do time do projeto
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: project.teamId, userId: currentUserId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Criar ou atualizar a chave do projeto para o destinatário (targetUserId)
    const projectKey = await prisma.projectKey.upsert({
      where: { 
        projectId_userId_sshKeyId: { 
          projectId, 
          userId: targetUserId, 
          sshKeyId: null as any
        } 
      },
      update: { encryptedProjectKey },
      create: {
        projectId,
        userId: targetUserId,
        encryptedProjectKey
      }
    });

    // Também garantir que ele seja membro do projeto (acesso granular)
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
