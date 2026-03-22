import Link from "next/link";

export default function EvoluaDatasourcesPage() {
  return (
    <section className="flex flex-col gap-6 rounded-[28px] border border-violet-100/80 bg-white p-8 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">/evolua/datasources</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Datasources</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Área reservada para mocks, APIs e conectores que alimentarão o modelo do app. Ainda é só a casca,
          mas já existe o namespace certo para crescer sem bagunça.
        </p>
      </div>

      <Link href="/evolua" className="text-sm font-medium text-violet-700 underline underline-offset-4">
        Voltar para o dashboard
      </Link>
    </section>
  );
}
