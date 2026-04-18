import { prisma } from './prisma';

export async function resolveProject(idOrSlug: string, userId: string, userEmail: string) {
  // 1. Tentar por ID primeiro
  let project = await prisma.project.findUnique({
    where: { id: idOrSlug },
    include: { 
      team: {
        include: {
          members: { where: { userId } }
        }
      },
      members: { where: { userId } }
    },
  });

  // 2. Se não achou e o identificador tem '/', tentar por team-slug/project-slug
  if (!project && idOrSlug.includes('/')) {
    const [teamSlug, projectSlug] = idOrSlug.split('/');
    project = await prisma.project.findFirst({
      where: {
        slug: projectSlug,
        team: { slug: teamSlug }
      },
      include: { 
        team: {
          include: {
            members: { where: { userId } }
          }
        },
        members: { where: { userId } }
      },
    });
  }

  // 3. Se ainda não achou, tentar o slug nos times do usuário (legado ou fallback)
  if (!project) {
    project = await prisma.project.findFirst({
      where: {
        slug: idOrSlug,
        team: { members: { some: { userId } } }
      },
      include: { 
        team: {
          include: {
            members: { where: { userId } }
          }
        },
        members: { where: { userId } }
      },
    });
  }

  if (!project) throw new Error('Project not found or no access');

  const teamMembership = project.team.members[0];
  if (!teamMembership) throw new Error('No access to this team');

  // Determinar Role Final
  const isOwnerOrAdmin = ['OWNER', 'ADMIN'].includes(teamMembership.role);
  const isExplicitMember = project.members.length > 0;

  if (!isOwnerOrAdmin && !isExplicitMember) {
    throw new Error('No access to this project');
  }

  // Adicionar propriedade role virtual para compatibilidade com rotas
  return {
    ...project,
    virtualRole: isOwnerOrAdmin ? 'ADMINISTRATOR' : 'DEVELOPER'
  };
}
