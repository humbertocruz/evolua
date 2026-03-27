import Link from "next/link";
import type { CSSProperties } from "react";
import type { EvoluaNode } from "@/evolua/types";

function getNodeStyle(visual: Record<string, unknown> | undefined, nodeId: string): CSSProperties {
  const nodeVisual = visual?.[nodeId] as Record<string, unknown> | undefined;
  return {
    color: (nodeVisual?.color as string) ?? undefined,
    opacity: nodeVisual?.tone === "muted" ? 0.7 : undefined,
  };
}

function renderNode(node: EvoluaNode, visual?: Record<string, unknown>): React.ReactNode {
  const style = getNodeStyle(visual, node.id);

  switch (node.kind) {
    case "heading":
      return (
        <h1 key={node.id} className="text-4xl font-semibold tracking-tight" style={style}>
          {node.text}
        </h1>
      );
    case "paragraph":
      return (
        <p key={node.id} className="max-w-2xl text-base leading-7 text-zinc-600" style={style}>
          {node.text}
        </p>
      );
    case "text":
      return (
        <p key={node.id} className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500" style={style}>
          {node.text}
        </p>
      );
    case "link":
      return (
        <Link
          key={node.id}
          href={node.href ?? "#"}
          className="text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
          style={style}
        >
          {node.text}
        </Link>
      );
    default:
      return null;
  }
}

export function normalizePathFromSlug(slug?: string[]) {
  if (!slug || slug.length === 0) return "/";
  return `/${slug.join("/")}`;
}

export function renderPage(
  page: { nodes: unknown; visual?: unknown },
  options: { className?: string } = {}
) {
  const nodes = page.nodes as EvoluaNode[];
  const visual = page.visual as Record<string, unknown> | undefined;

  return (
    <main className={`flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-950 ${options.className ?? ""}`}>
      <section className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        {nodes.map((node) => renderNode(node, visual))}
      </section>
    </main>
  );
}
