import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, requestId, encryptedProjectKey } = data;

    if (!publicKey || !signature || !requestId || !encryptedProjectKey) {
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

    const projectRequest = await prisma.projectRequest.findUnique({
        where: { id: requestId },
        include: { project: { include: { team: { include: { members: true } } } } }
    });

    if (!projectRequest) return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });

    // Validar se quem aprova é ADMIN/OWNER do time
    const isAuthorized = projectRequest.project.team.members.some(
        m => m.userId === user.id && ['OWNER', 'ADMIN'].includes(m.role)
    );

    if (!isAuthorized) return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 });

    // 1. Criar a ProjectKey para o solicitante
    await prisma.projectKey.create({
        data: {
            projectId: projectRequest.projectId,
            userId: projectRequest.userId,
            encryptedProjectKey
        }
    });

    // 2. Garantir que o usuário seja membro do time com a role correta
    await prisma.teamMember.upsert({
        where: { teamId_userId: { teamId: projectRequest.project.teamId, userId: projectRequest.userId } },
        update: {
            role: projectRequest.role // Atualizar a role se aprovado com algo diferente
        },
        create: {
            teamId: projectRequest.project.teamId,
            userId: projectRequest.userId,
            role: projectRequest.role
        }
    });

    // 3. Atualizar status do pedido
    await prisma.projectRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
    });

    return NextResponse.json({ success: true, message: 'Request approved and access granted! 🚀' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
