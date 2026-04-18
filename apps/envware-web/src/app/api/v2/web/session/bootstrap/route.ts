import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const token = searchParams.get('token')
    const nextPath = searchParams.get('next') || '/admin'

    if (!token) {
      return NextResponse.redirect(`${origin}/docs`)
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const raw = await redis.get(`web_bootstrap:${tokenHash}`)
    if (!raw) {
      return NextResponse.redirect(`${origin}/docs`)
    }

    const payload = JSON.parse(raw)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex')
    const now = Date.now()
    const session = {
      sessionId: crypto.randomUUID(),
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      deviceId: payload.deviceId,
      scope: 'control_surface',
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      lastSeenAt: new Date(now).toISOString(),
    }

    await redis.set(`web_session:${sessionHash}`, JSON.stringify(session), { EX: 86400 })
    await redis.del(`web_bootstrap:${tokenHash}`)

    const response = NextResponse.redirect(`${origin}${nextPath}`)
    response.cookies.set('envware_web_session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return response
  } catch {
    return NextResponse.redirect(new URL('/docs', request.url))
  }
}
