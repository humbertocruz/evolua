import crypto from 'crypto'
import { cookies } from 'next/headers'
import { redis } from '@/lib/redis'

export type EnvwareWebSession = {
  sessionId: string
  userId: string
  email: string
  name: string
  deviceId: string
  scope: string
  createdAt: string
  expiresAt: string
  lastSeenAt: string
}

export async function getWebSession(): Promise<EnvwareWebSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('envware_web_session')?.value
  if (!token) return null

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const raw = await redis.get(`web_session:${tokenHash}`)
  if (!raw) return null

  const session = JSON.parse(raw) as EnvwareWebSession
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    await redis.del(`web_session:${tokenHash}`)
    return null
  }

  session.lastSeenAt = new Date().toISOString()
  await redis.set(`web_session:${tokenHash}`, JSON.stringify(session), { EX: 60 * 60 * 24 })
  return session
}
