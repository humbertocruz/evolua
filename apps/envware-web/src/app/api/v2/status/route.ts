import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, projectSlug } = data;

    if (!publicKey || !signature || !teamSlug) {
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

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

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

    // Função auxiliar para gerar Fingerprint
    const getFP = (pub: string) => {
      const parts = pub.trim().split(' ');
      const keyData = parts.length > 1 ? parts[1] : parts[0];
      const binaryKey = Buffer.from(keyData, 'base64');
      return crypto.createHash('sha256').update(binaryKey).digest('base64').replace(/=+$/, '');
    };

    if (projectSlug) {
      const project = team.projects.find(p => p.slug === projectSlug);
      if (!project) return NextResponse.json({ success: false, error: `Project '${projectSlug}' not found` }, { status: 404 });

      return NextResponse.json({
        success: true,
        project: {
          name: project.name,
          slug: project.slug,
          usersUsed: project.members.length,
          maxUsers: team.maxUsersPerProject,
          users: project.members.map(m => {
            const primaryKey = m.user.sshKeys[0]?.publicKey || '';
            return {
              name: m.user.name || 'Anonymous',
              email: m.user.email,
              device: m.user.sshKeys.find(k => k.userId === m.userId)?.name || 'Unknown',
              fingerprint: `SHA256:${getFP(primaryKey)}`,
              role: m.role,
              isCurrent: m.userId === user.id
            };
          })
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
        projects: team.projects.map(p => ({ name: p.name, slug: p.slug, usersCount: p.members.length }))
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
