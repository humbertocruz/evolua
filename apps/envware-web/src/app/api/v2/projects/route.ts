import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug } = data;

    if (!publicKey || !signature || !teamSlug) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const challengeHashId = crypto.createHash('sha256').update(publicKey).digest('hex');
    const challengeKey = `v2_challenge:${challengeHashId}`;
    const challenge = await redis.get(challengeKey);
    if (!challenge) return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 });

    const host = request.headers.get('host') || 'www.envware.dev';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verifyResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, signature, challenge })
    });
    
    const verifyData = await verifyResp.json();
    if (!verifyData.verified) return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    await redis.del(challengeKey);

    const user = await prisma.user.findFirst({
      where: { sshKeys: { some: { publicKey } } }
    });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      include: {
        members: { where: { userId: user.id } },
        projects: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    if (!team) return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });

    const { isBlacklisted } = await import('@/lib/blacklist');
    if (isBlacklisted(teamSlug) && !team.isVerified) {
       return NextResponse.json({ success: false, error: 'Team is under verification. Access to projects is restricted. 🌸' }, { status: 403 });
    }

    // Verifica se o usuário é membro do time
    if (team.members.length === 0) {
      return NextResponse.json({ success: false, error: 'Access denied to this team' }, { status: 403 });
    }

    const projects = team.projects.map(p => ({
      name: p.name,
      slug: p.slug,
      secretsCount: 0 // Cloud secrets are deprecated 🌸
    }));

    return NextResponse.json({ success: true, projects });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
