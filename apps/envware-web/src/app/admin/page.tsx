import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  FolderKanban,
  KeyRound,
  Lock,
  ShieldCheck,
  Smartphone,
  Users,
  Wifi,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWebSession } from '@/lib/web-session'

export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_STATS_PASSWORD || 'prijok@131801'

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function relativeTime(value: Date) {
  const diffMs = new Date(value).getTime() - Date.now()
  const absMinutes = Math.round(Math.abs(diffMs) / 60000)

  if (absMinutes < 1) return 'just now'
  if (absMinutes < 60) return `${absMinutes}m ${diffMs < 0 ? 'ago' : 'from now'}`

  const absHours = Math.round(absMinutes / 60)
  if (absHours < 24) return `${absHours}h ${diffMs < 0 ? 'ago' : 'from now'}`

  const absDays = Math.round(absHours / 24)
  return `${absDays}d ${diffMs < 0 ? 'ago' : 'from now'}`
}

function initials(name?: string | null, email?: string | null) {
  const base = name?.trim() || email?.trim() || '?'
  return base.slice(0, 2).toUpperCase()
}

export default async function AdminPage(props: any) {
  const searchParams = await (props?.searchParams || {})
  const pw = searchParams?.pw
  const webSession = await getWebSession()
  
  // Verificar se é admin por senha ou por flag no banco
  let isSuperAdmin = false
  
  if (pw === ADMIN_PASSWORD) {
    isSuperAdmin = true
  } else if (webSession) {
    // Verificar no banco se o usuário tem isAdmin=true
    const user = await prisma.user.findUnique({
      where: { id: webSession.userId },
      select: { isAdmin: true }
    })
    isSuperAdmin = user?.isAdmin === true
  }
  
  if (!isSuperAdmin) {
    redirect('/dashboard')
  }

  try {
    const [
      totalUsers,
      totalKeys,
      totalTeams,
      totalProjects,
      verifiedTeams,
      rawAnalytics,
      pendingRequests,
      recentRequests,
      teams,
      projects,
      recentUsers,
      recentKeys,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sshKey.count(),
      prisma.team.count(),
      prisma.project.count(),
      prisma.team.count({ where: { isVerified: true } }),
      prisma.analytic.findMany(),
      prisma.projectRequest.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          user: { select: { email: true, name: true } },
          project: {
            select: {
              name: true,
              slug: true,
              team: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      prisma.projectRequest.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { email: true, name: true } },
          project: {
            select: {
              name: true,
              slug: true,
              team: { select: { slug: true } },
            },
          },
        },
      }),
      prisma.team.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: {
          owner: { select: { name: true, email: true } },
          members: {
            include: {
              user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          projects: {
            select: {
              id: true,
              name: true,
              slug: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: 'desc' },
          },
        },
      }),
      prisma.project.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: {
          team: { select: { name: true, slug: true } },
          members: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          projectKeys: true,
          requests: {
            where: { status: 'PENDING' },
          },
        },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: true,
          sshKeys: true,
        },
      }),
      prisma.sshKey.findMany({
        take: 6,
        orderBy: [{ lastUsedAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    const analytics = {
      pageViews: rawAnalytics.find((a) => a.event === 'landing_view')?.count || 0,
      docsViews: rawAnalytics.find((a) => a.event === 'docs_view')?.count || 0,
      installDownloads: rawAnalytics.find((a) => a.event === 'install_script')?.count || 0,
    }

    const totalMembers = teams.reduce((acc, team) => acc + team.members.length, 0)
    const totalPending = pendingRequests.length
    const activeProjects = projects.filter((project) => project.projectKeys.length > 0).length

    return (
      <main className="min-h-screen bg-[#0b0d12] text-zinc-100 selection:bg-emerald-300 selection:text-black">
        <section className="border-b border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_32%),linear-gradient(180deg,#0b0d12_0%,#0b0d12_100%)]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <Smartphone size={14} />
                  Envware control surface
                </div>
                <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
                  Governance, approvals, and operational visibility.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
                  This is the companion side of Envware: fast approvals, project visibility, member access, and lightweight operational insight. The CLI does the work. This surface keeps control in reach.
                </p>
                {webSession ? (
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                    Paired as {webSession?.name || webSession?.email}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-3 font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
                >
                  Docs
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 font-semibold text-black transition hover:bg-emerald-200"
                >
                  Public site
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-[#0e1117]">
          <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 sm:grid-cols-2 xl:grid-cols-7 lg:px-10">
            {[
              { label: 'Users', value: totalUsers, tone: 'text-white', icon: Users },
              { label: 'SSH keys', value: totalKeys, tone: 'text-emerald-300', icon: KeyRound },
              { label: 'Teams', value: totalTeams, tone: 'text-sky-300', icon: ShieldCheck },
              { label: 'Projects', value: totalProjects, tone: 'text-violet-300', icon: FolderKanban },
              { label: 'Verified teams', value: verifiedTeams, tone: 'text-teal-300', icon: ShieldCheck },
              { label: 'Pending approvals', value: totalPending, tone: 'text-amber-300', icon: Activity },
              { label: 'Projects with keys', value: activeProjects, tone: 'text-fuchsia-300', icon: Lock },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
                <div className="mb-4 inline-flex rounded-2xl border border-white/8 bg-black/20 p-3 text-zinc-300">
                  <item.icon size={18} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{item.label}</div>
                <div className={`mt-3 text-3xl font-black ${item.tone}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-[#0b0d12]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-6 flex items-center gap-3 text-emerald-300">
                <ShieldCheck size={20} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Pending approvals</span>
              </div>
              <h2 className="text-3xl font-black tracking-[-0.03em] text-white">Requests that need a human with a spine</h2>
              <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
                Keep approvals fast, but never sloppy. This is exactly the kind of surface that works well on mobile or as a PWA later: glance, verify fingerprint, approve or deny, move on.
              </p>

              <div className="mt-8 space-y-4">
                {pendingRequests.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-800 bg-black/20 p-6 text-zinc-400">
                    No pending requests right now. Miracles happen. 🌸
                  </div>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="rounded-3xl border border-zinc-800 bg-black/20 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-sm font-bold text-emerald-300">
                              {initials(request.user.name, request.user.email)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{request.user.name || request.user.email}</div>
                              <div className="text-sm text-zinc-500">{request.user.email}</div>
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                            <span className="rounded-full border border-zinc-800 px-3 py-2">{request.project.team.slug}</span>
                            <span className="rounded-full border border-zinc-800 px-3 py-2">{request.project.slug}</span>
                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-200">{request.role}</span>
                          </div>
                        </div>

                        <div className="text-sm text-zinc-500 lg:text-right">
                          <div>{formatDate(request.createdAt)}</div>
                          <div className="mt-1">{relativeTime(request.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
                <div className="mb-5 flex items-center gap-3 text-emerald-300">
                  <Wifi size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.22em]">Adoption signals</span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Landing views', value: analytics.pageViews, desc: 'How much attention the public story is getting.' },
                    { label: 'Docs views', value: analytics.docsViews, desc: 'How often people move from curiosity to activation.' },
                    { label: 'Install fetches', value: analytics.installDownloads, desc: 'The closest thing to “show me the workflow”.' },
                    { label: 'Members in sampled teams', value: totalMembers, desc: 'A rough view of collaboration gravity.' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.label}</div>
                      <div className="mt-2 text-2xl font-black text-white">{item.value}</div>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[30px] border border-amber-400/20 bg-amber-400/10 p-8">
                <div className="mb-4 flex items-center gap-3 text-amber-100">
                  <KeyRound size={18} />
                  <span className="text-sm font-semibold uppercase tracking-[0.22em]">Companion app rule</span>
                </div>
                <h3 className="text-2xl font-black text-white">Visibility and approvals, yes. Secret viewer, no.</h3>
                <p className="mt-4 leading-7 text-amber-50/85">
                  If this becomes a PWA, keep it focused on access, audit, requests, and project visibility. The second it becomes a pocket-sized secret browser, the elegance goes out the window and the risk walks in wearing your shoes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-[#0e1117]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:px-10">
            <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-6 flex items-center gap-3 text-emerald-300">
                <Users size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Teams and members</span>
              </div>
              <div className="space-y-5">
                {teams.map((team) => (
                  <div key={team.id} className="rounded-3xl border border-zinc-800 bg-black/20 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{team.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{team.slug}</span>
                          <span className={`rounded-full px-3 py-2 ${team.isVerified ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
                            {team.isVerified ? 'verified' : 'pending verification'}
                          </span>
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{team.projects.length} projects</span>
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{team.members.length} members</span>
                        </div>
                      </div>
                      <div className="text-sm text-zinc-500">
                        Owner: {team.owner.name || team.owner.email}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {team.members.slice(0, 6).map((member) => (
                        <div key={member.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-[11px] font-bold text-emerald-300">
                            {initials(member.user.name, member.user.email)}
                          </span>
                          <span>{member.user.name || member.user.email}</span>
                          <span className="text-zinc-500">· {member.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-6 flex items-center gap-3 text-emerald-300">
                <FolderKanban size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Project inventory</span>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="rounded-3xl border border-zinc-800 bg-black/20 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white">{project.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{project.team.slug}</span>
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{project.slug}</span>
                          <span className="rounded-full border border-zinc-800 px-3 py-2">{project.members.length} members</span>
                          <span className={`rounded-full px-3 py-2 ${project.projectKeys.length > 0 ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border border-zinc-800 text-zinc-400'}`}>
                            {project.projectKeys.length > 0 ? `${project.projectKeys.length} key records` : 'no keys yet'}
                          </span>
                          {project.requests.length > 0 ? (
                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-amber-100">
                              {project.requests.length} pending
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-500">Updated {relativeTime(project.updatedAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-900 bg-[#0b0d12]">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
            <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-6 flex items-center gap-3 text-emerald-300">
                <Activity size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Recent activity</span>
              </div>
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{request.user.name || request.user.email}</div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {request.project.team.slug}/{request.project.slug} · {request.role}
                        </div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${request.status === 'PENDING' ? 'bg-amber-400/10 text-amber-100' : 'bg-emerald-400/10 text-emerald-200'}`}>
                        {request.status}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">Updated {relativeTime(request.updatedAt)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-zinc-800 bg-zinc-950/70 p-8">
              <div className="mb-6 flex items-center gap-3 text-emerald-300">
                <KeyRound size={18} />
                <span className="text-sm font-semibold uppercase tracking-[0.22em]">Identity and devices</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Recent signups</h3>
                  {recentUsers.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                      <div className="font-semibold text-white">{user.name || user.email}</div>
                      <div className="mt-1 text-sm text-zinc-400">{user.email}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        <span className="rounded-full border border-zinc-800 px-3 py-2">{user.subscriptionStatus}</span>
                        <span className="rounded-full border border-zinc-800 px-3 py-2">{user.memberships.length} memberships</span>
                        <span className="rounded-full border border-zinc-800 px-3 py-2">{user.sshKeys.length} keys</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Recent key activity</h3>
                  {recentKeys.map((key) => (
                    <div key={key.id} className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
                      <div className="font-semibold text-white">{key.user.name || key.user.email}</div>
                      <div className="mt-1 text-sm text-zinc-400">{key.name || 'Unnamed device'}</div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        <span className={`rounded-full px-3 py-2 ${key.isVerified ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>
                          {key.isVerified ? 'verified' : 'not verified'}
                        </span>
                        <span className="rounded-full border border-zinc-800 px-3 py-2">
                          {key.lastUsedAt ? `used ${relativeTime(key.lastUsedAt)}` : `created ${relativeTime(key.createdAt)}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  } catch (error: any) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] px-6 text-zinc-100">
        <div className="max-w-xl rounded-[28px] border border-red-400/20 bg-red-400/10 p-8 text-center">
          <h1 className="text-3xl font-black text-white">Database connection error</h1>
          <p className="mt-4 leading-7 text-red-50/85">{error.message}</p>
        </div>
      </main>
    )
  }
}
