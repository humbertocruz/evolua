import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import type { EvoluaPage, EvoluaNode } from "@/evolua/types";

function getNodeStyle(page: EvoluaPage, nodeId: string): CSSProperties {
  const visual = page.visual?.[nodeId];
  return {
    color: visual?.color,
    opacity: visual?.tone === "muted" ? 0.7 : undefined,
  };
}

function renderNode(page: EvoluaPage, node: EvoluaNode): ReactNode {
  const style = getNodeStyle(page, node.id);

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

export function renderPage(page: EvoluaPage) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-950">
      <section className="flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
        {page.nodes.map((node) => renderNode(page, node))}
      </section>
    </main>
  );
}
