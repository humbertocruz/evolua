'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronRight,
  Github,
  GitBranch,
  KeyRound,
  Lock,
  ShieldCheck,
  TerminalSquare,
  Users,
} from 'lucide-react'
import { Header } from '@/components/Header'

const commands = [
  '$ git envware request my-team my-project developer',
  '$ git envware accept req_9fj2k',
  '$ git envware pull',
  '✔ synced the right environment with secure local decryption',
]

const painPoints = [
  'Passing .env files around in chat, email, or random folders',
  'Production access handled by memory, trust, and a prayer',
  'CI, local machines, and teammates drifting out of sync',
  'Onboarding blocked by one hero dev who knows "how it works"',
]

const workflowBenefits = [
  {
    icon: GitBranch,
    title: 'Fits the way developers already work',
    description:
      'Use request, approve, pull, push, encrypt, and decrypt in the terminal and Git flow. git-envware joins the workflow instead of inventing a new religion.',
  },
  {
    icon: Lock,
    title: 'Encrypt locally before anything else',
    description:
      'Secrets are encrypted on your machine before sync. The server should help coordinate access - not become the owner of your soul.',
  },
  {
    icon: KeyRound,
    title: 'Strong approvals with real identity',
    description:
      'Use SSH fingerprint verification to validate who is getting access. Less blind trust, more proof, less "I think this is the right person".',
  },
  {
    icon: Users,
    title: 'Built for teams, projects, and environments',
    description:
      'Keep development, staging, and production separated with granular access per team and project, without turning setup into enterprise theater.',
  },
]

const workflowSteps = [
  'Request the environment or access you need.',
  'Approve access with identity-based verification.',
  'Pull the correct config locally or in CI.',
  'Work with encrypted, repeatable environment flows across the team.',
]

const useCases = [
  {
    title: 'New developer onboarding',
    description: 'Get the right access and pull the right environment without asking three people and waiting half a day.',
  },
  {
    title: 'Sensitive production workflows',
    description: 'Protect critical environments with stronger approval flows instead of informal handoffs and vague trust.',
  },
  {
    title: 'Git-based team collaboration',
    description: 'Version .env.crypto safely and keep environment handling aligned with the workflows developers already trust.',
  },
  {
    title: 'CI and agent execution',
    description: 'Keep automation and AI-assisted workflows connected to the same operational path instead of side-channel hacks.',
  },
]

const workflowProof = [
  'CLI-first',
  'Git-friendly',
  'SSH-based approvals',
  'Encrypted local mode',
  'Built for teams',
]

export default function LandingPage() {
  useEffect(() => {
    fetch('/api/v2/analytics?event=landing_view', { method: 'POST' }).catch(() => {})
  }, [])

  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <main className="min-h-screen bg-[#0b0d12] text-zinc-100 selection:bg-emerald-300 selection:text-black">
      <Header />

      <section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#0b0d12_0%,#0b0d12_100%)]">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-28">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <TerminalSquare size={14} />
              Built for real dev workflows
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-white md:text-6xl">
              Make envs and secrets part of the workflow - not the chaos.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
              Request access, approve securely, pull the right environment, and keep developers, CI, and agents aligned without passing
              {' '}
              <code className="rounded bg-zinc-900 px-2 py-1 text-emerald-300">.env</code>
              {' '}
              files around.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-6 py-4 font-semibold text-black transition hover:bg-emerald-200"
              >
                Get started
                <ChevronRight size={18} />
              </Link>
              <a
                href="https://github.com/envware/envware-go"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-6 py-4 font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
              >
                <Github size={18} />
                View on GitHub
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {workflowProof.map((item) => (
                <span key={item} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-2">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-12 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
              {painPoints.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <Check size={18} className="mt-0.5 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">workflow</span>
              </div>

              <div className="space-y-4 p-6 font-mono text-sm leading-7 text-zinc-300">
                <div className="text-zinc-500"># from messy handoff to repeatable workflow</div>
                {commands.map((line, index) => (
                  <div key={line} className={index === commands.length - 1 ? 'text-emerald-300' : ''}>
                    {line}
                  </div>
                ))}

                <div className="mt-6 rounded-2xl border border-zinc-800 bg-[#0f1416] p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">why teams keep it in the loop</div>
                  <p className="text-sm leading-7 text-zinc-300">
                    git-envware is not another place to store secrets and forget. It becomes the operational path for requesting, approving, syncing,
                    and protecting environments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">The problem</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">
              Most teams do not manage environments. They improvise them.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              git-envware replaces side-channel secrets, vague access rules, and "works on my machine" drift with one repeatable workflow for local
              development, CI, and team operations.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {workflowBenefits.map((benefit) => (
              <div key={benefit.title} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-7">
                <div className="mb-5 inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  <benefit.icon size={22} />
                </div>
                <h3 className="text-2xl font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-[#0b0d12]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">How it works</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">
              Less dashboard worship. More workflow.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              The point is not to create one more portal full of clicks. The point is to make environment access predictable where work already
              happens: terminal, Git, onboarding, CI, and approvals.
            </p>
          </div>

          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-300 font-mono text-sm font-bold text-black">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <p className="pt-1 text-base leading-7 text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-[#0e1117]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Where it becomes hard to remove</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-5xl">
              git-envware earns its place when the workflow gets real.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-400">
              This is where the product stops looking like "a tool for secrets" and starts acting like part of how the team actually ships.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {useCases.map((item, index) => (
              <div key={item.title} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-7">
                <div className="mb-3 font-mono text-sm text-emerald-300">use_case_{String(index + 1).padStart(2, '0')}</div>
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-900 bg-[#0b0d12]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Positioning</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
                More than a secret store. Less painful than enterprise vault theater.
              </h2>
              <div className="mt-8 grid gap-4 text-zinc-300 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="mb-2 font-mono text-sm text-zinc-500">without_git_envware</div>
                  <p className="leading-7 text-zinc-400">Files get shared manually, access becomes tribal knowledge, and security depends on luck plus whoever still remembers the setup.</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="mb-2 font-mono text-sm text-emerald-300">with_git_envware</div>
                  <p className="leading-7 text-zinc-400">Access follows a workflow, identity matters, environments stay aligned, and the team gets something secure that people will actually use.</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 md:col-span-2">
                  <div className="mb-2 font-mono text-sm text-emerald-300">core_idea</div>
                  <p className="leading-7 text-zinc-400">If envs are part of the job, git-envware should be part of the workflow.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-400/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.03))] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">CTA</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em] text-white md:text-4xl">
                Start with the CLI. Bring the team when ready.
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-200/80">
                Keep the homepage sharp, the docs useful, and the workflow obvious. No oversized simulator trying to sing a musical before the user even knows the pain.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-6 py-4 font-semibold text-black transition hover:bg-emerald-200"
                >
                  Read the docs
                  <ChevronRight size={18} />
                </Link>
                <a
                  href="https://github.com/envware/envware-go"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-6 py-4 font-semibold text-white transition hover:border-white/20 hover:bg-black/30"
                >
                  <Github size={18} />
                  Source code
                </a>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck size={16} className="text-emerald-200" />
                  Product north star
                </div>
                <p className="leading-7 text-zinc-200/75">
                  git-envware should not feel like a place where configs live. It should feel like the right way to handle environments, secrets, and access in real work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0b0d12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 text-sm text-zinc-500 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <div className="font-mono text-zinc-300">git-envware</div>
            <p className="mt-2">CLI-first workflow for environments, secrets, and access.</p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/docs" className="transition hover:text-zinc-200">Docs</Link>
            <a href="https://github.com/envware/envware-go" target="_blank" rel="noopener noreferrer" className="transition hover:text-zinc-200">GitHub</a>
            <span>© {year} git-envware</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
