import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no app Evolu[a].",
};

export default function Page() {
  return (
    <>
      <div style={{ background: "#09090b", color: "#f4f4f5" }}>
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
<section className="w-full rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl p-8 flex flex-col max-w-md gap-4">
<div className="text-3xl font-bold">Entrar</div>
<label className="flex flex-col gap-2 text-sm text-zinc-700">
  <span>E-mail</span>
  <input type="email" placeholder="E-mail" className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900" />
</label>
<label className="flex flex-col gap-2 text-sm text-zinc-700">
  <span>Senha</span>
  <input type="password" placeholder="Senha" className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900" />
</label>
<button className="h-11 rounded-xl font-semibold transition-colors hover:opacity-90 bg-[var(--primary)] text-[var(--primary-foreground)]">Entrar</button>
<a href="/forgot-password" className="text-left transition-colors hover:opacity-80 text-blue-500 underline underline-offset-4">Esqueci senha</a>
</section>
</main>
      </div>
    </>
  );
}
