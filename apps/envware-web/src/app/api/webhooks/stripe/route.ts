import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const PRICE_PROJECT_PACK = process.env.STRIPE_PRICE_PROJECT_PACK || 'price_dummy_projects';
const PRICE_USER_PACK = process.env.STRIPE_PRICE_USER_PACK || 'price_dummy_users';
const PRICE_TEAM_PACK = process.env.STRIPE_PRICE_TEAM_PACK || 'price_dummy_teams';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !webhookSecret) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const teamId = session.metadata?.teamId;
        const category = session.metadata?.category;
        const projectSlug = session.metadata?.projectSlug;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        if (category === 'teams' && userId) {
          await prisma.user.update({ where: { id: userId }, data: { asaasCustomerId: stripeCustomerId } });
        } else if (teamId) {
          if (projectSlug && stripeSubscriptionId) {
            const sub = await getStripe().subscriptions.retrieve(stripeSubscriptionId);
            const firstItem = sub.items.data[0];
            if (firstItem) await getStripe().subscriptionItems.update(firstItem.id, { metadata: { projectSlug } });
          }
          await prisma.team.update({
            where: { id: teamId },
            data: { stripeSubscriptionId, stripeCustomerId, isPremium: true },
          });
          await syncTeamLimits(stripeSubscriptionId, teamId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const team = await prisma.team.findUnique({ where: { stripeSubscriptionId: subscription.id } });
        if (team) {
          await syncTeamLimits(subscription.id, team.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const team = await prisma.team.findUnique({ where: { stripeSubscriptionId: subscription.id } });
        if (team) {
          await prisma.team.update({
            where: { id: team.id },
            data: { stripeSubscriptionId: null, maxProjects: 3, maxUsersPerProject: 5, isPremium: false },
          });
          await prisma.project.updateMany({ where: { teamId: team.id }, data: { maxUsers: null } });
        }
        break;
      }
    }
  } catch (error: any) {
    console.error('Webhook failed:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function syncTeamLimits(subscriptionId: string, teamId: string) {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  let totalProjectSlots = 0;
  const projectUserOverrides: Record<string, number> = {};
  let defaultUserPacks = 0;

  subscription.items.data.forEach(item => {
    if (item.price.id === PRICE_PROJECT_PACK) totalProjectSlots += (item.quantity || 0) * 5;
    else if (item.price.id === PRICE_USER_PACK) {
      const slug = item.metadata.projectSlug;
      if (slug) projectUserOverrides[slug] = (projectUserOverrides[slug] || 0) + (item.quantity || 0) * 10;
      else defaultUserPacks += (item.quantity || 0) * 10;
    }
  });

  await prisma.$transaction(async (tx) => {
    await tx.team.update({
      where: { id: teamId },
      data: { maxProjects: 3 + totalProjectSlots, maxUsersPerProject: 5 + defaultUserPacks, isPremium: true },
    });
    await tx.project.updateMany({ where: { teamId: teamId }, data: { maxUsers: null } });
    for (const [slug, extraUsers] of Object.entries(projectUserOverrides)) {
      await tx.project.update({
        where: { teamId_slug: { teamId, slug } },
        data: { maxUsers: 5 + defaultUserPacks + extraUsers },
      });
    }
  });
}