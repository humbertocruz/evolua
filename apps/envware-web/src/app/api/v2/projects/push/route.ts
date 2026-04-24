import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/v2/projects/push - Push secrets to server
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      publicKey, signature, teamSlug, projectSlug, 
      environment = '.env', secrets, encryptedProjectKey 
    } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug || !secrets) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature
    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);

    if (!challenge) {
      return NextResponse.json({ success: false, message: 'Challenge expired' }, { status: 400 });
    }

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
      console.error('Verify failed:', e);
    }

    if (!isVerified) {
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 401 });
    }

    await redis.del(challengeKey);

    // Find user
    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find project
    const project = await prisma.project.findFirst({
      where: { slug: projectSlug, team: { slug: teamSlug } },
      include: { 
        team: { include: { members: true } } 
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    const membership = project.team.members.find(m => m.userId === user.id);
    if (!membership) {
      return NextResponse.json({ success: false, message: 'No access to project' }, { status: 403 });
    }

    // RBAC: Only OWNER and ADMIN can push
    const role = membership.role;
    if (role !== 'OWNER' && role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Only OWNER and ADMIN can push secrets' 
      }, { status: 403 });
    }

    // Store encrypted secrets in Redis (temporary) or in database
    const envKey = `env:${project.id}:${environment}`;
    
    // Store secrets (encrypted)
    await redis.set(envKey, JSON.stringify(secrets), { EX: 86400 * 7 }); // 7 days

    // If first push, store the encrypted project key
    if (encryptedProjectKey) {
      await redis.set(`project_key:${project.id}`, encryptedProjectKey, { EX: 86400 * 365 });
    }

    return NextResponse.json({
      success: true,
      message: `Secrets pushed for ${environment}`,
      environment,
      secretsCount: secrets.length
    });

  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}