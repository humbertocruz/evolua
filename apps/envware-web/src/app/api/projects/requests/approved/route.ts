import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function GET() {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Buscar todos os ProjectKeys do usuário onde o status do request seja APPROVED
    // ou simplesmente todas as chaves de projeto que ele possui.
    const approvedKeys = await prisma.projectKey.findMany({
      where: { userId: user.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            team: { select: { slug: true } }
          }
        }
      }
    });

    return NextResponse.json(approvedKeys.map(pk => ({
      projectId: pk.projectId,
      role: 'DEVELOPER', // Poderíamos buscar o role real do TeamMember
      encryptedProjectKey: pk.encryptedProjectKey,
      projectName: pk.project.name,
      teamSlug: pk.project.team.slug
    })));

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
