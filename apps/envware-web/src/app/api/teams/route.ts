import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
  });
}
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, name } = data;

    if (!publicKey || !signature || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify auth
    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);
    if (!challenge) return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });

    const host = request.headers.get('host') || 'www.envware.dev';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verifyResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, signature, challenge })
    });
    const verifyData = await verifyResp.json();
    if (!verifyData.verified) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    await redis.del(challengeKey);

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check Team Limit
    const maxTeams = 1;
    const currentTeams = await prisma.team.count({ where: { ownerId: user.id } });

    if (currentTeams >= maxTeams) {
      return NextResponse.json({ 
        error: `You reached your team limit (${maxTeams}). Buy more slots with 'envw purchase teams'. 🌸🚀` 
      }, { status: 403 });
    }

    const slug = name.toLowerCase().replace(/ /g, '-');
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json({ name: team.name, slug: team.slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}