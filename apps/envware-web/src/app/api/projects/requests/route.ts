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
      const { projectId, publicKey, role, userName } = await request.json();

      if (!projectId || !publicKey) {
        return NextResponse.json({ error: 'Project Identifier and Public Key are required' }, { status: 400 });
      }

      const userId = user.id as string;

      // 1. Atualizar nome do usuário se fornecido
      if (userName) {
        await prisma.user.update({
          where: { id: userId },
          data: { name: userName }
        });
      }

      // 2. Lógica de Team/Project Slug
      let teamSlug: string;
      let projectSlug: string;

      if (projectId.includes('/')) {
        [teamSlug, projectSlug] = projectId.split('/');
      } else {
        // Fallback: se passar só um nome, assumimos que é o projeto e o time é o pessoal do user
        // Mas a regra do Beto sugere que sempre temos um team1 project1
        return NextResponse.json({ error: 'Format must be team-slug/project-slug' }, { status: 400 });
      }

      // 3. Buscar ou criar o Team
      let team = await prisma.team.findUnique({ where: { slug: teamSlug } });
      const isOwnerRole = role === 'OWNER';

      if (!team) {
        if (isOwnerRole) {
          team = await prisma.team.create({
            data: {
              slug: teamSlug,
              name: teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1),
              ownerId: userId,
              members: {
                create: { userId: userId, role: 'OWNER' }
              }
            }
          });
        } else {
          return NextResponse.json({ error: `Team '${teamSlug}' does not exist. Only an OWNER can create it.` }, { status: 403 });
        }
      }

      // 4. Buscar ou criar o Project
      let project = await prisma.project.findFirst({
        where: { slug: projectSlug, teamId: team.id }
      });

      if (!project) {
        // Só cria se for OWNER do Team (ou se acabou de criar o team acima)
        const userMembership = await prisma.teamMember.findUnique({
          where: { teamId_userId: { teamId: team.id, userId } }
        });

        if (userMembership?.role === 'OWNER' || team.ownerId === userId) {
          project = await prisma.project.create({
            data: {
              slug: projectSlug,
              name: projectSlug.charAt(0).toUpperCase() + projectSlug.slice(1),
              teamId: team.id
            }
          });
        } else {
          return NextResponse.json({ error: `Project '${projectSlug}' not found and you are not an OWNER of team '${teamSlug}' to create it.` }, { status: 403 });
        }
      }

      // 5. Criar o pedido de acesso ou vincular se já for o owner
      if (team.ownerId === userId && isOwnerRole) {
         // Se ele é o dono e pediu pra ser owner (e o projeto existe/foi criado), 
         // ele não precisa de "request" aprovado por ninguém, ele já tem acesso.
         // Mas para o fluxo E2EE, ele precisa registrar a chave dele.
         return NextResponse.json({
            message: 'You are the owner of this team. Project is ready for your first push.',
            projectId: project.id
         });
      }

      const projectRequest = await prisma.projectRequest.upsert({
        where: {
          projectId_userId_publicKey: {
            projectId: project.id,
            userId: userId,
            publicKey
          }
        },
        update: {
          role: role || 'DEVELOPER',
          status: 'PENDING'
        },
        create: {
          projectId: project.id,
          userId: userId,
          publicKey,
          role: role || 'DEVELOPER',
          status: 'PENDING'
        }
      });

      return NextResponse.json({
        message: 'Request sent successfully',
        request: projectRequest
      });

    } catch (error) {
    console.error('[PROJECT_REQUEST_POST_ERROR]', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'PENDING';
  const userId = user.id as string;

  const requests = await prisma.projectRequest.findMany({
    where: {
      status: status as any,
      project: {
        team: {
          members: {
            some: {
              userId: userId,
              role: { in: ['OWNER', 'ADMIN'] }
            }
          }
        }
      }
    },
    include: {
      user: { select: { email: true, name: true } },
      project: { 
        select: { 
          name: true, 
          slug: true,
          team: { select: { slug: true } }
        } 
      }
    }
  });

  return NextResponse.json(requests);
}
