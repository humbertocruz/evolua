import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug) {
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

    const project = await prisma.project.findFirst({
      where: { 
        slug: projectSlug, 
        team: { 
          slug: teamSlug,
          members: { some: { userId: user.id } }
        } 
      }
    });

    if (!project) return NextResponse.json({ success: false, error: 'Project not found or Access denied' }, { status: 403 });

    // Cloud secrets are deprecated. In the new mode, we don't track environments in the DB.
    // We can return a default list or an empty list. 🌸
    const envs = [
      { name: '.env', count: 0 },
      { name: '.env.production', count: 0 },
      { name: '.env.development', count: 0 },
      { name: '.env.preview', count: 0 }
    ];

    return NextResponse.json({ success: true, envs });

    return NextResponse.json({ success: true, envs });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
