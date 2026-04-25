import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST /api/v2/projects/link - Link git repo to team (create if not exists)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { publicKey, signature, teamSlug, gitUrl } = data;

    if (!publicKey || !signature || !teamSlug || !gitUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields: publicKey, signature, teamSlug, gitUrl' }, { status: 400 });
    }

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
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

    // Buscar o time
    const team = await prisma.team.findFirst({
      where: { 
        slug: teamSlug,
        members: { some: { userId: user.id } }
      }
    });

    if (!team) return NextResponse.json({ success: false, error: 'Team not found or you are not a member' }, { status: 404 });

    // Verificar se projeto já existe com essa URL
    const existingProject = await prisma.project.findFirst({
      where: { gitUrl }
    });

    if (existingProject) {
      // Se já existe, verificar se o usuário tem acesso
      const membership = await prisma.teamMember.findFirst({
        where: { teamId: existingProject.teamId, userId: user.id }
      });

      if (!membership) {
        return NextResponse.json({ 
          success: false, 
          error: `Project already exists in another team. Request access to ${existingProject.team.slug}/${existingProject.slug}` 
        }, { status: 403 });
      }

      // Já vinculado - só confirmar
      return NextResponse.json({ 
        success: true, 
        message: `Project ${existingProject.team.slug}/${existingProject.slug} already linked to this repo. 🌸`,
        teamSlug: existingProject.team.slug,
        projectSlug: existingProject.slug
      });
    }

    // Criar novo projeto no team
    const repoName = gitUrl.split('/').pop()?.replace('.git', '') || 'untitled';
    const slug = repoName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Verificar limite de projetos
    const projectCount = await prisma.project.count({ where: { teamId: team.id } });
    // TODO: Verificar limite baseado no tier do time

    const project = await prisma.project.create({
      data: {
        name: repoName,
        slug: slug,
        teamId: team.id,
        gitUrl
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Project ${teamSlug}/${slug} created and linked to Git! 🌸🚀`,
      teamSlug: teamSlug,
      projectSlug: slug
    });

  } catch (error: any) {
    console.error('Link error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}