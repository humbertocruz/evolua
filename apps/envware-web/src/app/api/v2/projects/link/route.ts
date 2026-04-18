import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug, gitUrl } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug || !gitUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
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

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const project = await prisma.project.findFirst({
      where: { 
        slug: projectSlug, 
        team: { 
          slug: teamSlug,
          members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } }
        } 
      }
    });

    if (!project) return NextResponse.json({ success: false, error: 'Project not found or you do not have ADMIN/OWNER permissions. 🔒' }, { status: 403 });

    // Atualizar a URL do Git
    await prisma.project.update({
      where: { id: project.id },
      data: { gitUrl }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Bazinga! Project ${teamSlug}/${projectSlug} linked to Git URL: ${gitUrl} 🚀🌸` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
