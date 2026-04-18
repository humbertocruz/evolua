import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug, environment = '.env' } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);

    if (!challenge) return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });

    const host = request.headers.get('host') || 'www.envware.dev';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    let isVerified = false;
    try {
      const verifyResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey, signature, challenge })
      });
      const verifyData = await verifyResp.json();
      isVerified = verifyData.verified;
    } catch(e) {
      console.error('Ponte Go fail:', e);
    }

    if (!isVerified) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    await redis.del(challengeKey);

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const project = await prisma.project.findFirst({
      where: { slug: projectSlug, team: { slug: teamSlug } },
      include: { 
        team: { include: { members: true } } 
      }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const membership = project.team.members.find(m => m.userId === user.id);
    if (!membership) return NextResponse.json({ success: false, error: 'No access' }, { status: 403 });

    // --- Environment Access Control (RBAC 2.1) 🌸🛡️ ---
    const role = membership.role; // OWNER, ADMIN, PREVIEW, MEMBER (DEV)
    const env = environment.toLowerCase();

    const isProd = env === '.env' || env === '.env.production';
    const isPreview = env === '.env.preview';
    const isDev = env === '.env.development';

    let hasAccess = false;
    if (role === 'OWNER' || role === 'ADMIN') {
        hasAccess = true;
    } else if (role === 'PREVIEW') {
        hasAccess = isPreview || isDev;
    } else { // MEMBER / DEVELOPER
        hasAccess = isDev;
    }

    if (!hasAccess) {
      return NextResponse.json({ 
        success: false, 
        error: `Access Denied: Your role (${role}) cannot access the '${environment}' environment. 🛡️` 
      }, { status: 403 });
    }

    // Buscar a ProjectKey encriptada para este usuário específico
    const projectKeyRecord = await prisma.projectKey.findFirst({
      where: { projectId: project.id, userId: user.id }
    });

    return NextResponse.json({ 
      success: true, 
      encryptedProjectKey: projectKeyRecord?.encryptedProjectKey,
      role: role,
      project: {
        name: project.name,
        slug: project.slug,
        hasLocalMode: true // Always unlocked now 🌸🛡️
      },
      secrets: [] // Cloud secrets removed
    });

  } catch (error: any) {
    console.error('V2 Pull Fatal:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
