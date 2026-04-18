import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueSlug(name: string, teamId: string): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findFirst({
      where: { teamId, slug },
    });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

export async function GET() {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          projects: {
            include: {
              team: true,
              members: { where: { userId: user.id } }
            }
          }
        }
      }
    }
  });

  const allProjects = memberships.flatMap(membership => {
    const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(membership.role);
    return membership.team.projects.filter(project => 
      isOwnerOrAdmin || project.members.some(m => m.userId === user.id)
    );
  });

  return NextResponse.json(allProjects);
}

export async function POST(request: Request) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  try {
    const { name, teamId } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    let targetTeamId = teamId;
    if (!targetTeamId) {
      const personalTeam = await prisma.team.findFirst({
        where: { ownerId: user.id }
      });
      if (!personalTeam) return NextResponse.json({ error: 'Personal team not found' }, { status: 404 });
      targetTeamId = personalTeam.id;
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: targetTeamId, userId: user.id } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Contagem global de projetos do usuário
    const projectCount = await prisma.project.count({
      where: {
        team: { ownerId: user.id }
      }
    });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Limites de Projetos (Globais por Owner)
    if (dbUser.subscriptionStatus === 'FREE' && projectCount >= 10) {
      return NextResponse.json({ error: 'Free plan limit reached (10 projects). Upgrade to Premium.' }, { status: 403 });
    }
    if (dbUser.subscriptionStatus === 'PREMIUM' && projectCount >= 100) {
      return NextResponse.json({ error: 'Premium plan limit reached (100 projects).' }, { status: 403 });
    }

    const slug = await generateUniqueSlug(name, targetTeamId);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        teamId: targetTeamId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[PROJECT_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
