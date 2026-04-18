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

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);
    if (!challenge) return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 });

    // 1. Auth (Ponte Go)
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

    // 2. Lógica de Permissão
    const project = await prisma.project.findFirst({
      where: { 
        slug: projectSlug,
        team: { slug: teamSlug }
      },
      include: { team: { include: { members: true } } }
    });

    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    
    const isOwnerOrAdmin = project.team.members.some(m => m.userId === user.id && (m.role === 'OWNER' || m.role === 'ADMIN'));
    if (!isOwnerOrAdmin) return NextResponse.json({ success: false, error: 'Access denied: Requires ADMIN or OWNER role' }, { status: 403 });

    // 3. Deletar Projeto
    await prisma.project.delete({
      where: { id: project.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Project '${projectSlug}' and its keys have been deleted. 🗑️🌸` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
