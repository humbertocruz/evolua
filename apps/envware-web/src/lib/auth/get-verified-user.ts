// src/lib/auth/get-verified-user.ts
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import * as crypto from 'crypto';

/**
 * Authenticates a user from a CLI request based on public key and signature.
 * This is a self-contained function to be used in API routes.
 * @param request The incoming Request object.
 * @returns The user object from Prisma or an error object.
 */
export async function getVerifiedUser(request: Request) {
  const data = await request.clone().json();
  const { publicKey, signature } = data;

  if (!publicKey || !signature) {
    return { error: 'Missing publicKey or signature' };
  }

  const challengeKey = `v2_challenge:${crypto.createHash('sha256').update(publicKey).digest('hex')}`;
  const challenge = await redis.get(challengeKey);
  if (!challenge) {
    return { error: 'Challenge expired or invalid' };
  }

  // Use internal fetch to call the verification endpoint
  const host = request.headers.get('host') || 'www.envware.dev';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const verifyResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicKey, signature, challenge })
  });
  
  const verifyData = await verifyResp.json();
  if (!verifyData.verified) {
    return { error: 'Invalid signature' };
  }

  // If signature is valid, clean up challenge and find user
  await redis.del(challengeKey);

  const user = await prisma.user.findFirst({
    where: { sshKeys: { some: { publicKey } } },
  });

  if (!user) {
    return { error: 'User not found for the given public key' };
  }

  return user;
}
