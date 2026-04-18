import { prisma } from '@/lib/prisma';

export async function trackEvent(event: string) {
  try {
    await prisma.analytic.upsert({
      where: { event },
      update: { count: { increment: 1 } },
      create: { event, count: 1 }
    });
  } catch (error) {
    console.error(`[ANALYTICS] Error tracking ${event}:`, error);
  }
}
