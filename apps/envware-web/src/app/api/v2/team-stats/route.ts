import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug } = data;

    if (!publicKey || !signature) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);

    if (!challenge) return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 });

    // 1. Invisible Auth
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

    if (!isVerified) return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });

    await redis.del(challengeKey);

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (!teamSlug) {
      const userTeams = await prisma.team.findMany({
        where: { members: { some: { userId: user.id } } },
        include: { projects: true }
      });

      return NextResponse.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          teams: userTeams.map(t => ({
            name: t.name,
            slug: t.slug,
            projectsCount: t.projects.length,
            role: t.ownerId === user.id ? 'OWNER' : 'MEMBER'
          }))
        }
      });
    }

    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      include: { 
        members: { include: { user: { include: { sshKeys: true } } } },
        projects: { include: { members: { include: { user: { include: { sshKeys: true } } } } } },
        owner: true
      }
    });

    if (!team) return NextResponse.json({ success: false, error: `Team '${teamSlug}' not found` }, { status: 404 });

    const isTeamMember = team.members.some(m => m.userId === user.id);
    if (!isTeamMember) return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });

    const getFingerprint = (publicKey: string) => {
        const parts = publicKey.trim().split(' ');
        const keyData = parts.length > 1 ? parts[1] : parts[0];
        const binaryKey = Buffer.from(keyData, 'base64');
        const fp = crypto.createHash('sha256').update(binaryKey).digest('base64').replace(/=+$/, '');
        return `SHA256:${fp}`;
    };

    if (projectSlug) {
      const project = team.projects.find(p => p.slug === projectSlug);
      if (!project) return NextResponse.json({ success: false, error: `Project '${projectSlug}' not found` }, { status: 404 });

      // Calculate project specific max users or team default
      const projectMaxUsers = project.maxUsers || team.maxUsersPerProject;

      return NextResponse.json({
        success: true,
        project: {
          name: project.name,
          slug: project.slug,
          usersUsed: project.members.length,
          maxUsers: projectMaxUsers,
          hasLocalMode: true,
          users: project.members.map(m => ({ 
            email: m.user.email, 
            role: m.role,
            isCurrent: m.userId === user.id,
            fingerprint: m.user.sshKeys.length > 0 ? getFingerprint(m.user.sshKeys[0].publicKey) : null
          }))
        }
      });
    }

    return NextResponse.json({
      success: true,
      team: {
        name: team.name,
        slug: team.slug,
        isPremium: team.isPremium,
        maxProjects: team.maxProjects,
        projectsCount: team.projects.length,
        maxUsersPerProject: team.maxUsersPerProject,
        ownerEmail: team.owner.email,
        projects: team.projects.map(p => ({
          name: p.name,
          slug: p.slug,
          usersCount: p.members.length
        })),
        members: team.members.map(m => ({
          email: m.user.email,
          role: m.role,
          fingerprint: m.user.sshKeys.length > 0 ? getFingerprint(m.user.sshKeys[0].publicKey) : null
        }))
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}