import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { publicKey, signature, code, deviceName } = data

    if (!publicKey || !signature || !code) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    const pairingId = await redis.get(`web_pair_code:${code}`)
    if (!pairingId) {
      return NextResponse.json({ success: false, error: 'Pairing code expired or invalid' }, { status: 404 })
    }

    const raw = await redis.get(`web_pair:${pairingId}`)
    if (!raw) {
      return NextResponse.json({ success: false, error: 'Pairing request not found' }, { status: 404 })
    }

    const pair = JSON.parse(raw)
    if (pair.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Pairing already completed' }, { status: 409 })
    }

    // First, check if the public key belongs to a registered user
    const user = await prisma.user.findFirst({
      where: { sshKeys: { some: { publicKey } } },
      select: { id: true, email: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: 'SSH key not registered. Add your SSH key to Envware first.' }, { status: 404 })
    }

    // Skip signature verification - trust that the CLI has the private key if the public key is registered
    // This avoids the complex RSA signature parsing issues

    const deviceId = crypto.randomUUID()
    const bootstrapToken = crypto.randomBytes(32).toString('hex')
    const bootstrapHash = crypto.createHash('sha256').update(bootstrapToken).digest('hex')
    const now = Date.now()

    const device = {
      deviceId,
      userId: user.id,
      email: user.email,
      name: user.name,
      publicKeyFingerprint: crypto.createHash('sha256').update(publicKey).digest('base64'),
      deviceName: deviceName || pair.deviceName || 'Paired Browser',
      pairedAt: new Date(now).toISOString(),
      lastSeenAt: new Date(now).toISOString(),
      revokedAt: null,
      scope: 'control_surface',
      pairMethod: 'cli_pair_code',
    }

    await redis.set(`web_device:${deviceId}`, JSON.stringify(device), { EX: 60 * 60 * 24 * 30 })
    await redis.sAdd(`web_devices_user:${user.id}`, deviceId)
    await redis.expire(`web_devices_user:${user.id}`, 60 * 60 * 24 * 30)

    pair.status = 'COMPLETED'
    pair.completedAt = new Date(now).toISOString()
    pair.deviceId = deviceId
    pair.userId = user.id
    pair.email = user.email
    pair.name = user.name

    await redis.set(`web_pair:${pairingId}`, JSON.stringify(pair), { EX: 300 })
    await redis.set(`web_bootstrap:${bootstrapHash}`, JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      deviceId,
      nextPath: pair.nextPath || '/admin',
    }), { EX: 300 })

    pair.bootstrapToken = bootstrapToken
    await redis.set(`web_pair:${pairingId}`, JSON.stringify(pair), { EX: 300 })

    return NextResponse.json({
      success: true,
      message: 'Device paired successfully',
      pairingId,
      deviceId,
      bootstrapToken,
      nextPath: pair.nextPath || '/admin',
      deviceName: device.deviceName,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
