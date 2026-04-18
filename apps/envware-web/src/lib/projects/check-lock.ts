import { prisma } from '@/lib/prisma';

export async function checkProjectLock(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      team: {
        include: {
          owner: {
            include: {
              ownedTeams: {
                include: {
                  _count: { select: { projects: true } }
                }
              }
            }
          },
          members: true
        }
      },
      _count: {
        select: { members: true }
      }
    }
  });

  if (!project) {
    return { locked: true, reason: 'Project not found', status: 404 };
  }

  const owner = project.team.owner;
  const isPremium = owner.subscriptionStatus === 'PREMIUM';
  
  // Contar projetos de todos os times que esse owner possui
  const projectCount = owner.ownedTeams.reduce((acc, t) => acc + t._count.projects, 0);
  
  // No novo modelo, members são os acessos granulares ao projeto
  const projectMemberCount = project._count.members; 

  const LIMITS = {
    FREE: { projects: 10, members: 3 },
    PREMIUM: { projects: 100, members: 15 }
  };

  const limits = isPremium ? LIMITS.PREMIUM : LIMITS.FREE;

  // 1. Checa limite de projetos global do owner
  if (projectCount > limits.projects) {
    return { 
      locked: true, 
      reason: `Project owner exceeded plan limit of ${limits.projects} projects (Current: ${projectCount}). Delete projects to unlock.`, 
      status: 403 
    };
  }

  // 2. Checa limite de membros granulares do projeto
  if (projectMemberCount > limits.members) {
    return { 
      locked: true, 
      reason: `Project exceeded plan limit of ${limits.members} members (Current: ${projectMemberCount}). Remove members to unlock.`, 
      status: 403 
    };
  }

  return { locked: false, reason: null, status: 200 };
}
