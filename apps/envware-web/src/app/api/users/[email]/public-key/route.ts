import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email: rawEmail } = await params;
    const email = rawEmail.toLowerCase();
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sshKeys: {
          where: { isVerified: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Retorna a chave verificada mais recente
    const publicKey = user.sshKeys[0]?.publicKey || null;

    return NextResponse.json({ publicKey });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
