"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      // Auto login after register
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Conta criada. Faça login.");
        router.push("/auth/login");
      } else {
        router.push("/evolua");
      }
    } catch {
      setError("Erro ao criar conta.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-violet-100 bg-white p-8 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">Evolu[a]</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Criar conta</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <label className="block space-y-1">
              <span className="text-sm font-medium text-zinc-700">Nome</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                placeholder="Seu nome"
                required
              />
            </label>

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
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <a href="/auth/login" className="text-violet-600 underline">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
