import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, projectSlug, teamSlug, environment = '.env' } = data;

    if (!publicKey || !signature || !projectSlug || !teamSlug) {
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
      where: { sshKeys: { some: { publicKey } } },
      include: { sshKeys: true }
    });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const project = await prisma.project.findFirst({
      where: { slug: projectSlug, team: { slug: teamSlug, members: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } } } }
    });

    if (!project) return NextResponse.json({ success: false, error: 'Project not found or Permission denied' }, { status: 403 });


    // Check if key exists for this environment
    const existingKey = await prisma.projectKey.findFirst({
        where: { projectId: project.id, userId: user.id, environment }
    });

    if (existingKey) {
        return NextResponse.json({ success: true, encryptedProjectKey: existingKey.encryptedProjectKey });
    }

    // 1. Gerar nova chave de projeto para este ambiente específico (E2EE) 🌸
    const newProjectKey = crypto.randomBytes(32).toString('hex');
    
    // 2. Criptografar usando a ponte Go (necessário para SSH keys puras no Vercel/Node)
    const encryptResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey, plainText: newProjectKey })
    });
    
    const encryptData = await encryptResp.json();
    if (!encryptData.success) {
        return NextResponse.json({ success: false, error: 'Failed to encrypt project key via bridge' }, { status: 500 });
    }

    const encryptedProjectKey = encryptData.encryptedData;

    await prisma.projectKey.create({
      data: {
        projectId: project.id,
        userId: user.id,
        environment,
        encryptedProjectKey
      }
    });


    return NextResponse.json({ 
      success: true, 
      encryptedProjectKey
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
