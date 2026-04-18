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

  const { id: teamId } = await params;
  const currentUserId = user.id as string;

  try {
    const { email, role } = await request.json();

    // 1. Check if user has permission (OWNER or ADMIN)
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: currentUserId } }
    });

    if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // 2. Find the user to be invited
    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 });
    }

    // 3. Add to team
    const newMember = await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId: targetUser.id } },
      update: { role: role || 'MEMBER' },
      create: {
        teamId,
        userId: targetUser.id,
        role: role || 'MEMBER'
      }
    });

    return NextResponse.json(newMember);

  } catch (error) {
    console.error('[TEAM_MEMBER_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  const { id: teamId } = await params;

  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: { user: { select: { email: true, name: true } } }
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
