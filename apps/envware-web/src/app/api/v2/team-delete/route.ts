import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';
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
    const { publicKey, signature, teamSlug } = data;

    if (!publicKey || !signature || !teamSlug) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    const challenge = await redis.get(challengeKey);
    if (!challenge) return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 });

    // 1. Auth
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

    // 2. Lógica de Permissão
    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      include: { projects: true }
    });

    if (!team) return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    if (team.ownerId !== user.id) return NextResponse.json({ success: false, error: 'Only the OWNER can delete a team' }, { status: 403 });

    // 3. Trava de Segurança: Não pode deletar time com projetos ativos
    if (team.projects.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Team '${teamSlug}' has ${team.projects.length} active projects. Delete them first. 🌸` 
      }, { status: 400 });
    }

    // 4. Cancelar Assinaturas do Stripe se existirem
    if (team.stripeSubscriptionId) {
      try {
        await getStripe().subscriptions.cancel(team.stripeSubscriptionId);
      } catch (e) { console.error('Stripe cancel error:', e); }
    }

    // 5. Deletar Time (Cascade cuidará de membros e configurações)
    await prisma.team.delete({
      where: { id: team.id }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Team '${teamSlug}' has been deleted. 🗑️🌸` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
