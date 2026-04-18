import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVerifiedUser } from '@/lib/auth/get-verified-user';

export async function PUT(request: Request) {
  try {
    const user = await getVerifiedUser(request);
    if (!user || 'error' in user) {
      return NextResponse.json({ success: false, error: user?.error || 'Unauthorized' }, { status: 401 });
    }

    const { newEmail } = await request.json();

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail },
    });

    return NextResponse.json({ success: true, message: `Email updated successfully to ${newEmail}! 🌸` });

  } catch (error: any) {
    console.error("Set Email Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
