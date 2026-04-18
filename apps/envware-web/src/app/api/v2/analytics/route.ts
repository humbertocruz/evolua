import { NextResponse } from 'next/server';
import { trackEvent } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');

    if (!event) {
      return NextResponse.json({ success: false, error: 'Missing event' }, { status: 400 });
    }

    // Apenas permitimos eventos específicos para evitar spam no banco
    const allowedEvents = ['landing_view', 'docs_view', 'install_script'];
    if (!allowedEvents.includes(event)) {
      return NextResponse.json({ success: false, error: 'Invalid event' }, { status: 400 });
    }

    await trackEvent(event);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
