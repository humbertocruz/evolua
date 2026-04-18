import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature } = data;

    if (!publicKey || !signature) {
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

    // Buscar pedidos de acesso para projetos onde o usuário é OWNER ou ADMIN do time
    const pendingRequests = await prisma.projectRequest.findMany({
      where: {
        status: 'PENDING',
        project: {
          team: {
            members: {
              some: {
                userId: user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              }
            }
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            sshKeys: true // Para pegar o deviceAlias se necessário
          }
        },
        project: {
          select: {
            slug: true,
            team: { select: { slug: true } }
          }
        }
      }
    });

    const formattedRequests = pendingRequests.map(req => {
        // Encontrar a chave específica do request para pegar o nome/device
        const specificKey = req.user.sshKeys.find(k => k.publicKey === req.publicKey);
        
        return {
            id: req.id,
            userName: req.user.name || 'Unknown',
            userEmail: req.user.email,
            publicKey: req.publicKey,
            role: req.role,
            projectSlug: req.project.slug,
            teamSlug: req.project.team.slug,
            deviceAlias: specificKey?.name || 'Unknown Device'
        };
    });

    return NextResponse.json({ success: true, requests: formattedRequests });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
