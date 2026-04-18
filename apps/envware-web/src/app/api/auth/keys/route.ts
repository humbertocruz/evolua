import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthorizedUser } from '@/lib/auth/get-user';

export async function GET(request: Request) {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keys = await prisma.sshKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(keys);
}

export async function DELETE(request: Request) {
  const user = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });

  try {
    const key = await prisma.sshKey.findUnique({ where: { id } });

    if (!key || key.userId !== user.id) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    await prisma.sshKey.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
