import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pairingId = searchParams.get('pairingId')
    if (!pairingId) {
      return NextResponse.json({ success: false, error: 'Missing pairingId' }, { status: 400 })
    }

    const raw = await redis.get(`web_pair:${pairingId}`)
    if (!raw) {
      return NextResponse.json({ success: false, error: 'Pairing not found or expired' }, { status: 404 })
    }

    const pair = JSON.parse(raw)
    return NextResponse.json({
      success: true,
      pairingId: pair.pairingId,
      code: pair.code,
      status: pair.status,
      expiresAt: pair.expiresAt,
      deviceId: pair.deviceId || null,
      bootstrapToken: pair.bootstrapToken || null,
      nextPath: pair.nextPath || '/admin',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
