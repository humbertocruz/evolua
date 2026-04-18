import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth/get-verified-user';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

const PRICE_PROJECT_PACK = process.env.STRIPE_PRICE_PROJECT_PACK || 'price_dummy_projects';
const PRICE_USER_PACK = process.env.STRIPE_PRICE_USER_PACK || 'price_dummy_users';
const PRICE_TEAM_PACK = process.env.STRIPE_PRICE_TEAM_PACK || 'price_dummy_teams';
const PRICE_LOCAL_PACK = process.env.STRIPE_PRICE_LOCAL_PACK || 'price_dummy_local';

export async function POST(request: Request) {
  try {
    const verifiedUser = await getVerifiedUser(request);
    if (!verifiedUser || 'error' in verifiedUser) {
      return NextResponse.json({ success: false, error: verifiedUser?.error || 'Unauthorized' }, { status: 401 });
    }

    const user = verifiedUser as any;
    
    // Bloquear compras para usuários sem e-mail configurado (Ghost Users) 🌸🛡️
    if (user.email.startsWith('ghost_') && user.email.endsWith('@envware.dev')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please set your email before making a purchase. Run: envw set-email <your@email.com> 🌸' 
      }, { status: 400 });
    }

    const data = await request.json();
    const { category, action, teamSlug, projectSlug, quantity = '1' } = data;
    const qty = parseInt(quantity) || 1;

    if (!category || !action) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // PRICE SELECTION
    let priceId = '';
    if (category === 'users') priceId = PRICE_USER_PACK;
    else if (category === 'projects') priceId = PRICE_PROJECT_PACK;
    else if (category === 'teams') priceId = PRICE_TEAM_PACK;
    else if (category === 'local') priceId = PRICE_LOCAL_PACK;
    else if (category === 'pro') priceId = process.env.STRIPE_PRICE_PRO_PLAN || '';
    else return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });

    if (category === 'pro' && !priceId) {
        return NextResponse.json({ success: false, error: 'Pro Plan price ID not configured' }, { status: 500 });
    }

    // --- CASE: TEAMS (Account level) ---
    if (category === 'teams') {
        const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.envware.dev';
        
        // Simplified: removed database-side subscription tracking 🌸
        if (action === 'sub') {
            return NextResponse.json({ success: false, error: 'To reduce team slots, please manage your subscription via the Stripe Customer Portal.' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: qty }],
            success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/?canceled=true`,
            metadata: { userId: user.id, category: 'teams' },
            customer_email: user.email,
        });
        return NextResponse.json({ success: true, paymentUrl: session.url, message: 'Checkout link generated! 🌸' });
    }

    // --- CASE: USERS/PROJECTS (Team level) ---
    if (!teamSlug) return NextResponse.json({ success: false, error: 'Team slug required' }, { status: 400 });
    const team = await prisma.team.findUnique({ 
      where: { slug: teamSlug },
      include: { projects: { include: { members: true } } }
    });
    if (!team) return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    if (team.ownerId !== user.id) return NextResponse.json({ success: false, error: 'Only OWNER can manage team billing' }, { status: 403 });

    if (action === 'sub') {
      if (!team.stripeSubscriptionId) return NextResponse.json({ success: false, error: 'No active subscription' }, { status: 400 });
      const subscription = await stripe.subscriptions.retrieve(team.stripeSubscriptionId);
      const item = subscription.items.data.find(i => i.price.id === priceId && (category !== 'users' || i.metadata.projectSlug === projectSlug));
      if (!item) return NextResponse.json({ success: false, error: 'No pack found' }, { status: 400 });

      if (category === 'users' && projectSlug) {
        const project = team.projects.find(p => p.slug === projectSlug);
        const newMax = (project?.maxUsers || team.maxUsersPerProject) - 10;
        if (newMax < 5 || (project && project.members.length > newMax)) return NextResponse.json({ success: false, error: 'Cannot reduce: active users exceed new limit' }, { status: 400 });
      } else if (category === 'projects') {
        const newMax = team.maxProjects - 5;
        if (newMax < 3 || team.projects.length > newMax) return NextResponse.json({ success: false, error: 'Cannot reduce: active projects exceed new limit' }, { status: 400 });
      } else if (category === 'local') {
          // Local mode is usually a permanent unlock or requires specific handling to remove
          // For now let's allow removing it if desired
      }

      if (item.quantity === 1 && subscription.items.data.length === 1) await stripe.subscriptions.cancel(team.stripeSubscriptionId);
      else if (item.quantity === 1) await stripe.subscriptionItems.del(item.id);
      else await stripe.subscriptionItems.update(item.id, { quantity: item.quantity! - 1, proration_behavior: 'always_invoice' });

      return NextResponse.json({ success: true, message: `Pack removed! 🌸` });
    }

    // ADD PACK
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://www.envware.dev';
    if (team.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(team.stripeSubscriptionId);
        const item = subscription.items.data.find(i => i.price.id === priceId && (category === 'projects' || category === 'pro' ? true : i.metadata.projectSlug === projectSlug));
        if (item) await stripe.subscriptionItems.update(item.id, { quantity: (item.quantity || 0) + qty, proration_behavior: 'always_invoice' });
        else await stripe.subscriptionItems.create({ subscription: team.stripeSubscriptionId, price: priceId, quantity: qty, metadata: { projectSlug: projectSlug || '' } });
        return NextResponse.json({ success: true, message: `${qty} Pack(s) added to team! 🌸🚀` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: qty }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: { userId: user.id, teamId: team.id, category, projectSlug: projectSlug || '' },
      customer_email: user.email,
    });
    return NextResponse.json({ success: true, paymentUrl: session.url, message: 'Checkout link generated! 🌸🚀' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}