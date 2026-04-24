import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/v2/projects/init - Initialize project from git remote
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, remoteUrl } = data;

    if (!publicKey || !signature || !remoteUrl) {
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

    // Find or create user
    let user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } } });
    
    if (!user) {
      // Create user with Personal team
      user = await prisma.user.create({
        data: {
          email: `user-${publicKey.slice(0, 8)}@envware.local`,
          name: 'New User',
        }
      });

      // Create personal team
      await prisma.team.create({
        data: {
          name: 'Personal',
          slug: `personal-${publicKey.slice(0, 8)}`,
          ownerId: user.id,
          members: {
            create: { userId: user.id, role: 'OWNER' }
          }
        }
      });
    }

    // Check if project exists by remote URL
    const existingProject = await prisma.project.findFirst({
      where: { gitUrl: remoteUrl },
      include: { team: { include: { members: true } } }
    });

    if (existingProject) {
      // Check if user has access
      const membership = existingProject.team.members.find(m => m.userId === user.id);
      if (membership) {
        return NextResponse.json({
          success: true,
          message: `Project already linked: ${existingProject.name}`,
          teamSlug: existingProject.team.slug,
          projectSlug: existingProject.slug,
          projectName: existingProject.name
        });
      }
      return NextResponse.json({
        success: false,
        message: 'Project exists but you have no access. Request access first.'
      }, { status: 403 });
    }

    // Extract repo name from URL
    const repoName = remoteUrl.split('/').pop()?.replace('.git', '') || 'untitled';
    const slug = repoName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Get user's personal team
    const personalTeam = await prisma.team.findFirst({
      where: { ownerId: user.id, members: { some: { role: 'OWNER' } } }
    });

    if (!personalTeam) {
      return NextResponse.json({ success: false, message: 'No team found' }, { status: 500 });
    }

    // Count projects in team
    const projectCount = await prisma.project.count({ where: { teamId: personalTeam.id } });

    // Check limits (FREE: 3 projects)
    if (projectCount >= 3) {
      return NextResponse.json({
        success: false,
        message: 'Project limit reached. Purchase more project packs to create new projects.',
        limitReached: 'projects'
      }, { status: 403 });
    }

    // Create new project
    const project = await prisma.project.create({
      data: {
        name: repoName,
        slug: slug,
        teamId: personalTeam.id,
        gitUrl: remoteUrl
      },
      include: { team: true }
    });

    return NextResponse.json({
      success: true,
      message: `Project created: ${project.name}`,
      teamSlug: project.team.slug,
      projectSlug: project.slug,
      projectName: project.name
    });

  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}