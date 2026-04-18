import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { signToken } from '@/lib/auth/jwt';
import * as nodeCrypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, signature } = await request.json();
    const key = `auth_challenge:${email}`;
    const challenge = await redis.get(key);

    if (!challenge) return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { sshKeys: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let verified = false;

    for (const sshKey of user.sshKeys) {
      try {
        const publicKeyRaw = sshKey.publicKey.trim();
        let publicKey: nodeCrypto.KeyObject;

        // Se tivermos a chave já convertida para PEM no banco (signup novo), usamos ela direto.
        // O campo 'verificationCode' agora guarda o PEM PKCS8.
        if (sshKey.verificationCode && sshKey.verificationCode.includes('BEGIN PUBLIC KEY')) {
          publicKey = nodeCrypto.createPublicKey(sshKey.verificationCode);
        } else {
          // Fallback para usuários antigos: tentar converter na hora (PEM manual)
          if (publicKeyRaw.startsWith('ssh-rsa')) {
            const keyData = publicKeyRaw.split(' ')[1];
            const pemKey = `-----BEGIN PUBLIC KEY-----\n${keyData.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
            publicKey = nodeCrypto.createPublicKey(pemKey);
          } else {
            // Se não for RSA, tenta carregar direto (pode falhar no Vercel se for SSH puro)
            publicKey = nodeCrypto.createPublicKey(publicKeyRaw);
          }
        }

        verified = nodeCrypto.verify(
          'RSA-SHA256',
          Buffer.from(challenge),
          publicKey,
          Buffer.from(signature, 'base64')
        );

        if (verified) break;
      } catch (e) {
        console.error('[AUTH] Erro na verificação:', e instanceof Error ? e.message : e);
      }
    }

    if (!verified) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    await redis.del(key);
    const token = signToken({ email: user.email, sub: user.id });
    return NextResponse.json({ access_token: token });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
