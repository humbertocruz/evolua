import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ForgotPasswordPage",
  description: "Materialized from the Evolu[a] canonical app model",
};

export default function Page() {
  return (
    <>
      <div style={{ background: "#09090b", color: "#f4f4f5" }}>
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
<section className="w-full rounded-3xl bg-[var(--card)] text-[var(--card-foreground)] shadow-2xl p-8 flex flex-col max-w-md gap-4">
<div className="text-3xl font-bold">Recuperar senha</div>
<div className="text-sm text-zinc-600">Insira seu e-mail para receber as instruções.</div>
<label className="flex flex-col gap-2 text-sm text-zinc-700">
  <span>E-mail</span>
  <input type="email" placeholder="E-mail" className="h-11 rounded-xl border border-zinc-300 px-3 outline-none focus:border-zinc-900" />
</label>
<button className="h-11 rounded-xl font-semibold transition-colors hover:opacity-90 bg-[var(--primary)] text-[var(--primary-foreground)]">Enviar instruções</button>
</section>
</main>
      </div>
    </>
  );
}
