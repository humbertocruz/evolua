import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/v2/user/status - Get user status
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature } = data;

    if (!publicKey || !signature) {
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
    const user = await prisma.user.findFirst({ 
      where: { sshKeys: { some: { publicKey } } },
      include: {
        memberships: {
          include: {
            team: {
              include: {
                projects: {
                  include: {
                    members: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Calculate fingerprint
    const parts = publicKey.split(' ');
    const keyData = parts.length > 1 ? parts[1] : parts[0];
    const der = Buffer.from(keyData, 'base64');
    const hash = crypto.createHash('sha256').update(der).digest('base64');

    // Build response
    const teams = [];
    let isOwner = false;

    for (const tm of user.memberships) {
      const team = tm.team;
      const projects = [];

      for (const proj of team.projects) {
        const membership = proj.members.find(m => m.userId === user.id);
        if (membership) {
          projects.push({
            name: proj.name,
            slug: proj.slug,
            role: membership.role
          });
          if (membership.role === 'OWNER') {
            isOwner = true;
          }
        }
      }

      if (projects.length > 0) {
        teams.push({
          name: team.name,
          slug: team.slug,
          projects
        });
      }
    }

    // Get billing info (if owner)
    let billing = null;
    if (isOwner) {
      const allTeams = await prisma.team.findMany({
        where: { ownerId: user.id },
        include: { projects: true, members: true }
      });

      const teamsUsed = allTeams.length;
      let projectsUsed = 0;
      let usersUsed = 0;

      for (const t of allTeams) {
        projectsUsed += t.projects.length;
        usersUsed += t.members.length;
      }

      // FREE tier: 1 team, 3 projects, 3 users
      billing = {
        teamsUsed,
        teamsLimit: 1,
        projectsUsed,
        projectsLimit: 3,
        usersUsed,
        usersLimit: 3
      };
    }

    return NextResponse.json({
      success: true,
      fingerprint: hash,
      isOwner,
      teams,
      billing
    });

  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}