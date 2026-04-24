import { NextResponse } from 'next/server';
import { getAuthorizedUser } from '@/lib/auth/get-user';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
  });
}

export async function POST(request: Request) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Versão mínima para pagamentos também
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  try {
    const { plan } = await request.json();
    const priceAmount = 1000;

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    let stripeCustomerId = dbUser?.asaasCustomerId;

    const isValidStripeId = stripeCustomerId?.startsWith('cus_') && /[a-zA-Z]/.test(stripeCustomerId.replace('cus_', ''));

    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.envware.dev';

    // Stripe checkout session parameters
    const params: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Envware Premium',
              description: 'Upgrade to Premium Plan (100 Projects, 3 Teams)',
            },
            unit_amount: priceAmount,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    };

    // Só adicionamos customer ou email se não forem null/undefined
    if (isValidStripeId && stripeCustomerId) {
      params.customer = stripeCustomerId;
    } else {
      params.customer_email = user.email;
    }

    const session = await getStripe().checkout.sessions.create(params);

    return NextResponse.json({
      checkoutUrl: session.url,
    });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user: any = await getAuthorizedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (user.error === 'CLI_UPDATE_REQUIRED') {
    return NextResponse.json({ error: user.message }, { status: 426 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { ownedTeams: { where: { stripeSubscriptionId: { not: null } } } }
    });

    const activeTeamWithSub = dbUser?.ownedTeams[0];

    if (!activeTeamWithSub || !activeTeamWithSub.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No active team subscription found to cancel.' }, { status: 404 });
    }

    await getStripe().subscriptions.cancel(activeTeamWithSub.stripeSubscriptionId);

    await prisma.team.update({
        where: { id: activeTeamWithSub.id },
        data: { 
            stripeSubscriptionId: null,
            isPremium: false
        }
    });

    return NextResponse.json({ message: 'Subscription cancelled successfully.' });

  } catch (error: any) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
