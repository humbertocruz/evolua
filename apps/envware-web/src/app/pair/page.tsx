'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Copy, LoaderCircle, MonitorSmartphone, ShieldCheck, Smartphone } from 'lucide-react'
import { Header } from '@/components/Header'

type PairResponse = {
  success: boolean
  pairingId: string
  code: string
  expiresAt: string
  nextPath?: string
  error?: string
}

type StatusResponse = {
  success: boolean
  pairingId: string
  code: string
  status: 'PENDING' | 'COMPLETED'
  expiresAt: string
  deviceId?: string | null
  bootstrapToken?: string | null
  nextPath?: string
  error?: string
}

export default function PairPage() {
  const [data, setData] = useState<PairResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paired, setPaired] = useState(false)

  useEffect(() => {
    let alive = true

    async function startPairing() {
      setLoading(true)
      setError(null)

      // Check for existing pairing in localStorage
      const storedPairingId = localStorage.getItem('envware_pairing_id')
      if (storedPairingId) {
        // Check if existing pairing is still valid
        const statusRes = await fetch(`/api/v2/web/pair/status?pairingId=${encodeURIComponent(storedPairingId)}`)
        if (statusRes.ok) {
          const statusJson = (await statusRes.json()) as StatusResponse
          if (statusJson.success && statusJson.status === 'PENDING') {
            // Reuse existing pairing
            setData({
              success: true,
              pairingId: statusJson.pairingId,
              code: statusJson.code,
              expiresAt: statusJson.expiresAt,
              nextPath: statusJson.nextPath,
            })
            setLoading(false)
            return
          } else if (statusJson.success && statusJson.status === 'COMPLETED' && statusJson.bootstrapToken) {
            // Already completed, redirect
            const nextPath = statusJson.nextPath || '/dashboard'
            window.location.href = `/api/v2/web/session/bootstrap?token=${encodeURIComponent(statusJson.bootstrapToken)}&next=${encodeURIComponent(nextPath)}`
            return
          }
        }
      }

      // Start new pairing
      const deviceName = typeof navigator !== 'undefined' ? `${navigator.platform || 'Browser'} device` : 'Browser device'

      const res = await fetch('/api/v2/web/pair/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName, nextPath: '/dashboard' }),
      })
      const json = (await res.json()) as PairResponse
      if (!alive) return

      if (!json.success) {
        setError(json.error || 'Could not start pairing')
        setLoading(false)
        return
      }

      setData(json)
      localStorage.setItem('envware_pairing_id', json.pairingId)
      setLoading(false)
    }

    startPairing()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!data?.pairingId || paired) return

    const interval = setInterval(async () => {
      const res = await fetch(`/api/v2/web/pair/status?pairingId=${encodeURIComponent(data.pairingId)}`)
      if (!res.ok) return
      const json = (await res.json()) as StatusResponse
      if (!json.success) return

      if (json.status === 'COMPLETED' && json.bootstrapToken) {
        setPaired(true)
        const nextPath = json.nextPath || '/dashboard'
        window.location.href = `/api/v2/web/session/bootstrap?token=${encodeURIComponent(json.bootstrapToken)}&next=${encodeURIComponent(nextPath)}`
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [data?.pairingId, paired])

  const shellCommand = useMemo(() => {
    if (!data?.code) return 'envw web pair ABC123'
    return `envw web pair ${data.code}`
  }, [data?.code])

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-zinc-100 selection:bg-emerald-300 selection:text-black">
      <Header />

      <section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#0b0d12_0%,#0b0d12_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <Smartphone size={14} />
              Pair this device with Envware
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
              Use a trusted computer to authorize this browser.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Envware does not create a weaker web login just because a browser showed up. Pair this device with your SSH identity from a trusted machine and continue from there.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#0e1117]">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_0.95fr] lg:px-10">
          <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/70 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-6 flex items-center gap-3 text-emerald-300">
              <MonitorSmartphone size={20} />
              <span className="text-sm font-semibold uppercase tracking-[0.22em]">Pairing code</span>
            </div>

            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center text-zinc-400">
                <LoaderCircle className="mr-3 animate-spin" size={20} />
                Generating pairing session...
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-50">
                {error}
              </div>
            ) : (
              <>
                <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Use this code in Envware CLI</div>
                  <div className="mt-4 text-5xl font-black tracking-[0.22em] text-white md:text-6xl">{data?.code}</div>
                  <div className="mt-4 text-sm text-emerald-100/80">Expires at {data?.expiresAt ? new Date(data.expiresAt).toLocaleTimeString() : '--:--'}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => data?.code && copy(data.code)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 font-semibold text-zinc-100 transition hover:border-zinc-500"
                  >
                    <Copy size={16} />
                    Copy code
                  </button>
                  <button
                    onClick={() => copy(shellCommand)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-4 py-3 font-semibold text-black transition hover:bg-emerald-200"
                  >
                    <Copy size={16} />
                    Copy command
                  </button>
                </div>

                <div className="mt-8 rounded-3xl border border-zinc-800 bg-black/20 p-5 font-mono text-sm text-emerald-300">
                  {shellCommand}
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black/20 p-4 text-zinc-300">
                  {paired ? <CheckCircle2 className="text-emerald-300" size={18} /> : <LoaderCircle className="animate-spin text-zinc-500" size={18} />}
                  <span>{paired ? 'Device paired. Finalizing session...' : 'Waiting for CLI approval...'}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-5 flex items-center gap-3 text-emerald-300">
                <ShieldCheck size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">How it works</span>
              </div>
              <div className="space-y-4 text-zinc-300">
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">1. Open this page on the phone or browser you want to trust.</div>
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">2. Use Envware CLI on a trusted computer to pair this device.</div>
                <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">3. Your SSH identity authorizes the device. No password detour, no weaker parallel auth.</div>
              </div>
            </div>

            <div className="rounded-[32px] border border-amber-400/20 bg-amber-400/10 p-8 text-amber-50">
              <h2 className="text-2xl font-black text-white">Why not email or password?</h2>
              <p className="mt-4 leading-7 text-amber-50/85">
                Because Envware is built around SSH identity as the root of trust. The browser gets a paired session. It does not get to reinvent who you are.
              </p>
            </div>

            <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition hover:text-white">
              Need the docs first? Go there.
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
