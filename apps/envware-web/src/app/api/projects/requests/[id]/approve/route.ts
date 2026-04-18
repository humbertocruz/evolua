import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function POST(
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
    const { encryptedProjectKey } = await request.json();

    if (!encryptedProjectKey) {
      return NextResponse.json({ error: 'Encrypted Project Key is required for approval' }, { status: 400 });
    }

    // 1. Validar se o request existe e se o usuário atual tem poder para aprovar
    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: requestId },
      include: { project: { include: { team: true } } }
    });

    if (!projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: projectRequest.project.teamId, userId: userId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // 2. Executar a aprovação em uma transação
    await prisma.$transaction(async (tx) => {
      // Atualizar o status do request
      await tx.projectRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });

      // Criar a ProjectKey para o usuário (isso dá o acesso real ao Pull)
      await tx.projectKey.create({
        data: {
          projectId: projectRequest.projectId,
          userId: projectRequest.userId,
          encryptedProjectKey,
        }
      });

      // Se for um acesso granular, adicionar o usuário à lista de members do projeto
      await tx.project.update({
        where: { id: projectRequest.projectId },
        data: {
          members: {
            connect: { teamId_userId: { teamId: projectRequest.project.teamId, userId: projectRequest.userId } }
          }
        }
      });
      
      const targetMembership = await tx.teamMember.findUnique({
        where: { teamId_userId: { teamId: projectRequest.project.teamId, userId: projectRequest.userId } }
      });

      if (!targetMembership) {
        await tx.teamMember.create({
          data: {
            teamId: projectRequest.project.teamId,
            userId: projectRequest.userId,
            role: 'MEMBER'
          }
        });
      }
    });

    return NextResponse.json({ message: 'Request approved and access granted' });

  } catch (error) {
    console.error('[APPROVE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
