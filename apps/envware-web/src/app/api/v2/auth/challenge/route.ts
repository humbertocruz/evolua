import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { publicKey } = await request.json();

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    // Gerar um desafio aleatório
    const challenge = crypto.randomBytes(32).toString('hex');
    
    // Armazenar o desafio no Redis usando a chave pública como ID por 2 minutos
    const key = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
    await redis.set(key, challenge, { EX: 120 });

    return NextResponse.json({ challenge });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
