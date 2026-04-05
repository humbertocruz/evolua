"use client";

import { useState, useTransition } from "react";

type ExportMode = "local" | "eject";

interface DeployPanelProps {
  page: {
    id: string;
    title: string;
    path: string;
    status: string;
  };
  project: {
    id: string;
    slug: string;
    name: string;
    apiKey: string;
  };
}

export function DeployPanel({ page, project }: DeployPanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ExportMode | null>(null);
  const [ejectProjectName, setEjectProjectName] = useState(
    project.name.replace(/\s+/g, "-").toLowerCase()
  );
  const [ejectResult, setEjectResult] = useState<{ downloadUrl?: string; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleExport(selectedMode: ExportMode) {
    setMode(selectedMode);
    setEjectResult(null);
    setOpen(true);
  }

  function handleEject() {
    startTransition(async () => {
      setEjectResult(null);
      const { ejectProjectAction } = await import("@/app/evolua/actions");
      const result = await ejectProjectAction(project.id, ejectProjectName);
      setEjectResult(result);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
      >
        📦 Exportar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Exportar Projeto</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setMode(null);
                  setEjectResult(null);
                }}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            {/* ─── Option cards ─── */}
            {!mode && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ExportOptionCard
                  icon="💻"
                  title="Next.js Local"
                  description="Instruções para conectar ao seu projeto Next.js existente"
                  onClick={() => handleExport("local")}
                />
                <ExportOptionCard
                  icon="📦"
                  title="Eject"
                  description="Gerar e baixar o projeto completo como zip"
                  onClick={() => handleExport("eject")}
                />
              </div>
            )}

            {/* ─── Local instructions ─── */}
            {mode === "local" && (
              <LocalExportInstructions
                project={project}
                page={page}
                onBack={() => setMode(null)}
              />
            )}

            {/* ─── Eject form ─── */}
            {mode === "eject" && (
              <EjectForm
                project={project}
                ejectProjectName={ejectProjectName}
                setEjectProjectName={setEjectProjectName}
                ejectResult={ejectResult}
                isPending={isPending}
                onEject={handleEject}
                onBack={() => setMode(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ExportOptionCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-zinc-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
    >
      <span className="text-2xl">{icon}</span>
      <h3 className="mt-2 font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </button>
  );
}

function LocalExportInstructions({
  project,
  page,
  onBack,
}: {
  project: DeployPanelProps["project"];
  page: DeployPanelProps["page"];
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Voltar
      </button>

      <div className="space-y-3">
        <h3 className="font-semibold text-zinc-900">Exportar para Next.js Local</h3>
        <p className="text-sm text-zinc-600">
          Siga os passos abaixo no seu projeto Next.js existente:
        </p>
      </div>

      <ol className="space-y-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm">
        <Step num={1} title="Instale o pacote @evolua/next">
          <code className="text-xs text-indigo-600">npm install @evolua/next @evolua/runtime @evolua/ui @evolua/db</code>
        </Step>

        <Step num={2} title="Baixe o package.json do projeto">
          <a
            href="/api/download/package-json"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline"
          >
            /api/download/package-json
          </a>
          {" "}(substitua o package.json do seu projeto)
        </Step>

        <Step num={3} title="Copie os arquivos do Evolu[a] no seu src/app/">
          Adicione os arquivos de renderização na pasta{" "}
          <code className="text-xs">src/evolua/</code> do seu projeto.
        </Step>

        <Step num={4} title="Configure as variáveis de ambiente">
          <code className="block text-xs text-indigo-600">
            NEXT_PUBLIC_EVOLUA_API_KEY={project.apiKey.slice(0, 8)}...
          </code>
          <code className="block text-xs text-indigo-600">
            NEXT_PUBLIC_EVOLUA_API_URL={
              typeof window !== "undefined" ? window.location.origin : "https://seu-servidor.com"
            }
          </code>
        </Step>

        <Step num={5} title="Cole no seu layout.tsx">
          <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-zinc-900 p-3 text-xs text-zinc-100">
{`import { EvoluProvider } from "@evolua/next/client";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <EvoluProvider apiKey={process.env.NEXT_PUBLIC_EVOLUA_API_KEY}>
          {children}
        </EvoluProvider>
      </body>
    </html>
  );`}
          </pre>
        </Step>

        <Step num={6} title="Cole no seu app/page.tsx">
          <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-zinc-900 p-3 text-xs text-zinc-100">
{`import { EvoluPage } from "@evolua/next";

export default function Home() {
  return <EvoluPage />;
}`}
          </pre>
        </Step>

        <Step num={7} title="Rode npm install && npm run dev">
          Sua página <code className="text-xs">{page.path}</code> será renderizada via Evolu[a]! 🚀
        </Step>
      </ol>

      <p className="text-xs text-zinc-400">
        💡 Sua API Key completa:{" "}
        <code className="break-all text-xs text-indigo-400">{project.apiKey}</code>
      </p>
    </div>
  );
}

function EjectForm({
  project,
  ejectProjectName,
  setEjectProjectName,
  ejectResult,
  isPending,
  onEject,
  onBack,
}: {
  project: DeployPanelProps["project"];
  ejectProjectName: string;
  setEjectProjectName: (v: string) => void;
  ejectResult: { downloadUrl?: string; error?: string } | null;
  isPending: boolean;
  onEject: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Voltar
      </button>

      <div className="space-y-1">
        <h3 className="font-semibold text-zinc-900">Eject — Gerar Projeto</h3>
        <p className="text-sm text-zinc-600">
          Gera um projeto Next.js completo com suas páginas e faz o download como
          zip. Você deploya manualmente onde quiser (Vercel, Netlify, etc).
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-sm font-medium text-zinc-700">Nome do projeto</span>
        <input
          type="text"
          value={ejectProjectName}
          onChange={(e) => setEjectProjectName(e.target.value)}
          placeholder="meu-projeto"
          className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
        />
      </label>

      {ejectResult?.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ❌ {ejectResult.error}
        </div>
      )}

      {ejectResult?.downloadUrl ? (
        <div className="space-y-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <p>✅ Projeto gerado com sucesso!</p>
          <a
            href={ejectResult.downloadUrl}
            className="block rounded-xl bg-green-600 px-4 py-2 text-center font-medium text-white hover:bg-green-700"
          >
            ⬇️ Baixar ZIP
          </a>
        </div>
      ) : (
        <button
          onClick={onEject}
          disabled={isPending || !ejectProjectName.trim()}
          className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {isPending ? "⏳ Gerando projeto..." : "📦 Gerar e Baixar ZIP"}
        </button>
      )}
    </div>
  );
}

function Step({
  num,
  title,
  children,
}: {
  num: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
        {num}
      </span>
      <div className="flex-1 space-y-1">
        <p className="font-medium text-zinc-700">{title}</p>
        <div className="text-zinc-600">{children}</div>
      </div>
    </li>
  );
}
