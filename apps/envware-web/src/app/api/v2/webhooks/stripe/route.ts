import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[STRIPE WEBHOOK] Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  console.log(`[STRIPE WEBHOOK] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`[STRIPE WEBHOOK] Processing Error: ${error.message}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { userId, teamId, category, projectSlug } = session.metadata || {};
  if (!userId || !category) return;

  const subscriptionId = session.subscription as string;

  if (teamId && subscriptionId) {
    // Team Specific Subscription (Projects or Users)
    await prisma.team.update({
        where: { id: teamId },
        data: { 
            stripeSubscriptionId: subscriptionId,
            isPremium: true
        }
    });
  }
  
  // Trigger immediate sync of limits if it's a subscription
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdated(subscription);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  const { teamId } = subscription.metadata || {};
  const status = subscription.status;

  if (teamId) {
    // Update Team Limits based on subscription items
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return;

    let maxProjects = 3; // Base FREE
    let maxUsersPerProject = 5; // Base FREE

    if (status === 'active' || status === 'trialing') {
      for (const item of subscription.items.data) {
        const priceId = item.price.id;
        const quantity = item.quantity || 0;

        if (priceId === process.env.STRIPE_PRICE_PROJECT_PACK) {
          maxProjects += quantity * 5;
        } else if (priceId === process.env.STRIPE_PRICE_USER_PACK) {
          // If metadata has projectSlug, it's a specific project upgrade
          if (item.metadata.projectSlug) {
            await prisma.project.updateMany({
              where: { teamId, slug: item.metadata.projectSlug },
              data: { maxUsers: 5 + (quantity * 10) }
            });
          } else {
            maxUsersPerProject += quantity * 10;
          }
        } else if (priceId === process.env.STRIPE_PRICE_PRO_PLAN) {
           // Pro Plan active, isPremium is handled below by subscription status
        }
      }
    }

    await prisma.team.update({
      where: { id: teamId },
      data: { 
        maxProjects, 
        maxUsersPerProject,
        isPremium: status === 'active' || status === 'trialing'
      }
    });
  }
}
