import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const user = await prisma.user.findFirst({
      where: { id: (request as any).userId } // In a real app, get from verified token
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // --- NEW LOGIC: Check Team Limit 🌸 ---
    const maxTeams = 1; // Simplified: User always has 1 free team slot. 🌸
    const currentTeams = await prisma.team.count({ where: { ownerId: user.id } });

    if (currentTeams >= maxTeams) {
        return NextResponse.json({ 
            error: `You reached your team limit (${maxTeams}). Buy more slots with 'envw purchase teams'. 🌸🚀` 
        }, { status: 403 });
    }

    const slug = name.toLowerCase().replace(/ /g, '-');
    const team = await prisma.team.create({
      data: {
        name,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return NextResponse.json(team);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}