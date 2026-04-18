import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function randomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const deviceName = body?.deviceName || 'Browser Session'
    const nextPath = body?.nextPath || '/admin'
    const pairingId = crypto.randomUUID()
    const code = randomCode()
    const challenge = crypto.randomBytes(32).toString('hex')
    const now = Date.now()
    const expiresAt = new Date(now + 5 * 60 * 1000).toISOString()

    const payload = {
      pairingId,
      code,
      challenge,
      status: 'PENDING',
      deviceName,
      nextPath,
      createdAt: new Date(now).toISOString(),
      expiresAt,
    }

    await redis.set(`web_pair:${pairingId}`, JSON.stringify(payload), { EX: 300 })
    await redis.set(`web_pair_code:${code}`, pairingId, { EX: 300 })

    return NextResponse.json({
      success: true,
      pairingId,
      code,
      expiresAt,
      nextPath,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
