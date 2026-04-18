import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth/jwt';

export async function POST(request: Request) {
  try {
    const { email, password, publicKey } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      if (publicKey) {
        let pemPublicKey = null;
        try {
          if (publicKey.startsWith('ssh-rsa')) {
            const keyData = publicKey.split(' ')[1];
            pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${keyData.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
          }
        } catch (e) {}

        await tx.sshKey.create({
          data: {
            userId: newUser.id,
            publicKey: publicKey,
            verificationCode: pemPublicKey,
            isVerified: true,
          },
        });
      }

      const teamSlug = `${email.split('@')[0]}-personal`.toLowerCase().replace(/[^a-z0-9-]/g, '');
      const team = await tx.team.create({
        data: {
          name: 'Personal',
          slug: teamSlug,
          ownerId: newUser.id,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: newUser.id,
          role: 'OWNER',
        },
      });

      const userToken = signToken({ email: newUser.email, sub: newUser.id });
      return { user: newUser, token: userToken };
    });

    return NextResponse.json({
      access_token: result.token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
