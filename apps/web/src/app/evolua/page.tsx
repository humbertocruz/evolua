import Link from "next/link";

const primaryCards = [
  {
    title: "Pages",
    description: "Abrir e operar as páginas semânticas do app sem cair no page.tsx no braço.",
    href: "/evolua/pages",
    stat: "3 páginas",
  },
  {
    title: "Components",
    description: "Reservar os blocos reutilizáveis que vão nascer do modelo.",
    href: "/evolua/components",
    stat: "namespace pronto",
  },
  {
    title: "Datasources",
    description: "Conectar mocks, APIs e dados sem transformar tudo num carnaval de acoplamento.",
    href: "/evolua/datasources",
    stat: "casca pronta",
  },
];

const nextSteps = [
  "listar páginas com preview e navegação",
  "editar propriedades básicas do modelo por UI",
  "abrir caminho para nodes, visual e actions semânticas",
];

export default function EvoluaHomePage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-[30px] border border-violet-100/80 bg-white px-6 py-7 shadow-[0_8px_30px_rgba(76,29,149,0.04)] lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-400">/evolua</p>
        <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">Dashboard do núcleo do modelo</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-600 lg:text-base">
              Um ponto central para operar o Evolu[a] por estrutura e intenção. Continua clean,
              mas agora com um pouco mais de identidade.
            </p>
          </div>

          <div className="rounded-[24px] bg-violet-50/70 p-5 ring-1 ring-violet-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-400">North Star</p>
            <p className="mt-3 text-sm leading-6 text-violet-950/80">
              O Next renderiza. O Evolu[a] pensa o app.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {primaryCards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[26px] border border-violet-100/80 bg-white p-5 shadow-[0_8px_24px_rgba(76,29,149,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(76,29,149,0.08)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">{item.stat}</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[26px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">Visão atual</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Host validado</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              O modelo já resolve `/`, `/login` e `/forgot-password` por rota dinâmica dentro do host Next,
              sem precisar de um arquivo visual dedicado por tela.
            </p>
          </article>

          <article className="rounded-[26px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">Próximo alvo</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Editor semântico real</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              O próximo passo é transformar esse cockpit em operação concreta: editar páginas, nodes,
              visual e dados sem depender de código textual como superfície principal.
            </p>
          </article>
        </section>

        <aside className="rounded-[26px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">Roadmap imediato</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
            {nextSteps.map((step) => (
              <li key={step} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
