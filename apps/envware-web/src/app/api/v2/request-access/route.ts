import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';
import { getAuthorizedUser } from '@/lib/auth/get-user';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
  });
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      publicKey, 
      signature, 
      teamSlug, 
      projectSlug, 
      role = 'DEVELOPER',
      userName,
      deviceAlias
    } = data;

    if (!publicKey || !signature || !teamSlug || !projectSlug || !userName) {
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

    const authorizedUser: any = await getAuthorizedUser();

    let user = await prisma.user.findFirst({
      where: { sshKeys: { some: { publicKey } } },
      include: { sshKeys: true }
    });

    if (!user && authorizedUser?.id) {
       user = await prisma.user.findUnique({ where: { id: authorizedUser.id }, include: { sshKeys: true } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: `ghost_${Date.now()}@envware.dev`,
          name: userName,
          sshKeys: { 
            create: { 
              publicKey, 
              name: deviceAlias || 'Primary Device',
              isVerified: true 
            } 
          }
        },
        include: { sshKeys: true }
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { name: userName } });
    }

    const isOwnerRole = role === 'OWNER';

    let team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      include: { members: true }
    });

    if (!team && isOwnerRole) {
      // Regra de Negócio 2.0: Mesma chave (usuário) só pode criar Teams conforme seu limite de Subscription
      const userTeamsCount = await prisma.team.count({
        where: { ownerId: user.id }
      });

      let maxOwnedTeams = 1; // Base FREE (Simplificado para remover a model Subscription) 🌸
      if (user.subscriptionStatus === 'PREMIUM') maxOwnedTeams = 3;

      if (userTeamsCount >= maxOwnedTeams) {
        return NextResponse.json({ 
          success: false, 
          error: `Account limit reached: You can only own ${maxOwnedTeams} Team(s). Purchase more slots to create more! 🌸` 
        }, { status: 403 });
      }

      const { isBlacklisted } = await import('@/lib/blacklist');
      const needsVerification = isBlacklisted(teamSlug);

      team = await prisma.team.create({
        data: {
          name: teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1),
          slug: teamSlug,
          ownerId: user.id,
          isVerified: !needsVerification,
          verificationNote: needsVerification ? 'Team under verification due to brand name policy.' : null,
          maxProjects: (user.subscriptionStatus === 'PREMIUM') ? 100 : 10,
          maxUsersPerProject: (user.subscriptionStatus === 'PREMIUM') ? 15 : 3,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER'
            }
          }
        },
        include: { members: true }
      });
    } else if (!team) {
      return NextResponse.json({ success: false, error: `Team '${teamSlug}' does not exist.` }, { status: 404 });
    }

    let project = await prisma.project.findUnique({
      where: { teamId_slug: { teamId: team.id, slug: projectSlug } },
      include: { members: true }
    });

    if (!project) {
        const teamMembership = team.members.find(m => m.userId === user.id);
        const canCreate = teamMembership?.role === 'OWNER' || team.ownerId === user.id;

        if (canCreate) {
            // Regra de Negócio 2.0: Limite dinâmico de projetos por Team
            const projectCount = await prisma.project.count({
                where: { teamId: team.id }
            });

            if (projectCount >= team.maxProjects) {
                return NextResponse.json({ 
                    success: false, 
                    error: `Team limit reached: '${team.slug}' can only have ${team.maxProjects} projects. Upgrade to unlock more! 🚀` 
                }, { status: 403 });
            }

            project = await prisma.project.create({
                data: {
                    name: projectSlug.charAt(0).toUpperCase() + projectSlug.slice(1),
                    slug: projectSlug,
                    teamId: team.id,
                    members: { connect: { id: teamMembership?.id || (await prisma.teamMember.findFirst({where: {teamId: team.id, userId: user.id}}))?.id } }
                },
                include: { members: true }
            });

            // Se for OWNER criando o projeto, já podemos tentar inicializar o ProjectKey
            if (isOwnerRole) {
                const newProjectKey = crypto.randomBytes(32).toString('hex');
                let encryptedProjectKey: string;
                try {
                    // Usar a ponte de verificação para encriptar corretamente para SSH Key 🌸
                    const encryptResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ publicKey, plainText: newProjectKey })
                    });
                    
                    const encryptData = await encryptResp.json();
                    if (!encryptData.success) throw new Error('Encryption bridge failed');

                    encryptedProjectKey = encryptData.encryptedData;

                    await prisma.projectKey.create({
                        data: {
                            projectId: project.id,
                            userId: user.id,
                            encryptedProjectKey
                        }
                    });
                    
                    return NextResponse.json({ 
                        success: true, 
                        message: `Bazinga! Project '${projectSlug}' created and E2EE initialized. 🚀🌸` 
                    });
                } catch(e) {
                    console.error('Initial E2EE failed:', e);
                    return NextResponse.json({ 
                        success: true, 
                        message: `Project '${projectSlug}' created! Now run 'push' to initialize E2EE. 🚀` 
                    });
                }
            }
        } else {
            return NextResponse.json({ success: false, error: `Project '${projectSlug}' not found and you are not an OWNER of team '${teamSlug}' to create it.` }, { status: 403 });
        }
    }

    // Se ele é o dono e pediu pra ser owner, mas o projeto já existia (acima cuidamos do create)
    if (team.ownerId === user.id && isOwnerRole) {
        return NextResponse.json({
           success: true,
           message: 'You are the owner of this team. Project is ready for your push.',
           projectId: project.id
        });
    }

    await prisma.projectRequest.upsert({
      where: { projectId_userId_publicKey: { projectId: project.id, userId: user.id, publicKey: publicKey } },
      update: { role, status: 'PENDING' },
      create: { projectId: project.id, userId: user.id, publicKey: publicKey, role: role, status: 'PENDING' }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Access request for '${projectSlug}' sent! 🌸` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
