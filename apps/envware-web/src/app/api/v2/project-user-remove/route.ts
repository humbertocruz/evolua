import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug, fingerprint } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug || !fingerprint) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const challengeHashId = crypto.createHash('sha256').update(publicKey).digest('hex');
    const challengeKey = `v2_challenge:${challengeHashId}`;
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

    // 2. Localizar Projeto e Time
    const project = await prisma.project.findFirst({
      where: { slug: projectSlug, team: { slug: teamSlug } },
      include: { 
        team: { include: { members: { include: { user: { include: { sshKeys: true } } } } } },
        members: { include: { user: { include: { sshKeys: true } } } }
      }
    });

    if (!project) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    
    const isOwnerOrAdmin = project.team.members.some(m => m.userId === user.id && (m.role === 'OWNER' || m.role === 'ADMIN'));
    if (!isOwnerOrAdmin) return NextResponse.json({ success: false, error: 'Requires ADMIN or OWNER role' }, { status: 403 });

    // 3. Identificar o membro a ser removido pelo fingerprint
    const memberToRemove = project.members.find(m => 
      m.user.sshKeys.some(k => {
        const parts = k.publicKey.trim().split(' ');
        const keyData = parts.length > 1 ? parts[1] : parts[0];
        const binaryKey = Buffer.from(keyData, 'base64');
        const fp = crypto.createHash('sha256').update(binaryKey).digest('base64').replace(/=+$/, '');
        return `SHA256:${fp}` === fingerprint || fp === fingerprint;
      })
    );

    if (!memberToRemove) return NextResponse.json({ success: false, error: 'Member with this fingerprint not found in this project' }, { status: 404 });
    
    // 4. Desconectar o membro do projeto (remover da relação ProjectAccess)
    await prisma.project.update({
      where: { id: project.id },
      data: {
        members: {
          disconnect: { id: memberToRemove.id }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User with fingerprint '${fingerprint}' removed from project '${projectSlug}'. 🌸` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
