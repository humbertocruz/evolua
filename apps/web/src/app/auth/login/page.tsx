"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/evolua";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">Evolu[a]</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Entrar</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                placeholder="seu@email.com"
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-zinc-700">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                placeholder="••••••••"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Não tem conta?{" "}
            <a href="/auth/register" className="text-violet-600 underline">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
