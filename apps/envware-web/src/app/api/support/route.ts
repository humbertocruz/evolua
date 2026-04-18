import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        email,
        message,
      },
    });

    return NextResponse.json({ success: true, id: supportMessage.id });
  } catch (error: any) {
    console.error('Support API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
