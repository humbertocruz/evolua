import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function GET() {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      _count: {
        select: { projectKeys: true, memberships: true, ownedTeams: true }
      }
    }
  });

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(dbUser);
}

export async function DELETE() {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  try {
    await prisma.$transaction([
      prisma.projectRequest.deleteMany({ where: { userId: user.id } }),
      prisma.projectKey.deleteMany({ where: { userId: user.id } }),
      prisma.sshKey.deleteMany({ where: { userId: user.id } }),
      prisma.teamMember.deleteMany({ where: { userId: user.id } }),
      prisma.team.deleteMany({ where: { ownerId: user.id } }),
      prisma.user.delete({ where: { id: user.id } })
    ]);

    return NextResponse.json({ success: true, message: 'Account and all data deleted successfully.' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
