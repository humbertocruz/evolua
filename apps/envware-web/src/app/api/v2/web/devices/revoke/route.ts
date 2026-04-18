import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { publicKey, signature, deviceId } = data

    if (!publicKey || !signature || !deviceId) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const challengeHashId = crypto.createHash('sha256').update(publicKey).digest('hex')
    const challengeKey = `v2_challenge:${challengeHashId}`
    const challenge = await redis.get(challengeKey)
    if (!challenge) return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 })

    const host = request.headers.get('host') || 'www.envware.dev'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const verifyResp = await fetch(`${protocol}://${host}/api/v2/auth/verify-go`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey, signature, challenge }),
    })
    const verifyData = await verifyResp.json()
    if (!verifyData.verified) return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 })
    await redis.del(challengeKey)

    const user = await prisma.user.findFirst({ where: { sshKeys: { some: { publicKey } } }, select: { id: true } })
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    const raw = await redis.get(`web_device:${deviceId}`)
    if (!raw) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })

    const device = JSON.parse(raw)
    if (device.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Permission denied' }, { status: 403 })
    }

    device.revokedAt = new Date().toISOString()
    await redis.set(`web_device:${deviceId}`, JSON.stringify(device), { EX: 60 * 60 * 24 * 7 })

    return NextResponse.json({ success: true, message: 'Device revoked successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
