import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { sshKeys: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.sshKeys.length === 0) {
      return NextResponse.json({ error: 'No SSH keys registered' }, { status: 400 });
    }

    const challenge = crypto.randomBytes(32).toString('hex');
    
    // Armazenar no Redis com expiração de 5 minutos
    const key = `auth_challenge:${email}`;
    await redis.set(key, challenge, {
      EX: 300 // 5 minutos
    });

    return NextResponse.json({ challenge });
  } catch (error) {
    console.error('Challenge error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
